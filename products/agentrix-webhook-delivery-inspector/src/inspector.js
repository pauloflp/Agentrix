import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const LIMITS = Object.freeze({
  maxBytes: 5 * 1024 * 1024,
  maxLines: 10000,
  maxLineBytes: 16384,
  maxGroups: 5000,
});

const REQUIRED = ['event_id', 'endpoint_id', 'attempt', 'timestamp', 'status_code'];
const RFC3339 = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/;
const ID = /^[A-Za-z0-9._:-]{1,128}$/;

export class InputError extends Error {
  constructor(message, line = null) {
    super(message);
    this.name = 'InputError';
    this.line = line;
  }
}

function validTimestamp(s) {
  if (typeof s !== 'string') return false;
  const m = RFC3339.exec(s);
  if (!m) return false;
  const [year, month, day, hour, minute, second] = m.slice(1, 7).map(Number);
  if (year < 1970 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return false;
  const zone = m[8];
  const offsetHours = zone === 'Z' ? 0 : Number(zone.slice(1, 3));
  const offsetMinutes = zone === 'Z' ? 0 : Number(zone.slice(4, 6));
  if (offsetHours > 23 || offsetMinutes > 59) return false;
  const utc = Date.UTC(year, month - 1, day, hour, minute, second);
  const normalized = new Date(utc);
  if (normalized.getUTCFullYear() !== year || normalized.getUTCMonth() + 1 !== month || normalized.getUTCDate() !== day || normalized.getUTCHours() !== hour || normalized.getUTCMinutes() !== minute || normalized.getUTCSeconds() !== second) return false;
  return Number.isFinite(Date.parse(s));
}

function readRow(line, lineNumber) {
  let row;
  try { row = JSON.parse(line); } catch { throw new InputError('Malformed JSONL record', lineNumber); }
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw new InputError('Record must be a JSON object', lineNumber);
  const keys = Object.keys(row);
  if (keys.length !== REQUIRED.length || keys.some((key) => !REQUIRED.includes(key))) throw new InputError('Record must contain only the five documented metadata fields', lineNumber);
  if (!ID.test(row.event_id) || !ID.test(row.endpoint_id)) throw new InputError('Invalid event_id or endpoint_id', lineNumber);
  if (!Number.isSafeInteger(row.attempt) || row.attempt < 1 || row.attempt > 100000) throw new InputError('Invalid attempt number', lineNumber);
  if (!Number.isInteger(row.status_code) || row.status_code < 100 || row.status_code > 599) throw new InputError('Invalid HTTP status code', lineNumber);
  if (!validTimestamp(row.timestamp)) throw new InputError('Invalid RFC3339 timestamp', lineNumber);
  return row;
}

function fingerprint(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 20);
}

