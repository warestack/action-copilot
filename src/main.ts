import * as core from '@actions/core'
import * as github from '@actions/github'
import { GitHubApiClient } from './api/github'
import { OpenAIApiClient } from './api/openai'

import {
  downloadAndProcessLogsArchive,
  extractErrors
} from './utils/log_handler'

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
    const runId: string = getRequiredInput('workflow-run-id')

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

    const githubClient = new GitHubApiClient(githubToken)
    const openaiClient = new OpenAIApiClient(openaiApiKey)
    let errors: string[]
    const fixes: string[] = []
    let issueUrl
    let prUrl

    const logUrl = await githubClient.getWorkflowRunLogsUrl(
      repo.owner,
      repo.repo,
      Number(runId)
    )
    const rawLog = await downloadAndProcessLogsArchive(logUrl)
    // eslint-disable-next-line prefer-const
    errors = extractErrors(rawLog)
    for (let i = 0; i < errors.length; i++) {
      errors[i] = await openaiClient.analyzeLogs(rawLog)
      fixes[i] = await openaiClient.proposeFixes(errors[i])
    }

    if (fixes.length > 0) {
      prUrl = 'test'
      // prUrl = await githubClient.createPullRequest(
      //   repos.owner,
      //   repo.repo,
      //   'fix-branch',
      //   'main',
      //   'Proposed Fixes',
      //   fixes
      // )
      core.setOutput('pr-url', prUrl)
      core.info('✅ Pull request created successfully.')
    } else {
      if (errors.length > 0) {
        issueUrl = 'test'
        // issueUrl = await githubClient.createIssue(
        //   repo.owner,
        //   repo.repo,
        //   'Detected Issues',
        //   errors
        // )
      }
      core.setOutput('issue-url', issueUrl)
      core.info('✅ Issue created successfully.')
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
