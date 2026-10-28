<div align="center">

![Agentrix — Intelligence, put to work](assets/agentrix-hero.svg?v=d695dcaa)

**Tools for people who build.**

Find data errors, catch risky project files before publishing, check campaign links and start SaaS websites faster. Explore free tools, reusable AI instructions and optional paid products.

[**Free tools**](#free-tools) · [**Run the demos**](#try-the-tools-with-bundled-data) · [**Free templates**](#free-templates) · [**Free agent skills**](#free-agent-skills) · [**Discussions**](https://github.com/pauloflp/Agentrix/discussions) · [**Instagram**](https://www.instagram.com/agentrix.tools/)

![Node.js 20+](https://img.shields.io/badge/Node.js-20%2B-153452?style=flat-square&logo=nodedotjs&logoColor=white)
![Free tools](https://img.shields.io/badge/Free%20microtools-7-153452?style=flat-square)
![Agent skills](https://img.shields.io/badge/Free%20agent%20skills-15-153452?style=flat-square)
![License](https://img.shields.io/badge/Free%20tools-MIT-153452?style=flat-square)

</div>

---

## Built to solve small, expensive problems

Agentrix helps you catch practical problems before they become bigger ones. Pick the task you need to solve, see an example, and use the right tool. Technical details and limitations are in each product page.

![From discovery to shipping](assets/agentrix-workflow.svg)

## FREE TOOLS

All seven microtools below are **free, MIT-licensed**, run locally with **Node.js 20+**, and require **no third-party runtime dependencies**.

| Your problem | Tool | Run a bundled example |
| :--- | :--- | :--- |
| Check for private-looking files before publishing code | **[Staged File Guard](products/agentrix-staged-file-guard/)** | [Path-only staging check →](products/agentrix-staged-file-guard/README.md#try-it) |
| Find broken records in a data export or AI file | **[JSONL Guard](products/agentrix-jsonl-guard/)** | [JSON Lines validator quick start →](products/agentrix-jsonl-guard/README.md#quick-start) |
| Spot missing app settings before launch | **[Env Contract](products/agentrix-env-contract/)** | [Dotenv checker quick start →](products/agentrix-env-contract/README.md#quick-start) |
| Catch CSV formatting mistakes before importing data | **[CSV Guard](products/agentrix-csv-guard/)** | [CSV validator quick start →](products/agentrix-csv-guard/README.md#quick-start) |
| See what changed between two configuration files | **[JSON Diff](products/agentrix-json-diff/)** | [JSON comparison quick start →](products/agentrix-json-diff/README.md#quick-start) |
| Find tracking mistakes in your advertising links | **[UTM Audit](products/agentrix-utm-audit/)** | [Campaign link checker quick start →](products/agentrix-utm-audit/README.md#quick-start) |
| Prepare spreadsheet exports for another system | **[Data Import Studio](products/agentrix-data-import-studio/)** | [Load the sample dataset →](products/agentrix-data-import-studio/README.md#get-started) |

### Try the tools with bundled data

With **Git and Node.js 20+**, run the six CLIs against small synthetic files already included in the repository:

```bash
git clone --depth 1 https://github.com/pauloflp/Agentrix.git
cd Agentrix
node scripts/demo.mjs
```

No `npm install`, API key, account or private input file is needed. The demos invoke the actual CLIs and show both successful checks and deliberately invalid inputs. A child command printing `FAIL` with exit `1` is an expected rejection; the demo runner exits `0` only when all 14 examples return their expected exit codes.

Run just one tool with `node scripts/demo.mjs jsonl-guard`, `node scripts/demo.mjs env-contract`, or `node scripts/demo.mjs csv-guard`. The runner also accepts `utm-audit`, `json-diff`, and `staged-file-guard` (using temporary synthetic Git repositories). For the browser-based CSV mapper, follow the [Data Import Studio quick start](products/agentrix-data-import-studio/README.md#get-started).

**[Tutorial: validate JSONL, environment keys and CSV before CI →](docs/local-validation.md)**

### What the tools help you solve

A visual introduction to the problems Agentrix tools are designed to solve. These are promotional illustrations. Explore each tool's documentation for real examples, commands and capabilities.

<table>
  <tr>
    <td align="center" width="33%">
      <a href="products/agentrix-env-contract/README.md"><img src="https://res.cloudinary.com/xqixzm02/image/upload/v1792708835/AGENTRIX_POST_02_ENV_CONTRACT_CARROSSEL_01_DE_06.jpg" alt="Agentrix Env Contract campaign illustration" width="230"/></a><br/>
      <strong>Environment keys, aligned.</strong><br/>
      <sub><a href="products/agentrix-env-contract/README.md">Explore Env Contract →</a></sub>
    </td>
    <td align="center" width="33%">
      <a href="products/agentrix-env-contract/README.md"><img src="https://res.cloudinary.com/xqixzm02/image/upload/v1792708834/AGENTRIX_POST_04_BUILD_SMARTER_ENV_CONTRACT.jpg" alt="Agentrix Build Smarter Env Contract campaign illustration" width="230"/></a><br/>
      <strong>Build smarter with Env Contract.</strong><br/>
      <sub><a href="products/agentrix-env-contract/README.md">See the workflow →</a></sub>
    </td>
    <td align="center" width="33%">
      <a href="skills/"><img src="https://res.cloudinary.com/xqixzm02/image/upload/v1792708834/AGENTRIX_POST_06_AI_WORKFLOWS.jpg" alt="Agentrix AI workflows campaign illustration" width="230"/></a><br/>
      <strong>Reusable agent workflows.</strong><br/>
      <sub><a href="skills/">Browse agent skills →</a></sub>
    </td>
  </tr>
</table>

<details>
<summary><strong>Run all seven test suites</strong></summary>

From the repository root:

```bash
(cd products/agentrix-staged-file-guard && npm test)
(cd products/agentrix-env-contract && npm test)
(cd products/agentrix-utm-audit && npm test)
(cd products/agentrix-csv-guard && npm test)
(cd products/agentrix-json-diff && npm test)
(cd products/agentrix-jsonl-guard && npm test)
(cd products/agentrix-data-import-studio && npm test)
```

The [CI workflow](.github/workflows/microproducts-ci.yml) also runs product tests on supported Node.js versions when relevant files change. Passing tests do not guarantee correctness for every possible input.

</details>

## FREE AGENT SKILLS

A curated library of reusable instructions for common technical and creative tasks. **All 15 are free to read and adapt**, subject to applicable licenses and third-party terms.

| Build and engineering | Design and content | Research and operations |
| :--- | :--- | :--- |
| [React code quality](skills/react-code-quality/SKILL.md) | [Creative brief](skills/creative-brief/SKILL.md) | [Research verification](skills/research-verification/SKILL.md) |
| [Premium frontend](skills/premium-frontend/SKILL.md) | [Motion direction](skills/motion-direction/SKILL.md) | [Data provenance](skills/data-provenance/SKILL.md) |
| [Remotion engineering](skills/remotion-engineering/SKILL.md) | [Brand guardian](skills/brand-guardian/SKILL.md) | [Context retrieval](skills/context-retrieval/SKILL.md) |
| [QA release gate](skills/qa-release-gate/SKILL.md) | [Commercial copy](skills/commercial-copy/SKILL.md) | [Memory governance](skills/memory-governance/SKILL.md) |
| [Dashboard intelligence](skills/dashboard-intelligence/SKILL.md) | [AI video handoff](skills/ai-video-handoff/SKILL.md) | [Workflow orchestration](skills/workflow-orchestration/SKILL.md) |

**[Explore the full index](skills/index.json)** · **[Choose a skill with the routing guide](SKILL_ROUTER.md)**

> These are instruction files, not automatically installed plugins or a promise of increased model capabilities. Open the relevant `SKILL.md`, adapt it to your compatible agent, and review the output.

## FREE TEMPLATES

### Agentrix SaaS Landing Kit · FREE DOWNLOAD

**Two complete editable SaaS landing pages: Atlas Analytics and Fieldnote CRM.** Download and customize the HTML/CSS/JavaScript for personal or commercial websites with no checkout, login, password, or payment. These are **frontend templates**, not a working SaaS backend.

[![Actual Atlas Analytics and Fieldnote CRM template screenshots](premium/agentrix-saas-landing-kit/preview.webp)](premium/agentrix-saas-landing-kit/README.md)

**[Download the ZIP (no password) →](premium/agentrix-saas-landing-kit/AGENTRIX_SaaS_Landing_Kit_FREE_v1.0.zip)** · [Explore the templates →](premium/agentrix-saas-landing-kit/README.md) · [Free-use license →](premium/agentrix-saas-landing-kit/LICENSE.txt)

The kit is free to use for your own and client projects. Redistributing the unmodified pack as a competing template product is not permitted. This **source-available** license is separate from the MIT licenses of the seven free microtools.

## PREMIUM TEMPLATES

No premium template is currently available to purchase. The SaaS Landing Kit has been released as a **free product** rather than a paid preview. This does not change the status of any other Agentrix product.

## PREMIUM TOOLS

Premium products are separate, optional offers. Each product has its own scope, availability, and delivery details. **A product described as a preview is not available for purchase.**

### [Campaign QA Pro](premium/agentrix-campaign-qa/README.md) · US$29 one-time

**Before launching ads, check many campaign links at once and download a report of tracking mistakes.** Campaign QA Pro lets you import CSV files and review missing or inconsistent UTM labels. It does **not** replace or restrict the free UTM Audit CLI.

**[Buy Campaign QA Pro — US$29 one-time →](https://buy.stripe.com/9B69AT928eYX5264GfgjC01)** Open the encrypted HTTPS workspace in desktop Chrome and unlock it with your purchase key. See the product page for verified features, limits, and testing scope.

[**View Campaign QA Pro scope and limitations →**](premium/agentrix-campaign-qa/README.md)

---

### Revenue Reconcile and Revenue Pulse · financial checks

**[Revenue Reconcile: US$149 one-time](https://buy.stripe.com/28EbJ17Y4g31gKOgoXgjC04)** helps you compare expected payments with received amounts and spot differences for review. **[Revenue Pulse: US$99 one-time](https://buy.stripe.com/7sY7sLems3gf5260pZgjC05)** helps you understand subscription revenue, cancellations and overdue invoices. Both require Python 3.10+, a terminal and CSV files in the documented formats. No bank connection or automated collection is included.

**Read the product pages:** [Revenue Reconcile: compare expected vs. received payments](premium/revenue-tools/reconcile.md) · [Revenue Pulse: review recurring revenue and overdue invoices](premium/revenue-tools/pulse.md)

**[Download encrypted ZIPs, view requirements and delivery instructions →](premium/revenue-tools/README.md)** The ZIPs are public; Stripe displays the password after purchase. Save it before closing the confirmation page.

## Principles

- **Useful over complicated.** Each tool targets a specific workflow.
- **Honest by design.** Read the limitations and inspect results before making decisions.
- **Local first where practical.** The free CLIs do not upload your files.
- **Free stays free.** The seven MIT microtools and 15 agent skills are not locked behind the premium checkout.

## Community & Roadmap

Agentrix is built around practical problems, reproducible examples, and useful feedback, not follower farming.

- **[Help choose the next developer tool →](https://github.com/pauloflp/Agentrix/issues/12)** — a public roadmap issue asking for concrete workflows and product suggestions.
- **[Ask a usage question or share a workflow →](https://github.com/pauloflp/Agentrix/discussions)** — technical discussions about the tools and reproducible examples.
- **[Report a reproducible bug →](https://github.com/pauloflp/Agentrix/issues/new/choose)** — include the affected tool, expected result and sanitized steps.
- **[Suggest a feature →](https://github.com/pauloflp/Agentrix/issues/new/choose)** — explain your specific task and why existing solutions are insufficient.
- **[Read the contribution guidelines →](CONTRIBUTING.md)** — scope, code quality, licensing, and respectful participation.
- **[Community standards →](CODE_OF_CONDUCT.md)** · **[Security reporting →](SECURITY.md)** · **[Component licenses →](LICENSE.md)** — participation rules, private vulnerability reporting and precise licensing.

Feedback is welcome even if you don't write code. Product release notes live in the repository, and public discussion should stay relevant to the people using these tools.

## Follow the build

[Instagram @agentrix.tools](https://www.instagram.com/agentrix.tools/) · [GitHub repository](https://github.com/pauloflp/Agentrix) · [Issues](https://github.com/pauloflp/Agentrix/issues)

Questions, bug reports, and thoughtful contributions are welcome. Please do not share credentials, private client data, or payment unlock keys in public issues.

<sub>Agentrix is an independent project, not officially affiliated with the third-party platforms mentioned in its documentation. Campaign illustrations are promotional artwork, not software screenshots.</sub>
