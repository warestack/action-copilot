import OpenAI from 'openai'
import { Queries, Models } from '../conf/constants'

export class OpenAIApiClient {
  private client

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey
    })
  }

  async analyzeLogs(log: string): Promise<string> {
    const errorAnalysis = await this.client.chat.completions.create({
      messages: [
        { role: 'user', content: `${Queries.EXPLAIN_ERROR}:\n${log}` }
      ],
      model: Models.GTP_4_TURBO
    })

    return errorAnalysis.choices[0].message.content || log
  }

  async proposeFixes(issue: string): Promise<string> {
    const fixes = await this.client.chat.completions.create({
      messages: [
        { role: 'user', content: `${Queries.PROPOSE_FIXES}:\n${issue}` }
      ],
      model: Models.GTP_4_TURBO
    })

    return fixes.choices[0].message.content || ''
  }
}