export function inspectText(text, options = {}) {
  const maxAttempts = options.maxAttempts ?? 3;
  const errorRateThreshold = options.errorRateThreshold ?? 50;
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 100000) throw new InputError('Invalid maxAttempts option');
  if (!Number.isFinite(errorRateThreshold) || errorRateThreshold < 0 || errorRateThreshold > 100) throw new InputError('Invalid errorRateThreshold option');
  if (typeof text !== 'string' || Buffer.byteLength(text, 'utf8') > LIMITS.maxBytes) throw new InputError('Input exceeds 5 MiB limit or is not UTF-8 text');
  if (text.startsWith('\uFEFF')) throw new InputError('BOM is not supported');
  const lines = text.split(/\n/);
  if (lines.at(-1) === '') lines.pop();
  if (lines.length > LIMITS.maxLines) throw new InputError('Input exceeds 10000 line limit');
  if (lines.length === 0) throw new InputError('Input must contain at least one record');

  const groups = new Map();
  const endpoints = new Map();
  let duplicateLogRows = 0;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].replace(/\r$/, '');
    if (!raw || Buffer.byteLength(raw, 'utf8') > LIMITS.maxLineBytes) throw new InputError('Empty or oversized record', i + 1);
    const row = readRow(raw, i + 1);
    const groupKey = JSON.stringify([row.event_id, row.endpoint_id]);
    if (!groups.has(groupKey)) {
      if (groups.size >= LIMITS.maxGroups) throw new InputError('Input exceeds 5000 event/endpoint groups');
      groups.set(groupKey, { event_id: row.event_id, endpoint_id: row.endpoint_id, attempts: new Map(), conflicts: new Set() });
    }
    const group = groups.get(groupKey);
    const prior = group.attempts.get(row.attempt);
    if (prior) {
      if (prior.status_code === row.status_code && prior.timestamp === row.timestamp) duplicateLogRows++;
      else group.conflicts.add(row.attempt);
      continue;
    }
    group.attempts.set(row.attempt, { attempt: row.attempt, status_code: row.status_code, timestamp: row.timestamp });
    const endpoint = endpoints.get(row.endpoint_id) || { attempts: 0, http_errors: 0, groups: 0 };
    endpoint.attempts++;
    if (row.status_code >= 400) endpoint.http_errors++;
    endpoints.set(row.endpoint_id, endpoint);
  }

  const alerts = [];
  const groupRows = [...groups.values()].sort((a, b) => a.endpoint_id.localeCompare(b.endpoint_id, 'en') || a.event_id.localeCompare(b.event_id, 'en'));
  for (const group of groupRows) {
    const endpoint = endpoints.get(group.endpoint_id);
    endpoint.groups++;
    const attempts = [...group.attempts.values()].sort((a, b) => a.attempt - b.attempt);
    const successes = attempts.filter((a) => a.status_code >= 200 && a.status_code < 300);
    const ref = { endpoint_ref: fingerprint(group.endpoint_id), event_ref: fingerprint(group.event_id) };
    if (group.conflicts.size) alerts.push({ code: 'ATTEMPT_CONFLICT', ...ref, attempt_numbers: [...group.conflicts].sort((a,b)=>a-b) });
    if (successes.length > 1) alerts.push({ code: 'MULTIPLE_SUCCESSES', ...ref, success_count: successes.length });
    if (successes.length === 0) alerts.push({ code: 'NO_SUCCESS', ...ref, attempt_count: attempts.length });
    if (attempts.length > maxAttempts) alerts.push({ code: 'EXCESSIVE_ATTEMPTS', ...ref, attempt_count: attempts.length, limit: maxAttempts });
  }
  const endpointRows = [...endpoints.entries()].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([id, metrics]) => {
    const rate = Number((100 * metrics.http_errors / metrics.attempts).toFixed(2));
    if (rate > errorRateThreshold) alerts.push({ code: 'HIGH_ERROR_RATE', endpoint_ref: fingerprint(id), error_rate_percent: rate, threshold_percent: errorRateThreshold });
    return { endpoint_ref: fingerprint(id), ...metrics, error_rate_percent: rate };
  });
  alerts.sort((a, b) => a.code.localeCompare(b.code, 'en') || (a.endpoint_ref || '').localeCompare(b.endpoint_ref || '', 'en') || (a.event_ref || '').localeCompare(b.event_ref || '', 'en'));
  return {
    schema_version: 1,
    summary: { input_rows: lines.length, unique_attempts: endpointRows.reduce((s, e) => s + e.attempts, 0), duplicate_log_rows: duplicateLogRows, event_endpoint_groups: groups.size, endpoint_count: endpointRows.length, alert_count: alerts.length },
    endpoints: endpointRows,
    alerts,
  };
}

export function inspectFile(path, options = {}) {
  let stats;
  try { stats = statSync(path); } catch { throw new InputError('Cannot read input file'); }
  if (!stats.isFile() || stats.size > LIMITS.maxBytes) throw new InputError('Input must be a regular file at most 5 MiB');
  let content;
  try { content = readFileSync(path, { encoding: 'utf8' }); } catch { throw new InputError('Cannot read input file'); }
  if (content.includes('\uFFFD')) throw new InputError('Invalid UTF-8 input');
  return inspectText(content, options);
}
