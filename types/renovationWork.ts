export type WorkStatus = 'active' | 'planned' | 'future' | 'completed'
export type ExecutionType = 'DIY' | 'Contractor' | 'Hybrid'
export type TimelineType = 'now' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | string

export interface WorkTodo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  completedAt?: Date
  priority?: 'low' | 'medium' | 'high'
  dueDate?: Date
  assignee?: string
  notes?: string
}

export interface WorkDocument {
  id: string
  type: 'invoice' | 'receipt' | 'quote' | 'contract' | 'photo' | 'other'
  name: string
  url?: string
  file?: File
  uploadedAt: Date
  amount?: number
  description?: string
}

export interface WorkProgress {
  id: string
  date: Date
  description: string
  photos: string[]
  notes?: string
}

export interface CostLine {
  id: string
  description: string
  amount: number
  createdAt: Date
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
  todos: WorkTodo[]
  documents: WorkDocument[]
  progressUpdates: WorkProgress[]
  costLines?: CostLine[]
  workComponents?: WorkComponent[] // New: Predefined work templates
  progress: number
  progressDescription?: string
  canActivate: boolean
  financing?: {
    secured: boolean
    type?: string
    amount?: number
  }
  contractor?: {
    name?: string
    phone?: string
    email?: string
    contractSigned?: boolean
  }
  startDate?: Date
  expectedEndDate?: Date
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  projectId?: string
}

// New interface for predefined work components
export interface WorkComponent {
  id: string
  type: 'insulation' | 'demolition' | 'installation' | 'finishing' | 'structural'
  category: string // e.g., 'roof-insulation', 'wall-demolition'
  name: string
  description: string
  estimatedCost?: number
  estimatedDuration?: number // in days
  requiredSkills: 'DIY' | 'Professional' | 'Specialist'
  materials?: string[]
  warnings?: string[] // e.g., 'Requires asbestos check', 'Permit needed'
  selected: boolean
  completed: boolean
  actualCost?: number
  notes?: string
}

export interface RenovationWorksState {
  works: RenovationWork[]
  loading: boolean
  error: string | null
}

