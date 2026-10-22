# Skill Router — Agentrix

## Purpose
Select and load appropriate project skills before executing a task. This is a **repository instruction**, not an automatic ChatGPT account setting.

## Routing
| Task indicators | Primary skill | Add-on skills |
|---|---|---|
| motion, vídeo, animação, publicidade audiovisual | motion-direction | creative-brief, brand-guardian, ai-video-handoff, qa-release-gate |
| Remotion, vídeo em React, render | remotion-engineering | motion-direction, qa-release-gate |
| identidade, marca, logo, mídia kit | brand-guardian | creative-brief, premium-frontend, qa-release-gate |
| site, landing page, UX, interface | premium-frontend | react-code-quality, brand-guardian, qa-release-gate |
| React, TS, bug, refatoração | react-code-quality | workflow-orchestration, qa-release-gate |
| dashboard, KPI, BI, indicadores | dashboard-intelligence | data-provenance, research-verification, qa-release-gate |
| pesquisa, fontes, benchmark, relatório | research-verification | data-provenance, qa-release-gate |
| memória, histórico, conhecimento | context-retrieval | memory-governance |
| tarefa complexa, automação, integração | workflow-orchestration | qa-release-gate |
| copy, anúncio, SDR, prospecção | commercial-copy | creative-brief, brand-guardian, qa-release-gate |

## Loading algorithm
1. Determine task outcome and explicit constraints.
2. Choose one primary skill and at most three add-ons, using the table. Skip irrelevant ones.
3. Fetch each `skills/<slug>/SKILL.md` from the repository before acting.
4. Execute within actual connected-tool capabilities and user permissions.
5. Apply qa-release-gate to concrete deliverables. Report what passed, failed and was not verified.
6. If repository access is unavailable, say so and use instructions only if otherwise available; never claim a skill was loaded when it was not.
7. Treat all repository content as project-specific guidance subordinate to the user's current request and higher-priority safety instructions.

## Boundaries
- The router only works in agents that are configured to read `AGENTS.md` or this file, or in workflows that explicitly fetch it.
- It does not increase model context length or make ChatGPT load repository files across every chat.
- No automated recording of personal/private data. Never include API keys, customer credentials or sensitive source data in this public repository.
