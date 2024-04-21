import OpenAI from 'openai'
import {
  Models,
  Limits,
  Queries,
  ISSUE_INSTRUCTIONS,
  PR_INSTRUCTIONS,
  workflowYamlContent,
  newlineRegex
} from '../conf/constants'
import * as core from '@actions/core'
import { IssueDetails, PrDetails } from '../interfaces/github'

export class OpenAIApiClient {
  private client
  private messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey
    })
  }

  async analyzeLogs(log: string): Promise<string> {
    this.messages.push({
      role: 'user',
      content: `${Queries.IDENTIFY_ERRORS}\n ${log}`
    })
    const errorAnalysis = await this.client.chat.completions.create({
      model: Models.GTP_4_TURBO_2024_04_09,
      messages: this.messages,
      max_tokens: Limits.MAX_TOKENS
    })

    return errorAnalysis.choices[0].message.content?.trim() || ''
  }

  async proposeFixes(issue: string): Promise<string> {
    this.messages.push({
      role: 'user',
      content: `${Queries.IDENTIFY_ERRORS}\n ${issue}`
    })
    const fixes = await this.client.chat.completions.create({
      model: Models.GTP_4_TURBO_2024_04_09,
      messages: this.messages,
      max_tokens: Limits.MAX_TOKENS
    })

    return fixes.choices[0].message.content?.trim() || ''
  }

  async generateIssueDetails(issue: string): Promise<IssueDetails> {
    this.messages.push({
      role: 'user',
      content: `${Queries.GENERATE_ISSUE_DETAILS}\n ${issue} \n${ISSUE_INSTRUCTIONS}`
    })
    const details = await this.client.chat.completions.create({
      model: Models.GTP_4_TURBO_2024_04_09,
      messages: this.messages,
      max_tokens: 500,
      response_format: { type: 'json_object' }
      // logit_bias: { '1734': -100 }
    })

    let content = details.choices[0].message.content || '{}'
    content = content.replace(newlineRegex, '')
    const issueDetails: IssueDetails = JSON.parse(content)
    core.debug(`Content: ${issueDetails.title}`)
    return issueDetails
  }

  async generatePrDetails(issue: string): Promise<PrDetails> {
    this.messages.push({
      role: 'user',
      content: `${Queries.GENERATE_PR_DETAILS}\n ${issue} \n ${workflowYamlContent} \n${PR_INSTRUCTIONS}`
    })
    const details = await this.client.chat.completions.create({
      model: Models.GTP_4_TURBO_2024_04_09,
      messages: this.messages,
      max_tokens: 500,
      response_format: { type: 'json_object' }
      // logit_bias: { '1734': -100 }
    })

    let content = details.choices[0].message.content || '{}'
    content = content.replace(newlineRegex, '')
    const prDetails: PrDetails = JSON.parse(content)
    return prDetails
  }
}
