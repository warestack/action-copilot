/**
 * Represents the details of an issue.
 *
 * @interface IssueDetails
 */
export interface IssueDetails {
  id: number
  title: string
  body: string
  html_url: string
}

export interface PrDetails {
  title: string
  description: string
  branch: string
  patch: string
  commit: string
}
