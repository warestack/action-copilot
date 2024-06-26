import * as fs from 'fs'

import { exec } from 'child_process'
import { promisify } from 'util'
import { simpleGit } from 'simple-git'

export class GitClient {
  private git
  execAsync = promisify(exec)

  constructor(token: string) {
    this.git = simpleGit({
      baseDir: process.cwd(),
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false
    })
    // Configure git
    this.git.addConfig('user.name', 'Action Copilot')
    this.git.addConfig('user.email', 'copilot@warestack.com')
    this.git.addConfig('http.extraHeader', `Authorization: token ${token}`)
  }

  /**
   * Asynchronously applies a patch, commits the changes, and pushes them to the remote repository.
   *
   * @param {string} patchContent - The content of the patch to apply.
   * @param {string} commitMessage - The commit message to use for the changes.
   * @param {string} newBranchName - The name of the new branch to create and checkout.
   * @return {Promise<void>} - A Promise that resolves when the patch, commit, and push process completes successfully.
   * @throws {Error} - If there is an error patching, committing, or pushing the changes.
   */
  async patchCommitAndPush(
    patchContent: string,
    commitMessage: string,
    newBranchName: string
  ): Promise<void> {
    try {
      // Change to the repository directory if not already there
      process.chdir(process.env.GITHUB_WORKSPACE || '')

      const patchFile = 'temp.patch'
      // Write the patch content to a file
      fs.writeFileSync(patchFile, `${patchContent.trim()}\n`, 'utf-8')

      // Create and checkout the branch with the name proposed by AI
      await this.execAsync(`git checkout -b ${newBranchName}`)
      // Apply the patch generated by AI
      const { stderr } = await this.execAsync(
        `git apply --recount --ignore-space-change --ignore-whitespace ${patchFile}`
      )
      if (stderr) {
        throw new Error(`Patch application reported errors: ${stderr}`)
      }

      await this.execAsync(`git commit -am '${commitMessage}'`)
      await this.execAsync(`git push -u origin ${newBranchName}`)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Error patching, committing and pushing: ${error.message}`
        )
      }
    }
  }
}
