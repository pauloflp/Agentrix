# AGENTRIX

**Tools for people who build.**

A growing collection of free tools and reusable AI agent skills for developers, designers, creative technologists, and marketers.

## 15 free AI agent skills

**All 15 skills are free to explore and use as reference instructions.** Browse the files directly, copy what you need, and adapt them within any applicable license and third-party terms.

- [Browse the 15 skills](skills/)
- [Complete skills index](skills/index.json)
- [Skill routing guide](SKILL_ROUTER.md)
- [Creative brief](skills/creative-brief/SKILL.md)
- [Motion direction](skills/motion-direction/SKILL.md)
- [Premium frontend](skills/premium-frontend/SKILL.md)
- [Dashboard intelligence](skills/dashboard-intelligence/SKILL.md)
- [QA and release checks](skills/qa-release-gate/SKILL.md)

### How to use

1. Identify your task and consult [the skill router](SKILL_ROUTER.md).
2. Open the relevant `SKILL.md` files.
3. Supply those instructions to your compatible agent or configure your own environment to load them.
4. Review generated work, run tests, and verify claims before release.

These files are **instructions**, not built-in plugins. Browsing this repository does not automatically install tools, increase the model context window, or guarantee outputs.

## Free developer microproducts

### [Agentrix Env Contract](products/agentrix-env-contract/README.md)

A zero-dependency Node.js CLI to detect missing and undocumented environment variable names between `.env.example` and `.env`. Includes tests, examples, and an MIT license.

**Discoverability:** dotenv validation, missing environment variables, Next.js environment checker, Node.js CI, JavaScript configuration drift.

### [Agentrix UTM Audit](products/agentrix-utm-audit/README.md)

A free, offline, zero-dependency Node.js CLI to check campaign URLs for missing, duplicated, or inconsistently named UTM parameters. It reports issues without exposing complete URLs or parameter values. Includes tests and an MIT license.

**Discoverability:** UTM checker, campaign tracking QA, Google Analytics UTM consistency, marketing link audit, newsletter UTM validation.

### Run the microproduct tests

Both tools require Node.js 20 or newer. From the repository root:

```bash
(cd products/agentrix-env-contract && npm test)
(cd products/agentrix-utm-audit && npm test)
```

[GitHub Actions](../../actions/workflows/microproducts-ci.yml) runs both test suites on supported Node.js versions when product code changes. A passing check validates the included tests, not every possible use case.

## Status

The 15 agent skills and listed microproducts are currently **free to access on GitHub**. **No payment is required.** There is no purchase link for this collection, and no paid checkout is being promoted here.

We may introduce optional paid bundles or services later, with a clear explanation of the added value. Existing public files should not be described as exclusive paid content.

## Stay connected

- [Instagram: @agentrix.tools](https://www.instagram.com/agentrix.tools/)
- [Explore the repository](https://github.com/pauloflp/Agentrix)

Issues and contributions are welcome. Keep personal information, private client data, credentials, and internal work notes out of this public repository.

Agentrix is independent and is not officially affiliated with the third-party services and platforms mentioned in product documentation.
