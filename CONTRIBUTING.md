# Contributing to Agentrix

Thanks for taking an interest in Agentrix. We welcome concrete problems, reproducible bugs, thoughtful ideas, documentation improvements and code contributions.

## First: use the existing tools

- [Browse the free developer utilities](README.md#free-tools), and check the tool's own README before opening a duplicate request.
- [Suggest the next focused tool in the community roadmap](https://github.com/pauloflp/Agentrix/issues/12).
- Use [Issues](https://github.com/pauloflp/Agentrix/issues/new/choose) for bugs and actionable feature requests.
- A pull request works best when it solves one narrow problem with a small testable change.

## Useful bug reports

Include the tool and version/commit, runtime/OS, exact reproduction steps, what you expected, what occurred, and a minimal sanitized example. For CLI tools include the command and Node.js version. **Do not paste real `.env` secrets, customer records, API keys, tokens, private files or personal data.**

## Feature suggestions

Describe the actual recurring workflow, a sample input and expected output, frequency/pain, tools involved, and limitations of existing solutions. Explain whether a local CLI, reusable code component or simple frontend template would solve it. More concrete beats more ambitious.

## Code changes

1. Fork and branch; make only relevant edits.
2. Run the tests documented for the affected tool; add regression cases for changed behavior.
3. Keep dependencies minimal and do not introduce network calls or telemetry into a local-first utility without explicit documentation and review.
4. Include concise documentation, error handling, and limitations. Provide real screenshots for visual changes, clearly distinguish mockups from working interfaces.
5. Open a PR explaining problem, approach, tests (PASS/FAIL/NOT TESTED), and backward compatibility.

Free CLI products have their own MIT licenses. The free SaaS Landing Kit has a **separate source-available free-use license** that allows commercial website use but limits raw-template redistribution. Check the relevant license before copying or republishing files.

## Community etiquette

Stay on topic. Feedback and constructive disagreement are welcome. We do not use unrelated issue comments to advertise Agentrix, mass-tag accounts/brands, manufacture engagement, or pose as an independent third-party user. Disclose project affiliation when recommending Agentrix in other communities. Avoid repetitive automated comments and excessive notifications.

Agentrix is an independent project and does not represent the brands or platforms named in its examples.
