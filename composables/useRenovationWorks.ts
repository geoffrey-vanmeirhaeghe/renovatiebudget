import type { RenovationWork, WorkStatus, WorkPhase, RenovationWorksState } from '~/types/renovationWork'
import { PHASE_ORDER } from '~/types/renovationWork'

export const useRenovationWorks = () => {
  const state = useState<RenovationWorksState>('renovationWorks', () => ({
    works: [],
    loading: false,
    error: null
  }))

  const activeWorks = computed(() => 
    state.value.works.filter(w => w.status === 'active')
  )

  const plannedWorks = computed(() => 
    state.value.works.filter(w => w.status === 'planned')
  )

  const futureWorks = computed(() => 
    state.value.works.filter(w => w.status === 'future')
  )

  const completedWorks = computed(() => 
    state.value.works.filter(w => w.status === 'completed')
  )

  const totalBudget = computed(() => 
    state.value.works.reduce((sum, work) => sum + work.budget, 0)
  )

  const totalSpent = computed(() => 
    state.value.works
      .filter(w => w.actualCost)
      .reduce((sum, work) => sum + (work.actualCost || 0), 0)
  )

  const initializeMockData = () => {
    const mockWorks: RenovationWork[] = [
      {
        id: 'work-1',
        name: 'Kitchen Renovation',
        description: 'Complete kitchen remodel with new cabinets and appliances',
        budget: 15000,
        status: 'active',
        executionType: 'Hybrid',
        timeline: 'now',
        currentPhase: 'execute',
        phases: [
          { phase: 'dream', status: 'completed', completedAt: new Date('2024-01-15') },
          { phase: 'financing', status: 'completed', completedAt: new Date('2024-02-01') },
          { phase: 'design', status: 'completed', completedAt: new Date('2024-03-01') },
          { phase: 'plan', status: 'completed', completedAt: new Date('2024-04-01') },
          { phase: 'execute', status: 'in_progress' },
          { phase: 'admin', status: 'pending' },
          { phase: 'close', status: 'pending' }
        ],
        progress: 65,
        progressDescription: '65% complete',
        canActivate: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      {
        id: 'work-2',
        name: 'Bathroom Remodel',
        description: 'Master bathroom renovation with new fixtures',
        budget: 8000,
        status: 'active',
        executionType: 'DIY',
        timeline: 'now',
        currentPhase: 'plan',
        phases: [
          { phase: 'dream', status: 'completed', completedAt: new Date('2024-02-01') },
          { phase: 'financing', status: 'completed', completedAt: new Date('2024-03-01') },
          { phase: 'design', status: 'completed', completedAt: new Date('2024-04-01') },
          { phase: 'plan', status: 'in_progress', notes: 'Ordering materials' },
          { phase: 'execute', status: 'pending' },
          { phase: 'admin', status: 'pending' },
          { phase: 'close', status: 'pending' }
        ],
        progress: 30,
        progressDescription: 'Ordering materials',
        canActivate: false,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      },
      {
        id: 'work-3',
        name: 'Roof Insulation',
        description: 'Energy-efficient roof insulation installation',
        budget: 6000,
        status: 'active',
        executionType: 'Contractor',
        timeline: 'now',
        currentPhase: 'financing',
        phases: [
          { phase: 'dream', status: 'completed', completedAt: new Date('2024-03-01') },
          { phase: 'financing', status: 'in_progress', notes: 'Applying for green loan' },
          { phase: 'design', status: 'pending' },
          { phase: 'plan', status: 'pending' },
          { phase: 'execute', status: 'pending' },
          { phase: 'admin', status: 'pending' },
          { phase: 'close', status: 'pending' }
        ],
        progress: 15,
        progressDescription: 'Applying for green loan',
        canActivate: false,
        financing: {
          secured: false,
          type: 'Green loan application in progress'
        },
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date()
      },
      {
        id: 'work-4',
        name: 'Solar Panel Installation',
        description: 'Rooftop solar panel system with battery storage',
        budget: 8000,
        status: 'planned',
        executionType: 'Contractor',
        timeline: 'Q2',
        year: 2025,
        currentPhase: 'dream',
        phases: [
          { phase: 'dream', status: 'completed' },
          { phase: 'financing', status: 'pending' },
          { phase: 'design', status: 'pending' },
          { phase: 'plan', status: 'pending' },
          { phase: 'execute', status: 'pending' },
          { phase: 'admin', status: 'pending' },
          { phase: 'close', status: 'pending' }
        ],
        progress: 0,
        canActivate: true,
        financing: {
          secured: true,
          type: 'Budgeted',
          amount: 8000
        },
        createdAt: new Date('2024-04-01'),
        updatedAt: new Date()
      },
      {
        id: 'work-5',
        name: 'Garden Terrace',
        description: 'Outdoor terrace with pergola and landscaping',
        budget: 5000,
        status: 'planned',
        executionType: 'Hybrid',
        timeline: 'Q3',
        year: 2025,
        currentPhase: 'dream',
        phases: [
          { phase: 'dream', status: 'completed' },
          { phase: 'financing', status: 'pending' },
          { phase: 'design', status: 'pending' },
          { phase: 'plan', status: 'pending' },
          { phase: 'execute', status: 'pending' },
          { phase: 'admin', status: 'pending' },
          { phase: 'close', status: 'pending' }
        ],
        progress: 0,
        canActivate: true,
        financing: {
          secured: true,
          type: 'Budgeted',
          amount: 5000
        },
        createdAt: new Date('2024-04-15'),
        updatedAt: new Date()
      },
      {
        id: 'work-6',
        name: 'Window Replacement',
        description: 'Triple-glazed energy efficient windows throughout',
        budget: 12000,
        status: 'future',
        executionType: 'Contractor',
        timeline: '2027',
        year: 2027,
        currentPhase: 'dream',
        phases: [
          { phase: 'dream', status: 'pending' },
          { phase: 'financing', status: 'pending' },
          { phase: 'design', status: 'pending' },
          { phase: 'plan', status: 'pending' },
          { phase: 'execute', status: 'pending' },
          { phase: 'admin', status: 'pending' },
          { phase: 'close', status: 'pending' }
        ],
        progress: 0,
        canActivate: false,
        financing: {
          secured: true,
          type: 'Mijnverbouwlening secured',
          amount: 12000
        },
        createdAt: new Date('2024-05-01'),
        updatedAt: new Date()
      },
      {
        id: 'work-7',
        name: 'Full Attic Conversion',
        description: 'Convert attic into master suite with bathroom',
        budget: 20000,
        status: 'future',
        executionType: 'Contractor',
        timeline: '2028',
        year: 2028,
        currentPhase: 'dream',
        phases: [
          { phase: 'dream', status: 'pending' },
          { phase: 'financing', status: 'pending' },
          { phase: 'design', status: 'pending' },
          { phase: 'plan', status: 'pending' },
          { phase: 'execute', status: 'pending' },
          { phase: 'admin', status: 'pending' },
          { phase: 'close', status: 'pending' }
        ],
        progress: 0,
        canActivate: false,
        financing: {
          secured: false,
          type: 'Conceptual'
        },
        createdAt: new Date('2024-05-15'),
        updatedAt: new Date()
      }
    ]

    state.value.works = mockWorks
  }

  const loadWorks = async (projectId?: string) => {
    state.value.loading = true
    state.value.error = null

    try {
      const config = useRuntimeConfig()
      const strapiUrl = config.public.strapiBaseUrl

      if (strapiUrl && projectId) {
        console.log('🔄 Attempting to load renovation works from Strapi...')
        
        const response = await $fetch(`${strapiUrl}/api/renovation-works`, {
          params: {
            'filters[project][id][$eq]': projectId,
            'populate': '*'
          }
        }).catch((error) => {
          console.warn('⚠️ Strapi renovation-works endpoint not available, using mock data')
          throw error
        })

        if (response && response.data) {
          console.log('✅ Loaded renovation works from Strapi')
          state.value.works = transformStrapiWorks(response.data)
          return
        }
      }
    } catch (error) {
      console.log('📦 Using mock renovation works data')
    }

    initializeMockData()
    state.value.loading = false
  }

  const transformStrapiWorks = (strapiData: any[]): RenovationWork[] => {
    return strapiData.map(item => ({
      id: item.id.toString(),
      name: item.attributes.name,
      description: item.attributes.description,
      budget: item.attributes.budget,
      actualCost: item.attributes.actualCost,
      status: item.attributes.status,
      executionType: item.attributes.executionType,
      timeline: item.attributes.timeline,
      year: item.attributes.year,
      currentPhase: item.attributes.currentPhase,
      phases: item.attributes.phases || [],
      progress: item.attributes.progress || 0,
      progressDescription: item.attributes.progressDescription,
      canActivate: item.attributes.canActivate || false,
      financing: item.attributes.financing,
      createdAt: new Date(item.attributes.createdAt),
      updatedAt: new Date(item.attributes.updatedAt),
      completedAt: item.attributes.completedAt ? new Date(item.attributes.completedAt) : undefined,
      projectId: item.attributes.project?.data?.id
    }))
  }

  const activateWork = async (workId: string) => {
    const work = state.value.works.find(w => w.id === workId)
    if (!work || !work.canActivate) return false

    try {
      const config = useRuntimeConfig()
      const strapiUrl = config.public.strapiBaseUrl

      if (strapiUrl) {
        await $fetch(`${strapiUrl}/api/renovation-works/${workId}`, {
          method: 'PUT',
          body: {
            data: {
              status: 'active',
              canActivate: false,
              currentPhase: 'financing',
              phases: work.phases.map(p => 
                p.phase === 'financing' 
                  ? { ...p, status: 'in_progress' }
                  : p
              )
            }
          }
        }).catch(() => {
          console.log('📦 Updating mock data locally')
        })
      }
    } catch (error) {
      console.log('📦 Updating mock data locally')
    }

    work.status = 'active'
    work.canActivate = false
    work.currentPhase = 'financing'
    work.phases = work.phases.map(p => 
      p.phase === 'financing' 
        ? { ...p, status: 'in_progress' }
        : p
    )
    work.updatedAt = new Date()

    return true
  }

  const updateWorkProgress = async (workId: string, progress: number, description?: string) => {
    const work = state.value.works.find(w => w.id === workId)
    if (!work) return false

    try {
      const config = useRuntimeConfig()
      const strapiUrl = config.public.strapiBaseUrl

      if (strapiUrl) {
        await $fetch(`${strapiUrl}/api/renovation-works/${workId}`, {
          method: 'PUT',
          body: {
            data: {
              progress,
              progressDescription: description
            }
          }
        }).catch(() => {
          console.log('📦 Updating mock data locally')
        })
      }
    } catch (error) {
      console.log('📦 Updating mock data locally')
    }

    work.progress = progress
    if (description) {
      work.progressDescription = description
    }
    work.updatedAt = new Date()

    if (progress === 100) {
      work.status = 'completed'
      work.completedAt = new Date()
    }

    return true
  }

  const advancePhase = async (workId: string) => {
    const work = state.value.works.find(w => w.id === workId)
    if (!work) return false

    const currentPhaseIndex = PHASE_ORDER.indexOf(work.currentPhase)
    if (currentPhaseIndex === -1 || currentPhaseIndex === PHASE_ORDER.length - 1) {
      return false
    }

    const currentPhaseDetail = work.phases.find(p => p.phase === work.currentPhase)
    if (currentPhaseDetail) {
      currentPhaseDetail.status = 'completed'
      currentPhaseDetail.completedAt = new Date()
    }

    const nextPhase = PHASE_ORDER[currentPhaseIndex + 1]
    const nextPhaseDetail = work.phases.find(p => p.phase === nextPhase)
    if (nextPhaseDetail) {
      nextPhaseDetail.status = 'in_progress'
    }

    try {
      const config = useRuntimeConfig()
      const strapiUrl = config.public.strapiBaseUrl

      if (strapiUrl) {
        await $fetch(`${strapiUrl}/api/renovation-works/${workId}`, {
          method: 'PUT',
          body: {
            data: {
              currentPhase: nextPhase,
              phases: work.phases
            }
          }
        }).catch(() => {
          console.log('📦 Updating mock data locally')
        })
      }
    } catch (error) {
      console.log('📦 Updating mock data locally')
    }

    work.currentPhase = nextPhase
    work.updatedAt = new Date()

    const completedPhases = work.phases.filter(p => p.status === 'completed').length
    work.progress = Math.round((completedPhases / work.phases.length) * 100)

    return true
  }

  const createWork = async (workData: Partial<RenovationWork>) => {
    const newWork: RenovationWork = {
      id: `work-${Date.now()}`,
      name: workData.name || 'New Work',
      description: workData.description,
      budget: workData.budget || 0,
      status: workData.status || 'planned',
      executionType: workData.executionType || 'DIY',
      timeline: workData.timeline || 'Q1',
      year: workData.year || new Date().getFullYear() + 1,
      currentPhase: 'dream',
      phases: PHASE_ORDER.map(phase => ({
        phase,
        status: phase === 'dream' ? 'in_progress' : 'pending'
      })),
      progress: 0,
      canActivate: workData.status === 'planned',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...workData
    }

    try {
      const config = useRuntimeConfig()
      const strapiUrl = config.public.strapiBaseUrl

      if (strapiUrl) {
        const response = await $fetch(`${strapiUrl}/api/renovation-works`, {
          method: 'POST',
          body: {
            data: newWork
          }
        }).catch(() => {
          console.log('📦 Creating work in mock data')
          return null
        })

        if (response && response.data) {
          const transformedWork = transformStrapiWorks([response.data])[0]
          state.value.works.push(transformedWork)
          return transformedWork
        }
      }
    } catch (error) {
      console.log('📦 Creating work in mock data')
    }

    state.value.works.push(newWork)
    return newWork
  }

  const deleteWork = async (workId: string) => {
    try {
      const config = useRuntimeConfig()
      const strapiUrl = config.public.strapiBaseUrl

      if (strapiUrl) {
        await $fetch(`${strapiUrl}/api/renovation-works/${workId}`, {
          method: 'DELETE'
        }).catch(() => {
          console.log('📦 Deleting from mock data')
        })
      }
    } catch (error) {
      console.log('📦 Deleting from mock data')
    }

    state.value.works = state.value.works.filter(w => w.id !== workId)
    return true
  }

  return {
    state: readonly(state),
    activeWorks,
    plannedWorks,
    futureWorks,
    completedWorks,
    totalBudget,
    totalSpent,
    loadWorks,
    activateWork,
    updateWorkProgress,
    advancePhase,
    createWork,
    deleteWork
  }
}