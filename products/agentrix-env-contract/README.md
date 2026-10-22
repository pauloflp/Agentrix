# Agentrix Env Contract

**Find missing or undocumented environment variables before deployment.** A tiny, zero-dependency `.env.example` drift checker for Node.js, JavaScript and TypeScript projects.

If your Next.js deployment works locally but fails in CI because a required environment variable is missing, this tool helps check that your documented `.env.example` and the actual environment file have the **same key names**. It never prints secret values.

## Features

- Checks missing variables and undocumented keys
- Node.js 20+, zero dependencies
- Human-readable output or machine-readable JSON
- Strict by default; `--allow-extra` supports local-only keys
- No network access, no upload of your `.env` file

## Usage

```bash
node bin/env-contract.mjs --example .env.example --env .env
node bin/env-contract.mjs --example .env.example --env .env --json
node bin/env-contract.mjs --example .env.example --env .env --allow-extra
npm test
```

Example output:

```text
FAIL: environment key mismatch
Missing: DATABASE_URL, STRIPE_SECRET_KEY
Undocumented: LOCAL_DEBUG
```

## CI integration

Don't upload production secrets as CI artifacts. Use a CI-specific env file without secrets, or inject real variables through your CI secret store.

```yaml
- name: Check .env keys
  run: node tools/agentrix-env-contract/bin/env-contract.mjs --example .env.example --env .env.ci
```

## Scope and limitations

Compares **key names only**. It does not validate variable values or secret quality; it does not support multiline quoted dotenv values or interpolation, and it does not inspect source code. Duplicate keys and malformed assignments are errors.

Exit codes: `0` matching keys; `1` drift; `2` malformed input or missing file.

## License

MIT. Free for personal and commercial use. A microtool by [Agentrix](https://github.com/pauloflp/Agentrix).

## Search terms

dotenv validation, missing environment variables, env example checker, Node.js CI, Next.js deployment environment variables, environment configuration drift, JavaScript, TypeScript.
