# Warestack Workflow Copilot Action

[![GitHub Super-Linter](https://github.com/actions/action-copilot/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/action-copilot/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/action-copilot/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/action-copilot/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/action-copilot/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/action-copilot/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Welcome to the Warestack Workflow Copilot Action repository! This action is
designed to automatically analyze logs from your GitHub workflows, identify
errors, and suggest fixes through auto-generated pull requests, enhancing the
efficiency of your CI/CD pipeline.

## How It Works

1. **Trigger**: Activates upon the completion of specified workflows.
2. **Log Retrieval**: Fetches logs from workflow runs using GitHub API.
3. **Error Analysis**: Utilizes OpenAI to analyze logs and highlight errors.
4. **Issue Management**: Creates GitHub issues for each identified error with
   detailed descriptions.
5. **Automated Fixes**: Generates patch suggestions and applies them to new
   branches.
6. **Pull Requests**: Automatically creates pull requests linking to the issues,
   streamlining the review and merge process.

## Features

- **Automated Log Analysis**: Identifies errors in workflow logs.
- **Issue Creation**: Automatically generates and creates issue tickets on
  GitHub.
- **Code Patch Generation**: Proposes code fixes and prepares patches.
- **Branch and PR Automation**: Handles branching and pull requests for code
  fixes.

## Setup Instructions

### Example Workflow File

To use this action in your projects, add the following workflow to your
`.github/workflows` folder:

```yaml
name: Warestack Copilot

on:
  workflow_run:
    workflows: ['Main CI'] # Name of the primary workflow
    types:
      - completed

jobs:
  copilot-job:
    runs-on: ubuntu-latest
    name: Warestack Workflow Copilot
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.PAT_GITHUB_TOKEN }} # Token with workflows scope

      - name: Trigger Copilot Action
        uses: warestack/action-copilot@main
        with:
          github-token: ${{ secrets.PAT_GITHUB_TOKEN }}
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          workflow-run-id: ${{ github.event.workflow_run.id }} # ID of the completed workflow run
```

### Inputs

- `github-token`: Token for the GitHub API. Must have appropriate permissions to
  fetch logs, create branches, issues, and pull requests.
- `openai-api-key`: Key for OpenAI API to perform automated log analysis and
  patch generation.

### Permissions

Ensure the GITHUB_TOKEN or the personal access token used has the following
permissions:

- `repo` (all): For operations on the repository.
- `actions`: For accessing workflow runs.
- `workflows`: For modifying workflow files.

### Security

Always store your `PAT_GITHUB_TOKEN` and `OPENAI_API_KEY` as secrets. Never hard
code them into your workflow files.

## Contributing

We believe in the power of the community. Any contributions you make are
**greatly appreciated**. Check our [Contributing Guide](./CONTRIBUTING.md) for
more information.

## Resources

- [Warestack Official Documentation](https://www.warestack.com/documentation)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [OpenAI API Documentation](https://beta.openai.com/docs/)

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE)
file for details.

---

❤️ Made with passion by the Warestack Team. Join our
[Community Discord](https://discord.gg/pqg5sxhx6Y) to discuss and contribute!
