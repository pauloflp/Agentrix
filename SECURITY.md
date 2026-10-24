# Security Policy

## Scope

The Agentrix repository contains independent products with different release and maintenance states. Read the affected product's README to understand its actual behavior, limits and supported runtimes. **No blanket security-support SLA or guaranteed patch timeline is offered.**

The six free CLI utilities run locally and have no third-party runtime dependencies. Even local-first tools can contain security defects; do not assume their inputs are trusted.

## Reporting a vulnerability

**Do not post working exploit details, credentials, private files or sensitive payloads in a public issue or discussion.**

1. If GitHub's private vulnerability reporting is enabled for this repository, use the **Security** tab and select the private reporting option.
2. If private reporting is not available, contact the repository maintainer privately using an available contact method on their GitHub profile. Do not assume a private GitHub issue is possible.
3. Include the affected component and version or commit, impact, a minimal sanitized reproduction, expected/actual behavior and any safe mitigation.

We will assess reports as capacity permits. Do not disclose third-party data or run tests against infrastructure you do not own or have permission to test.

## Routine bugs and feature requests

For issues without security impact, use the [public issue templates](https://github.com/pauloflp/Agentrix/issues/new/choose). The [contribution guidelines](CONTRIBUTING.md) explain how to submit a focused change with tests.
