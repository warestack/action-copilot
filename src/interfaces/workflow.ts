/**
 * Represents a run.
 *
 * @interface Run
 */
export interface Run {
  id: number
  name: string
  runNumber: number
  status: 'queued' | 'in_progress' | 'completed'
  conclusion:
    | 'success'
    | 'failure'
    | 'neutral'
    | 'cancelled'
    | 'timed_out'
    | 'action_required'
  steps: Step[]
}

/**
 * Represents a job in the system.
 * @interface
 */
export interface Job {
  id: number
  name: string
  conclusion:
    | 'success'
    | 'failure'
    | 'neutral'
    | 'cancelled'
    | 'skipped'
    | 'timed_out'
    | 'action_required'
    | null
  status:
    | 'queued'
    | 'in_progress'
    | 'completed'
    | 'waiting'
    | 'requested'
    | 'pending'
  steps: Step[] | undefined
}

/**
 * Represents a step in a process or workflow.
 */
export interface Step {
  name: string
  status: 'queued' | 'in_progress' | 'completed'
  conclusion: string | null
  number: number
  started_at?: string | null
  completed_at?: string | null
}

export interface ErrorResponse {
  message: string
  statusCode: number
}
