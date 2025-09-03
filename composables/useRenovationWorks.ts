import type { RenovationWork, WorkStatus, RenovationWorksState, WorkTodo } from '~/types/renovationWork'

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
        todos: [
          { id: 'todo-1', text: 'Order kitchen cabinets', completed: true, createdAt: new Date('2024-04-05'), completedAt: new Date('2024-04-10'), priority: 'high' },
          { id: 'todo-2', text: 'Schedule electrician for wiring', completed: true, createdAt: new Date('2024-04-05'), completedAt: new Date('2024-04-12'), priority: 'high' },
          { id: 'todo-3', text: 'Choose backsplash tiles', completed: true, createdAt: new Date('2024-04-06'), completedAt: new Date('2024-04-15'), priority: 'medium' },
          { id: 'todo-4', text: 'Install cabinets', completed: false, createdAt: new Date('2024-04-10'), priority: 'high' },
          { id: 'todo-5', text: 'Install countertops', completed: false, createdAt: new Date('2024-04-10'), priority: 'high' },
          { id: 'todo-6', text: 'Paint walls', completed: false, createdAt: new Date('2024-04-11'), priority: 'medium' },
          { id: 'todo-7', text: 'Install backsplash', completed: false, createdAt: new Date('2024-04-11'), priority: 'medium' },
          { id: 'todo-8', text: 'Final cleaning', completed: false, createdAt: new Date('2024-04-12'), priority: 'low' }
        ],
        documents: [],
        progressUpdates: [],
        costLines: [],
        progress: 38, // 3 out of 8 todos completed
        progressDescription: '3/8 tasks completed',
        canActivate: false,
        contractor: {
          name: '',
          phone: '',
          email: '',
          contractSigned: false
        },
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
        todos: [
          { id: 'todo-9', text: 'Measure bathroom dimensions', completed: true, createdAt: new Date('2024-04-01'), completedAt: new Date('2024-04-02'), priority: 'high' },
          { id: 'todo-10', text: 'Choose tiles and fixtures', completed: true, createdAt: new Date('2024-04-02'), completedAt: new Date('2024-04-05'), priority: 'high' },
          { id: 'todo-11', text: 'Order materials', completed: false, createdAt: new Date('2024-04-05'), priority: 'high' },
          { id: 'todo-12', text: 'Remove old fixtures', completed: false, createdAt: new Date('2024-04-05'), priority: 'medium' },
          { id: 'todo-13', text: 'Install new plumbing', completed: false, createdAt: new Date('2024-04-05'), priority: 'high' }
        ],
        documents: [],
        progressUpdates: [],
        costLines: [],
        progress: 40, // 2 out of 5 todos completed
        progressDescription: '2/5 tasks completed',
        canActivate: false,
        contractor: {
          name: '',
          phone: '',
          email: '',
          contractSigned: false
        },
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
        todos: [
          { id: 'todo-14', text: 'Research green loans', completed: true, createdAt: new Date('2024-03-05'), completedAt: new Date('2024-03-10'), priority: 'high' },
          { id: 'todo-15', text: 'Apply for green loan', completed: false, createdAt: new Date('2024-03-10'), priority: 'high' },
          { id: 'todo-16', text: 'Get contractor quotes', completed: false, createdAt: new Date('2024-03-10'), priority: 'medium' },
          { id: 'todo-17', text: 'Schedule insulation installation', completed: false, createdAt: new Date('2024-03-10'), priority: 'medium' }
        ],
        documents: [],
        progressUpdates: [],
        costLines: [],
        progress: 25, // 1 out of 4 todos completed
        progressDescription: '1/4 tasks completed',
        canActivate: false,
        financing: {
          secured: false,
          type: 'Green loan application in progress'
        },
        contractor: {
          name: '',
          phone: '',
          email: '',
          contractSigned: false
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
        todos: [],
        documents: [],
        progressUpdates: [],
        progress: 0,
        canActivate: true,
        financing: {
          secured: true,
          type: 'Budgeted',
          amount: 8000
        },
        contractor: {
          name: '',
          phone: '',
          email: '',
          contractSigned: false
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
        todos: [],
        documents: [],
        progressUpdates: [],
        progress: 0,
        canActivate: true,
        financing: {
          secured: true,
          type: 'Budgeted',
          amount: 5000
        },
        contractor: {
          name: '',
          phone: '',
          email: '',
          contractSigned: false
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
        todos: [],
        documents: [],
        progressUpdates: [],
        progress: 0,
        canActivate: false,
        financing: {
          secured: true,
          type: 'Mijnverbouwlening secured',
          amount: 12000
        },
        contractor: {
          name: '',
          phone: '',
          email: '',
          contractSigned: false
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
        todos: [],
        documents: [],
        progressUpdates: [],
        progress: 0,
        canActivate: false,
        financing: {
          secured: false,
          type: 'Conceptual'
        },
        contractor: {
          name: '',
          phone: '',
          email: '',
          contractSigned: false
        },
        createdAt: new Date('2024-05-15'),
        updatedAt: new Date()
      }
    ]

    state.value.works = mockWorks
  }

  const loadWorks = async (userId?: string) => {
    state.value.loading = true
    state.value.error = null

    try {
      const { fetchUserRenovationWorks } = useStrapi()
      const works = await fetchUserRenovationWorks(userId)
      state.value.works = works
      console.log(`✅ Loaded ${works.length} renovation works from Strapi`)
    } catch (error) {
      console.log('📦 Failed to load from Strapi, using mock data:', error)
      initializeMockData()
    } finally {
      state.value.loading = false
    }
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
      todos: item.attributes.todos || [],
      documents: item.attributes.documents || [],
      progressUpdates: item.attributes.progressUpdates || [],
      costLines: item.attributes.costLines || [],
      progress: item.attributes.progress || 0,
      progressDescription: item.attributes.progressDescription,
      canActivate: item.attributes.canActivate || false,
      financing: item.attributes.financing,
      contractor: item.attributes.contractor,
      startDate: item.attributes.startDate ? new Date(item.attributes.startDate) : undefined,
      expectedEndDate: item.attributes.expectedEndDate ? new Date(item.attributes.expectedEndDate) : undefined,
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
      const { updateRenovationWork } = useStrapi()
      const updates = {
        status: 'active',
        canActivate: false,
        startDate: new Date()
      }
      
      await updateRenovationWork(workId, updates)
      
      // Update local state
      work.status = 'active'
      work.canActivate = false
      work.startDate = new Date()
      work.updatedAt = new Date()
      
      return true
    } catch (error) {
      state.value.error = 'Failed to activate work'
      return false
    }
  }

  const deactivateWork = async (workId: string) => {
    const work = state.value.works.find(w => w.id === workId)
    if (!work || work.status !== 'active') return false

    try {
      const { updateRenovationWork } = useStrapi()
      const updates = {
        status: 'planned',
        canActivate: true,
        startDate: null
      }
      
      await updateRenovationWork(workId, updates)
      
      // Update local state
      work.status = 'planned'
      work.canActivate = true
      work.startDate = undefined
      work.updatedAt = new Date()
      
      return true
    } catch (error) {
      state.value.error = 'Failed to deactivate work'
      return false
    }
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


  const createWork = async (workData: Partial<RenovationWork>) => {
    try {
      const { createRenovationWork } = useStrapi()
      const newWork = await createRenovationWork({
        ...workData,
        // TODO: Get actual user ID when auth is ready
        userId: undefined,
        // TODO: Get actual project ID when project integration is ready
        projectId: undefined
      })
      
      state.value.works.push(newWork)
      return newWork
    } catch (error) {
      state.value.error = 'Failed to create work'
      console.log('📦 Failed to create work in Strapi, creating locally:', error)
      
      // Fallback to local creation
      const localWork: RenovationWork = {
        id: `work-${Date.now()}`,
        name: workData.name || 'New Work',
        description: workData.description,
        budget: workData.budget || 0,
        status: workData.status || 'planned',
        executionType: workData.executionType || 'DIY',
        timeline: workData.timeline || 'now',
        year: workData.year || new Date().getFullYear(),
        todos: [],
        attachments: [],
        progressUpdates: [],
        progress: 0,
        canActivate: workData.status === 'planned',
        contractor: {
          name: '',
          phone: '',
          email: ''
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      state.value.works.push(localWork)
      return localWork
    }
  }

  const deleteWork = async (workId: string) => {
    try {
      const { deleteRenovationWork } = useStrapi()
      await deleteRenovationWork(workId)
      
      // Update local state
      state.value.works = state.value.works.filter(w => w.id !== workId)
      return true
    } catch (error) {
      state.value.error = 'Failed to delete work'
      console.log('📦 Failed to delete from Strapi:', error)
      
      // Still remove from local state as fallback
      state.value.works = state.value.works.filter(w => w.id !== workId)
      return true
    }
  }

  // Todo management functions
  const updateWork = async (workId: string, updatedWork: RenovationWork) => {
    const workIndex = state.value.works.findIndex(w => w.id === workId)
    if (workIndex === -1) return false

    try {
      const { updateRenovationWork } = useStrapi()
      await updateRenovationWork(workId, updatedWork)
      
      // Update local state
      state.value.works[workIndex] = {
        ...updatedWork,
        updatedAt: new Date()
      }
      
      return true
    } catch (error) {
      state.value.error = 'Failed to update work'
      console.log('📦 Failed to update in Strapi, updating locally:', error)
      
      // Update local state as fallback
      state.value.works[workIndex] = {
        ...updatedWork,
        updatedAt: new Date()
      }
      
      return true
    }
  }

  const calculateProgress = (todos: WorkTodo[]) => {
    if (todos.length === 0) return 0
    const completed = todos.filter(t => t.completed).length
    return Math.round((completed / todos.length) * 100)
  }

  const addTodoToWork = async (workId: string, todoText: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    const work = state.value.works.find(w => w.id === workId)
    if (!work) return false

    const newTodo: WorkTodo = {
      id: `todo-${Date.now()}`,
      text: todoText,
      completed: false,
      priority,
      createdAt: new Date()
    }

    work.todos.push(newTodo)
    work.progress = calculateProgress(work.todos)
    work.progressDescription = `${work.todos.filter(t => t.completed).length}/${work.todos.length} tasks completed`
    work.updatedAt = new Date()

    // Sync to backend if available
    await updateWork(workId, work)
    
    return true
  }

  const toggleTodo = async (workId: string, todoId: string) => {
    const work = state.value.works.find(w => w.id === workId)
    if (!work) return false

    const todo = work.todos.find(t => t.id === todoId)
    if (!todo) return false

    todo.completed = !todo.completed
    if (todo.completed) {
      todo.completedAt = new Date()
    } else {
      todo.completedAt = undefined
    }

    work.progress = calculateProgress(work.todos)
    work.progressDescription = `${work.todos.filter(t => t.completed).length}/${work.todos.length} tasks completed`
    work.updatedAt = new Date()

    // Sync to backend if available
    await updateWork(workId, work)

    return true
  }

  const deleteTodoFromWork = async (workId: string, todoId: string) => {
    const work = state.value.works.find(w => w.id === workId)
    if (!work) return false

    const todoIndex = work.todos.findIndex(t => t.id === todoId)
    if (todoIndex === -1) return false

    work.todos.splice(todoIndex, 1)
    work.progress = calculateProgress(work.todos)
    work.progressDescription = work.todos.length > 0 
      ? `${work.todos.filter(t => t.completed).length}/${work.todos.length} tasks completed`
      : 'No tasks yet'
    work.updatedAt = new Date()

    // Sync to backend if available
    await updateWork(workId, work)

    return true
  }

  // Helper functions
  const areAllTodosCompleted = (work: RenovationWork): boolean => {
    return work.todos.length > 0 && work.todos.every(todo => todo.completed)
  }

  const completeWork = async (workId: string) => {
    const work = state.value.works.find(w => w.id === workId)
    if (!work) return false

    work.status = 'completed'
    work.completedAt = new Date()
    work.progress = 100
    work.progressDescription = 'Work completed'
    work.updatedAt = new Date()

    // Sync to backend if available
    await updateWork(workId, work)

    return { 
      success: true, 
      workCompleted: true
    }
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
    deactivateWork,
    updateWorkProgress,
    createWork,
    deleteWork,
    updateWork,
    addTodoToWork,
    toggleTodo,
    deleteTodoFromWork,
    calculateProgress,
    areAllTodosCompleted,
    completeWork
  }
}