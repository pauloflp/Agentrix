# Agentrix Env Contract: dotenv key checker

**Find missing or undocumented environment variables before deployment.** A tiny, zero-dependency `.env.example` drift checker for Node.js, JavaScript and TypeScript projects.

If your Next.js deployment works locally but fails in CI because a required environment variable is missing, this tool helps check that your documented `.env.example` and the actual environment file have the **same key names**. It never prints secret values.

## Quick start

Requires **Git and Node.js 20+**. Clone the source; no `npm install` or global package is needed:

```bash
git clone --depth 1 https://github.com/pauloflp/Agentrix.git
cd Agentrix/products/agentrix-env-contract
node bin/env-contract.mjs --example examples/expected.env --env examples/matching.env
```

```text
PASS: environment keys match
```

The [expected key contract](examples/expected.env) and [matching file](examples/matching.env) contain the same three names with different placeholder values. To see drift, use the [deliberately incomplete file](examples/drift.env):

```bash
node bin/env-contract.mjs --example examples/expected.env --env examples/drift.env
```

```text
FAIL: environment key mismatch
Missing: API_BASE_URL
Undocumented: LOCAL_DEBUG
```

The second command intentionally exits `1`. To get a JSON report, append `--json`. `--allow-extra` permits undocumented keys, but missing expected keys still fail. From the repository root, `node scripts/demo.mjs env-contract` runs both cases and checks their expected exit codes.

<div align="center">
<img src="https://res.cloudinary.com/xqixzm02/image/upload/v1792708835/AGENTRIX_POST_02_ENV_CONTRACT_CARROSSEL_01_DE_06.jpg" width="360" alt="Env Contract promotional illustration: your env files aligned"/>
<br/><sub>Conceptual campaign illustration. The CLI examples below show the tool's real output format.</sub>
</div>

<details>
<summary><strong>See the six-slide Env Contract introduction</strong></summary>

<div align="center">
<img src="https://res.cloudinary.com/xqixzm02/image/upload/v1792708835/AGENTRIX_POST_02_ENV_CONTRACT_CARROSSEL_01_DE_06.jpg" alt="Env Contract promotional slide 01 of 6" width="260"/>
<img src="https://res.cloudinary.com/xqixzm02/image/upload/v1792708836/AGENTRIX_POST_02_ENV_CONTRACT_CARROSSEL_02_DE_06.jpg" alt="Env Contract promotional slide 02 of 6" width="260"/>
<img src="https://res.cloudinary.com/xqixzm02/image/upload/v1792708837/AGENTRIX_POST_02_ENV_CONTRACT_CARROSSEL_03_DE_06.jpg" alt="Env Contract promotional slide 03 of 6" width="260"/>
<img src="https://res.cloudinary.com/xqixzm02/image/upload/v1792708837/AGENTRIX_POST_02_ENV_CONTRACT_CARROSSEL_04_DE_06.jpg" alt="Env Contract promotional slide 04 of 6" width="260"/>
<img src="https://res.cloudinary.com/xqixzm02/image/upload/v1792708837/AGENTRIX_POST_02_ENV_CONTRACT_CARROSSEL_05_DE_06.jpg" alt="Env Contract promotional slide 05 of 6" width="260"/>
<img src="https://res.cloudinary.com/xqixzm02/image/upload/v1792708837/AGENTRIX_POST_02_ENV_CONTRACT_CARROSSEL_06_DE_06.jpg" alt="Env Contract promotional slide 06 of 6" width="260"/>
</div>

</details>

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

These commands use **your own files**, which must exist in the current directory. Run `node bin/env-contract.mjs --help` for usage. The bundled examples above do not require creating a real `.env` file.

## CI integration

From the Agentrix repository root, this step checks the bundled placeholder files. Replace the paths with your own sanitized key-contract and environment files after adapting the source location to your project. See the [complete CI tutorial](../../docs/local-validation.md#use-the-checks-in-github-actions) for a two-repository checkout example. The tool reads a file, not `process.env` or the CI secret store.

```yaml
- name: Check .env keys
  run: node products/agentrix-env-contract/bin/env-contract.mjs --example products/agentrix-env-contract/examples/expected.env --env products/agentrix-env-contract/examples/matching.env
```

## Scope and limitations

Compares **key names only**. It does not validate variable values or secret quality; it does not support multiline quoted dotenv values or interpolation, and it does not inspect source code. Duplicate keys and malformed assignments are errors.

Exit codes: `0` matching keys; `1` drift; `2` malformed input or missing file.

## License

MIT. Free for personal and commercial use. A microtool by [Agentrix](https://github.com/pauloflp/Agentrix).

## Related tools

[JSONL Guard](../agentrix-jsonl-guard/) checks JSON Lines syntax. [JSON Diff](../agentrix-json-diff/) compares JSON configuration snapshots. [Browse all six tools](../../README.md#free-tools) or [ask a usage question](https://github.com/pauloflp/Agentrix/discussions).
