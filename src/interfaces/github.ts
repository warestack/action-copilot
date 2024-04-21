/**
 * Represents the details of an issue.
 *
 * @interface IssueDetails
 */
export interface IssueDetails {
  title: string
  description: string
}

export interface PrDetails {
  title: string
  description: string
  branch: string
  patch: string
  commit: string
}
