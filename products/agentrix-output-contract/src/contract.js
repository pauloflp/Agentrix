/**
 * Small, intentionally strict JSON Schema subset validator. No network/dependencies.
 * It does NOT implement full JSON Schema. Unsupported keywords fail schema validation.
 */
import { isDeepStrictEqual } from 'node:util';

const TYPES = new Set(['null', 'boolean', 'object', 'array', 'number', 'integer', 'string']);
const KEYWORDS = new Set(['type', 'properties', 'required', 'additionalProperties', 'items', 'enum']);
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const plain = (obj) => obj !== null && typeof obj === 'object' && !Array.isArray(obj);
const pointer = (base, segment) => `${base}/${String(segment).replaceAll('~', '~0').replaceAll('/', '~1')}`;
const schemaError = (path, code) => ({ path: path || '/', code, message: `Invalid schema (${code})` });
const violation = (path, code) => ({ path: path || '/', code, message: `Contract violation (${code})` });

/** Validate the schema itself. Returns diagnostics, without embedding input or schema values. */
export function inspectSchema(schema, { maxDepth = 64, maxNodes = 10000 } = {}) {
  const errors = [];
  let visited = 0;
  function check(s, path, depth) {
    if (++visited > maxNodes) { errors.push(schemaError(path, 'schema_too_large')); return; }
    if (depth > maxDepth) { errors.push(schemaError(path, 'schema_too_deep')); return; }
    if (!plain(s)) { errors.push(schemaError(path, 'schema_must_be_object')); return; }
    for (const k of Object.keys(s)) {
      if (!KEYWORDS.has(k)) errors.push(schemaError(pointer(path, k), 'unsupported_keyword'));
    }
    if (has(s, 'type')) {
      const t = s.type;
      if (typeof t === 'string') {
        if (!TYPES.has(t)) errors.push(schemaError(pointer(path, 'type'), 'invalid_type'));
      } else if (!Array.isArray(t) || t.length === 0 || !t.every(x => typeof x === 'string' && TYPES.has(x)) || new Set(t).size !== t.length) {
        errors.push(schemaError(pointer(path, 'type'), 'invalid_type'));
      }
    }
    if (has(s, 'required') && (!Array.isArray(s.required) || !s.required.every(x => typeof x === 'string') || new Set(s.required).size !== s.required.length)) {
      errors.push(schemaError(pointer(path, 'required'), 'invalid_required'));
    }
    if (has(s, 'properties')) {
      if (!plain(s.properties)) errors.push(schemaError(pointer(path, 'properties'), 'invalid_properties'));
      else for (const [k, v] of Object.entries(s.properties)) check(v, pointer(pointer(path, 'properties'), k), depth + 1);
    }
    if (has(s, 'additionalProperties') && typeof s.additionalProperties !== 'boolean') {
      if (!plain(s.additionalProperties)) errors.push(schemaError(pointer(path, 'additionalProperties'), 'invalid_additional_properties'));
      else check(s.additionalProperties, pointer(path, 'additionalProperties'), depth + 1);
    }
    if (has(s, 'items')) check(s.items, pointer(path, 'items'), depth + 1);
    if (has(s, 'enum') && (!Array.isArray(s.enum) || s.enum.length === 0)) errors.push(schemaError(pointer(path, 'enum'), 'invalid_enum'));
  }
  check(schema, '', 0);
  return errors;
}

function matchesType(value, type) {
  switch (type) {
    case 'null': return value === null;
    case 'array': return Array.isArray(value);
    case 'object': return plain(value);
    case 'integer': return typeof value === 'number' && Number.isSafeInteger(value);
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    default: return typeof value === type;
  }
}

/** Schema MUST be checked with inspectSchema before calling. */
export function validate(value, schema, { maxDepth = 64, maxErrors = 100 } = {}) {
  const errors = [];
  function add(path, code) { if (errors.length < maxErrors) errors.push(violation(path, code)); }
  function walk(v, s, path, depth) {
    if (errors.length >= maxErrors) return;
    if (depth > maxDepth) { add(path, 'value_too_deep'); return; }
    if (has(s, 'type')) {
      const ts = Array.isArray(s.type) ? s.type : [s.type];
      if (!ts.some(t => matchesType(v, t))) { add(path, 'type'); return; }
    }
    if (has(s, 'enum') && !s.enum.some(x => isDeepStrictEqual(x, v))) add(path, 'enum');
    if (plain(v)) {
      if (has(s, 'required')) {
        for (const k of s.required) if (!has(v, k)) add(pointer(path, k), 'required');
      }
      const properties = s.properties || {};
      for (const [k, child] of Object.entries(v)) {
        if (has(properties, k)) walk(child, properties[k], pointer(path, k), depth + 1);
        else if (s.additionalProperties === false) add(pointer(path, k), 'additional_property');
        else if (plain(s.additionalProperties)) walk(child, s.additionalProperties, pointer(path, k), depth + 1);
      }
    }
    if (Array.isArray(v) && has(s, 'items')) {
      for (let i = 0; i < v.length && errors.length < maxErrors; i++) walk(v[i], s.items, pointer(path, i), depth + 1);
    }
  }
  walk(value, schema, '', 0);
  return errors;
}
