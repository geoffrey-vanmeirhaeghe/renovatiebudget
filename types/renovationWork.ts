export type WorkStatus = 'active' | 'planned' | 'future' | 'completed'
export type WorkPhase = 'dream' | 'financing' | 'design' | 'plan' | 'execute' | 'admin' | 'close'
export type ExecutionType = 'DIY' | 'Contractor' | 'Hybrid'
export type TimelineType = 'now' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | string

export interface WorkPhaseDetail {
  phase: WorkPhase
  status: 'pending' | 'in_progress' | 'completed'
  completedAt?: Date
  notes?: string
}

export interface RenovationWork {
  id: string
  name: string
  description?: string
  budget: number
  actualCost?: number
  status: WorkStatus
  executionType: ExecutionType
  timeline: TimelineType
  year?: number
  currentPhase: WorkPhase
  phases: WorkPhaseDetail[]
  progress: number
  progressDescription?: string
  canActivate: boolean
  financing?: {
    secured: boolean
    type?: string
    amount?: number
  }
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  projectId?: string
}

export interface RenovationWorksState {
  works: RenovationWork[]
  loading: boolean
  error: string | null
}

export const PHASE_LABELS: Record<WorkPhase, string> = {
  dream: 'Dream & Discover',
  financing: 'Financing',
  design: 'Design',
  plan: 'Prepare & Plan',
  execute: 'Execute & Track',
  admin: 'Administration',
  close: 'Close'
}

export const PHASE_ORDER: WorkPhase[] = ['dream', 'financing', 'design', 'plan', 'execute', 'admin', 'close']