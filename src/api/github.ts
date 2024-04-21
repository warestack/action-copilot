import { Octokit } from '@octokit/rest'
import * as core from '@actions/core'
import { Job } from '../interfaces/workflow'

export class GitHubApiClient {
  private client

  constructor(token: string) {
    this.client = new Octokit({ auth: token })
  }

  /**
   * Retrieves the URL to download an archive of log files for a specific workflow run.
   * @param {string} repoOwner - The owner of the repository.
   * @param {string} repoName - The repository name.
   * @param {number} runId - The ID of the workflow run.
   * @returns {Promise<string>} - A promise that resolves to the URL for downloading the log archive.
   */
  async getWorkflowRunLogsUrl(
    repoOwner: string,
    repoName: string,
    runId: number
  ): Promise<string> {
    try {
      const response = await this.client.actions.downloadWorkflowRunLogs({
        owner: repoOwner,
        repo: repoName,
        run_id: runId
      })

      // Assuming the API call returns a URL to download the logs
      core.debug(`Logs URL: ${response.url}`)
      return response.url
    } catch (error) {
      if (error instanceof Error)
        core.debug(`Error fetching workflow run logs URL: ${error.message}`)
      throw new Error('Error fetching workflow run logs URL')
    }
  }

  /**
   * Retrieves the jobs associated with a workflow run.
   *
   * @async
   * @param {string} repoOwner - The owner of the repository.
   * @param {string} repoName - The repository name.
   * @param {number} runId - The ID of the workflow run.
   * @returns {Promise<Array<Job>>} A promise that resolves with an array of job objects.
   */
  async getWorkflowRunJobs(
    repoOwner: string,
    repoName: string,
    runId: number
  ): Promise<Job[]> {
    try {
      const { data: jobsData } =
        await this.client.actions.listJobsForWorkflowRun({
          owner: repoOwner,
          repo: repoName,
          run_id: runId
        })

      const jobs: Job[] = jobsData.jobs.map(job => ({
        id: job.id,
        name: job.name,
        status: job.status,
        conclusion: job.conclusion,
        // Assuming `steps` is present and formatted similarly, else you need to map again inside
        steps: job.steps
      }))

      core.debug(`Number of jobs for given workflow run: ${jobs.length}`)
      return jobs
    } catch (error) {
      if (error instanceof Error)
        core.debug(
          `Error fetching jobs for given workflow run: ${error.message}`
        )
      throw new Error('Error fetching jobs for given workflow run')
    }
  }

  /**
   * Retrieves the YAML file content of a workflow at a specific commit.
   *
   * @param {string} owner - The owner of the repository.
   * @param {string} repo - The name of the repository.
   * @param {string} path - The path to the YAML file.
   * @param {string} sha - The commit SHA.
   * @return {Promise<void>} - A promise representing the operation.
   * @throws {Error} - If there is an error retrieving the file content.
   */
  async getWorkflowYAMLAtCommit(
    owner: string,
    repo: string,
    path: string,
    sha: string
  ): Promise<any> {
    try {
      const response = await this.client.repos.getContent({
        owner,
        repo,
        path,
        sha
      })
      return response.data
    } catch (error) {
      if (error instanceof Error)
        core.debug(`Error getting file content: ${error.message}`)
      throw new Error('Error getting file content')
    }
  }

  /**
   * Creates an issue and returns its URL.
   * @param {string} owner - The owner of the repository.
   * @param {string} repo - The repository name.
   * @param {string} title - The title of the issue.
   * @param {string} body - The body text of the issue.
   * @returns {Promise<string>} - A promise that resolves to the URL of the created issue.
   */
  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body: string
  ): Promise<string> {
    try {
      const response = await this.client.issues.create({
        owner,
        repo,
        title,
        body
      })
      return response.data.html_url
    } catch (error) {
      if (error instanceof Error)
        core.debug(`Error creating issue: ${error.message}`)
      throw new Error('Error creating issue')
    }
  }

  /**
   * Creates a pull request and returns its URL.
   * @param {string} owner - The owner of the repository.
   * @param {string} repo - The repository name.
   * @param {string} head - The name of the branch where your changes are implemented.
   * @param {string} base - The name of the branch you want the changes pulled into.
   * @param {string} title - The title of the pull request.
   * @param {string} body - The body text of the pull request.
   * @returns {Promise<string>} - A promise that resolves to the URL of the created pull request.
   */
  async createPullRequest(
    owner: string,
    repo: string,
    head: string,
    base: string,
    title: string,
    body: string
  ): Promise<string> {
    try {
      const response = await this.client.pulls.create({
        owner,
        repo,
        head,
        base,
        title,
        body
      })
      return response.data.html_url
    } catch (error) {
      if (error instanceof Error)
        core.debug(`Error creating pull request: ${error.message}`)
      throw new Error('Error creating pull request')
    }
  }
}
