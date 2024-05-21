import * as core from '@actions/core'
import * as github from '@actions/github'

import { GitClient } from './api/git'
import { GitHubApiClient } from './api/github'
import { OpenAIApiClient } from './api/openai'

import { isSimilar } from './utils/fuzzy_matching'
import { readYAML } from './utils/file_manager'
import {
  downloadAndProcessLogsArchive,
  removeTimestamps
} from './utils/log_handler'

import { IssueDetails } from './interfaces/github'
import { LogEntry } from './interfaces/log'

function getRequiredInput(inputName: string): string {
  const value = core.getInput(inputName, { required: true })
  if (!value) {
    throw new Error(`${inputName} is required and not supplied`)
  }
  return value
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.info('Starting the Warestack Workflow Copilot Action...')

    const githubToken = getRequiredInput('github-token')
    const openaiApiKey = getRequiredInput('openai-api-key')
    const runId = getRequiredInput('workflow-run-id')

    // Masking secrets to prevent them from being logged
    core.setSecret(githubToken)
    core.setSecret(openaiApiKey)

    const repo = github.context.repo
    // const runId = github.context.runId
    if (!repo || !runId) {
      throw new Error(
        'GitHub context payload missing necessary data (repository or run_id)'
      )
    }

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Repository: ${repo.repo} Owner: ${repo.owner}`)
    core.debug(`Run ID: ${runId}`)

    const git = new GitClient(githubToken)
    const githubClient = new GitHubApiClient(githubToken)
    const openaiClient = new OpenAIApiClient(openaiApiKey)

    let issueUrl
    let prUrl

    const workflowPath = await githubClient.getWorkflowFilePath(
      repo.owner,
      repo.repo,
      parseInt(runId, 10)
    )
    const logUrl = await githubClient.getWorkflowRunLogsUrl(
      repo.owner,
      repo.repo,
      parseInt(runId, 10)
    )
    const jobs = await githubClient.getWorkflowRunJobs(
      repo.owner,
      repo.repo,
      parseInt(runId, 10)
    )
    const logEntries: LogEntry[] = await downloadAndProcessLogsArchive(logUrl)

    // Iterate though each job and its steps,
    // only processing logs of the steps that have failed
    for (const job of jobs) {
      const steps = job.steps || []
      for (const step of steps) {
        if (step.conclusion !== 'failure') continue
        const logEntry = logEntries.find(entry => entry.filename === step.name)
        if (logEntry) {
          const errorHighlights = await openaiClient.analyzeLogs(
            removeTimestamps(logEntry.content)
          )

          const openIssues: IssueDetails[] = await githubClient.getOpenIssues(
            repo.owner,
            repo.repo
          )
          const issueDetails =
            await openaiClient.generateIssueDetails(errorHighlights)

          let similarIssue
          if (openIssues)
            similarIssue = openIssues.find((issue: IssueDetails) => {
              return isSimilar(issue.title, issueDetails.title)
            })

          if (similarIssue) {
            core.info(
              `A similar issue already exists: ${similarIssue.html_url}`
            )
            issueUrl = similarIssue.html_url
          } else {
            issueUrl = await githubClient.createIssue(
              repo.owner,
              repo.repo,
              issueDetails.title,
              issueDetails.body
            )
          }

          // Read YAML content from a GitHub workflow
          const yamlContent = await readYAML(workflowPath.split('@')[0])

          if (issueUrl) {
            const prDetails = await openaiClient.generatePrDetails(
              issueDetails.body,
              issueUrl,
              yamlContent
            )

            if (prDetails.patch != null) {
              await git.patchCommitAndPush(
                prDetails.patch,
                prDetails.commit,
                prDetails.branch
              )
              prUrl = await githubClient.createPullRequest(
                repo.owner,
                repo.repo,
                prDetails.branch,
                'main',
                prDetails.title,
                prDetails.description
              )
            }
          }
        }
        core.setOutput('issue-url', issueUrl)
        core.info('✅ Issue created successfully.')
        core.setOutput('pr-url', prUrl)
        core.info('✅ Issue created successfully.')
      }
    }

    core.info('🎉 Action completed successfully')
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.error(
        `Error executing Warestack Workflow Copilot Action: ${error.message}`
      )
      core.setFailed(error.message)
    }
  }
}
