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


  const loadWorks = async (userId?: string) => {
    state.value.loading = true
    state.value.error = null

    try {
      const { fetchUserRenovationWorks } = useStrapi()
      const works = await fetchUserRenovationWorks(userId)
      state.value.works = works
      console.log(`✅ Loaded ${works.length} renovation works from Strapi`)
    } catch (error) {
      console.error('❌ Failed to load renovation works from Strapi:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to load renovation works'
      state.value.works = [] // Ensure clean state instead of mock data
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
      const { currentUser } = useAuth()
      const { currentProject } = useProject()
      
      const newWork = await createRenovationWork({
        ...workData,
        userId: currentUser.value?.id,
        projectId: currentProject.value?.id
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