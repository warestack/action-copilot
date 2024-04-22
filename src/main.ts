import * as core from '@actions/core'
import * as github from '@actions/github'
import { GitHubApiClient } from './api/github'
import { OpenAIApiClient } from './api/openai'

import {
  downloadAndProcessLogsArchive,
  removeTimestamps
} from './utils/log_handler'
import { LogEntry } from './interfaces/log'
import { GitClient } from './api/git'

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
    const errors: string[] = []
    const fixes: string[] = []
    let issueUrl
    let prUrl

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

    for (let i = 0; i < jobs.length; i++) {
      // const combinedErrors = extractErrors(rawLogs[i]).join('\n')
      // if (combinedErrors) {
      //   const errorHighlights = await openaiClient.analyzeLogs(combinedErrors)
      //   // errors.push(highlightError)
      //   // const fix = await openaiClient.proposeFixes(highlightError)
      //   // if (fix) fixes.push(fix)
      //   core.debug(`Error highlight: ${errorHighlights}\n`)
      // }
      const steps = jobs[i].steps || []
      for (let l = 0; l < steps.length; l++) {
        if (steps[l].conclusion !== 'failure') continue
        const logEntry = logEntries.find(
          entry => entry.filename === steps[l].name
        )
        if (logEntry) {
          const errorHighlights = await openaiClient.analyzeLogs(
            removeTimestamps(logEntry.content)
          )
          const issueDetails =
            await openaiClient.generateIssueDetails(errorHighlights)

          issueUrl = await githubClient.createIssue(
            repo.owner,
            repo.repo,
            issueDetails.title,
            issueDetails.description
          )

          if (issueUrl) {
            const prDetails = await openaiClient.generatePrDetails(
              issueDetails.description
            )
            // await git.clone(
            //   'dkargatzis',
            //   'tech_entity_recognition',
            //   'feature/env-and-pipelines-config'
            // )
            await git.patchCommitAndPush(
              // 'tech_entity_recognition',
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
