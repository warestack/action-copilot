/**
 * The base URL for the API.
 * @constant
 */
export const Queries = {
  EXPLAIN_ERROR:
    'Explain the following error extracted from the GitHub workflow logs:\n',
  IDENTIFY_ERRORS:
    'Please review the following logs and identify the root cause of the failure. Note that the issue might be related to incorrect configurations, missing or incorrect environment variables, and secrets:\n',
  PROPOSE_FIXES: 'Propose code fixes for the following error:\n',
  GENERATE_ISSUE_DETAILS:
    'Generate the issue details based on the following issue:\n',
  GENERATE_PR_DETAILS:
    'Generate the pull request details based on the following issue and related workflow YAML content:\n'
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
  patch: string // Patch content with the proposed fix to be applied with git
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
  GTP_4_TURBO_2024_04_09: 'gpt-4-turbo-2024-04-09'
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
export const lineFeedRegex = /%0A/g

export const newlineRegex = /\r\n|\n|\r/g

export const workflowYamlContent = `
# .github/workflows/setup_and_test.yaml
name: "Setup and Test on Push Events"
on:
  push:
    branches:
      - "feature/*" # matches every branch containing 'feature/'
      - "bugfix/*" # matches every branch containing 'bugfix/'
      - "hotfix/*" # matches every branch containing 'hotfix/'
      - "!main" # excludes main branch
  release:
    types: [created]

jobs:
  build:
    name: Setup, Build, and Test
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo
        env:
          MONGO_INITDB_DATABASE: bsc_computing_project
        ports:
          - 27017:27017
        options: >-
          --health-cmd "echo 'db.runCommand("ping").ok' | mongosh --quiet"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
          --name mongo_container
    env:
      JOB_STATUS: succeeded
      DATABASE_URL: mongodb://localost:27017
      DATABASE_NAME: bsc_computing_project


    strategy:
      matrix:
        # Config the virtual env - Python version 3.11 will be used only.
        python-version: [ "3.11" ]

    # Add "id-token" with the intended permissions.
    permissions:
      contents: "read"
      id-token: "write"

    steps:
      # Checkout GitHub branch's config
      - name: Checkout
        uses: actions/checkout@v3

      # Set up the Python version
      - name: Set up the Python version
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"
          architecture: "x64"
          cache: 'pip'

      # Install dependencies along with other required packages
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install pytest pytest-cov
          if [ -f requirements/dev.txt ]; then pip install -r ./requirements/dev.txt; fi
      
      # Run test and output results in JUnit format and parts that lack test coverage
      - name: Run tests
        run: |
          pytest --doctest-modules --junitxml=junit/test-results.xml --cov=com --cov-report=xml --cov-report=html
`
