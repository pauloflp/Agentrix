import test from 'node:test';
import assert from 'node:assert/strict';
import { auditUrls } from '../bin/utm-audit.mjs';

function make(values = { source: 'google', medium: 'cpc', campaign: 'launch' }) {
  const url = new URL('https://example.com/');
  for (const [key, value] of Object.entries(values)) url.searchParams.set('utm_' + key, value);
  return url.toString();
}
test('valid tagged URL passes', () => assert.equal(auditUrls([make()]).ok, true));
test('missing core campaign is reported', () => assert.equal(auditUrls([make({ source: 'google', medium: 'cpc' })]).issues[0].code, 'MISSING_REQUIRED'));
test('duplicate parameter is reported', () => assert.ok(auditUrls([make() + '&utm_source=other']).issues.some(x => x.code === 'DUPLICATE_KEY')));
test('mixed-case values are reported', () => assert.ok(auditUrls([make({ source: 'Google', medium: 'cpc', campaign: 'launch' })]).issues.some(x => x.code === 'VALUE_CASE')));
test('case inconsistency across URLs is reported', () => assert.ok(auditUrls([make(), make({ source: 'Google', medium: 'cpc', campaign: 'launch' })]).issues.some(x => x.code === 'CROSS_URL_CASE')));
test('missing tags are reported', () => assert.equal(auditUrls(['https://example.com/']).issues[0].code, 'UNTAGGED_URL'));
test('untagged links can be explicitly allowed', () => assert.equal(auditUrls(['https://example.com/'], { allowUntagged: true }).ok, true));
test('invalid URL is reported', () => assert.equal(auditUrls(['not-a-url']).issues[0].code, 'INVALID_URL'));
test('comments and blank lines are skipped', () => assert.equal(auditUrls(['', '# comment', make()]).urls, 1));
