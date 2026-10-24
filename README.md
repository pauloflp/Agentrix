<div align="center">

![Agentrix — Intelligence, put to work](assets/agentrix-hero.svg)

**Tools for people who build.**

Practical developer utilities, reusable agent instructions, and focused workflows for code, data, design, and marketing.

[**Free tools**](#free-tools) · [**Free agent skills**](#free-agent-skills) · [**Premium templates**](#premium-templates) · [**Premium tools**](#premium-tools) · [**Instagram**](https://www.instagram.com/agentrix.tools/)

![Node.js 20+](https://img.shields.io/badge/Node.js-20%2B-153452?style=flat-square&logo=nodedotjs&logoColor=white)
![Free tools](https://img.shields.io/badge/Free%20microtools-5-153452?style=flat-square)
![Agent skills](https://img.shields.io/badge/Free%20agent%20skills-15-153452?style=flat-square)
![License](https://img.shields.io/badge/Free%20tools-MIT-153452?style=flat-square)

</div>

---

## Built to solve small, expensive problems

Agentrix is a collection of deliberately focused tools. Start with a problem, choose a tool, and inspect the result. No unnecessary dashboards or accounts for the free CLI utilities.

![From discovery to shipping](assets/agentrix-workflow.svg)

## FREE TOOLS

All five microtools below are **free, MIT-licensed**, run locally with **Node.js 20+**, and require **no third-party runtime dependencies**.

| Tool | What it helps you catch | Start here |
| :--- | :--- | :--- |
| **[Env Contract](products/agentrix-env-contract/)** | Missing or undocumented `.env` key names before deployment | [Documentation →](products/agentrix-env-contract/README.md) |
| **[UTM Audit](products/agentrix-utm-audit/)** | Inconsistent UTM naming, missing campaign tags, malformed links | [Documentation →](products/agentrix-utm-audit/README.md) |
| **[CSV Guard](products/agentrix-csv-guard/)** | Broken CSV structure, irregular columns, risky spreadsheet formulas | [Documentation →](products/agentrix-csv-guard/README.md) |
| **[JSON Diff](products/agentrix-json-diff/)** | Added, removed, and changed JSON values at precise paths | [Documentation →](products/agentrix-json-diff/README.md) |
| **[Data Import Studio](products/agentrix-data-import-studio/)** | Visual CSV column mapping, typed validation, clean/error exports | [Documentation →](products/agentrix-data-import-studio/README.md) |

### See the ideas behind the tools

These are **original Agentrix campaign illustrations**, not screenshots of the running CLI. The actual commands and sample output are in each product's documentation.

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

### Try a tool in seconds

Clone the repository, enter a product directory, and run its tests. For example:

```bash
git clone https://github.com/pauloflp/Agentrix.git
cd Agentrix/products/agentrix-env-contract
npm test
node bin/env-contract.mjs --example .env.example --env .env
```

The last command requires the two named files to exist in the working directory. See the [Env Contract usage guide](products/agentrix-env-contract/README.md) for details and safe CI examples.

<details>
<summary><strong>Run all five test suites</strong></summary>

From the repository root:

```bash
(cd products/agentrix-env-contract && npm test)
(cd products/agentrix-utm-audit && npm test)
(cd products/agentrix-csv-guard && npm test)
(cd products/agentrix-json-diff && npm test)
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

## PREMIUM TEMPLATES

No premium templates are available for purchase yet. We list prototypes honestly and do not provide a checkout until customer-style tests and delivery verification pass. The five free tools and 15 free agent skills remain free.

### Agentrix SaaS Landing Kit · visual preview

**Planned launch price: US$4.90 one-time · NOT FOR SALE YET.** Two complete, responsive landing-page designs for analytics SaaS and CRM products, delivered as editable HTML/CSS/JS. No SaaS backend is included.

[![Real screenshot showing the Atlas Analytics and Fieldnote CRM landing-page designs](premium/agentrix-saas-landing-kit/preview.webp)](premium/agentrix-saas-landing-kit/README.md)

[**See real design previews, features and test status →**](premium/agentrix-saas-landing-kit/README.md)

The kit is a private technical MVP. Purchase and delivery remain disabled until the customer-style release checklist is completed; no checkout link is offered.

## PREMIUM TOOLS

Premium products are separate, optional offers. Each product has its own scope, availability, and delivery details. **A product described as a preview is not available for purchase.**

### Campaign QA Pro · release on hold

Campaign QA Pro is a local browser-based tool for bulk campaign-link checks, CSV imports, configurable UTM naming allowlists, and downloadable QA reports. It does **not** replace or restrict the free UTM Audit CLI.

**Not available to purchase.** The checkout is disabled while the full customer activation and delivery experience is validated. No purchase link is offered until the product passes its release checks.

[**View Campaign QA Pro scope and limitations →**](premium/agentrix-campaign-qa/README.md)

---

## Principles

- **Useful over complicated.** Each tool targets a specific workflow.
- **Honest by design.** Read the limitations and inspect results before making decisions.
- **Local first where practical.** The free CLIs do not upload your files.
- **Free stays free.** The five MIT microtools and 15 agent skills are not locked behind the premium checkout.

## Follow the build

[Instagram @agentrix.tools](https://www.instagram.com/agentrix.tools/) · [GitHub repository](https://github.com/pauloflp/Agentrix) · [Issues](https://github.com/pauloflp/Agentrix/issues)

Questions, bug reports, and thoughtful contributions are welcome. Please do not share credentials, private client data, or payment unlock keys in public issues.

<sub>Agentrix is an independent project, not officially affiliated with the third-party platforms mentioned in its documentation. Campaign illustrations are promotional artwork, not software screenshots.</sub>
