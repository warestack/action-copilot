/**
 * The base URL for the API.
 * @constant
 */
export const Queries = {
  IDENTIFY_ERRORS:
    'Please review the following logs and identify the root cause of the failure. Note that the issue might be related to incorrect configurations, missing or incorrect environment variables, and secrets:\n',
  GENERATE_ISSUE_DETAILS:
    'Generate the issue details based on the following issue:\n',
  GENERATE_PR_DETAILS:
    'Generate the pull request details based on the following issue and related workflow YAML content, but only if a fix can be proposed:\n'
}

export const ISSUE_INSTRUCTIONS = `
Answer in json using the following schema:
{
  title: string // Meaningful short title 
  description: string // Well structured with sections description in markdown format
}
`
export const PR_INSTRUCTIONS = `
Answer in json using the following schema:
{
  title: string // Meaningful short title 
  description: string // Well structured with sections and a link to the related issue description in markdown format
  branch: string // Name of the PR branch, use the "hotfix/" prefix and make it clear what the purpose of the PR branch
  patch: string // Patch content with the proposed fix to be applied with git. Skip it if the issue is not related with the workflow YAML content
  commit: string // Commit message
}
`

/**
 * The base URL for the API.
 * @constant
 */
export const Models = {
  DAVINCI_002: 'davinci-002',
  BABBAGE_002: 'babbage-002',
  GTP_3_5_TURBO_INSTRUCT: 'gpt-3.5-turbo-instruct',
  GTP_4_TURBO_2024_04_09: 'gpt-4-turbo-2024-04-09',
  GTP_4_OMNI: 'gpt-4o'
}

/**
 * The base URL for the API.
 * @constant
 */
export const Limits = {
  MAX_TOKENS: 100
}

export const errorPatterns = [
  /error:/i, // Generic error messages
  /\[error\]/i, // Tagged error messages
  /failed/i, // Failures in operations
  /exit code: \d+/i // Non-zero exit codes, typically indicate errors
]

// Regular expression to match ISO 8601 timestamps at the start of each line
export const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z /gm

export const newlineRegex = /\r\n|\n|\r/g
