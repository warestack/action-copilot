/**
 * The base URL for the API.
 * @constant
 */
export const Queries = {
  EXPLAIN_ERROR:
    'Explain the following error extracted from the GitHub workflow logs:\n',
  IDENTIFY_ERRORS: 'Highlight the errors in the following logs:\n',
  PROPOSE_FIXES: 'Propose code fixes for the following error:\n',
  GENERATE_PR_DETAILS:
    'Generate a pull request title and description based on the following fixes:\n',
  GENERATE_ISSUE_DETAILS:
    'Generate a pull request title and description based on the following issues and suggest potential fixes:\n'
}

/**
 * The base URL for the API.
 * @constant
 */
export const Models = {
  GTP_4_TURBO: 'gpt-4-turbo'
}

/**
 * The base URL for the API.
 * @constant
 */
export const TokenLimits = {
  MAX_TOKENS: 500
}

export const errorPatterns = [
  /error:/i, // Generic error messages
  /\[error\]/i, // Tagged error messages
  /failed/i, // Failures in operations
  /exit code: \d+/i // Non-zero exit codes, typically indicate errors
]
