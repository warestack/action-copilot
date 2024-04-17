import { Octokit } from '@octokit/rest'

export class GitHubApiClient {
  private client

  constructor(token: string) {
    this.client = new Octokit({ auth: token })
  }

  /**
   * Retrieves the URL to download an archive of log files for a specific workflow run.
   * @param {string} owner - The owner of the repository.
   * @param {string} repo - The repository name.
   * @param {number} run_id - The ID of the workflow run.
   * @returns {Promise<string>} - A promise that resolves to the URL for downloading the log archive.
   */
  async getWorkflowRunLogsUrl(
    owner: string,
    repo: string,
    run_id: number
  ): Promise<string> {
    try {
      // Fetch logs
      const response = await this.client.actions.downloadWorkflowRunLogs({
        owner,
        repo,
        run_id
      })

      return response.url
    } catch (error) {
      throw new Error('Error fetching workflow run logs URL')
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
      throw new Error('Error creating pull request')
    }
  }
}
