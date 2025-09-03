<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- App Header -->
    <AppHeader />
    
    <div class="flex-1 w-full max-w-8xl mx-auto p-6 box-border min-w-0">
      <!-- Main Dashboard Layout: Two Columns -->
      <div class="flex flex-col lg:flex-row gap-4 lg:gap-6 min-w-0 w-full">
        <!-- Left Column: Combined Project Info + 3D Preview -->
        <div class="flex flex-col gap-4 lg:gap-6 flex-none lg:w-80 min-w-0">
          <!-- Combined Project Card -->
          <div class="bg-white rounded-lg p-4 shadow-sm flex flex-col gap-4 border border-gray-200">
            <!-- Project Header -->
            <div class="text-center pb-2">
              <h3 class="text-base font-semibold text-gray-900 mb-1 leading-tight">{{ currentProject?.name || 'Untitled Project' }}</h3>
              <div class="text-xs text-gray-500 font-medium">{{ currentUser?.address?.municipality }}</div>
            </div>

            <!-- 3D Model Preview Section -->
            <div class="relative min-h-45 rounded-md overflow-hidden bg-gray-50 border border-gray-200">
              <div class="w-full h-full relative cursor-pointer rounded-md transition-transform duration-200 min-h-45 hover:scale-105" @click="enterBuilder">
                <div class="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center gap-4 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none hover:pointer-events-auto rounded-md z-10">
                  <div class="w-16 h-16 rounded-full bg-primary-500 bg-opacity-90 text-white flex items-center justify-center text-2xl shadow-lg transition-transform duration-200 hover:scale-110">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <div class="text-center text-white">
                    <h3 class="text-xl font-semibold mb-2">3D Builder</h3>
                    <p class="text-sm opacity-90">Click to enter 3D editing mode</p>
                  </div>
                </div>
                <!-- 3D Model Preview Placeholder -->
                <div class="w-full h-full min-h-45 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md transition-all duration-300 flex items-center justify-center">
                  <div class="text-center text-gray-500">
                    <div class="text-2xl font-bold mb-2 opacity-60 text-primary-500 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">3D</div>
                    <h4 class="text-sm font-semibold mb-1 text-gray-600">Model Preview</h4>
                    <p class="text-xs opacity-70 text-gray-500">
                      Click to edit your house
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Compact Stats -->
            <div class="flex justify-between p-3 bg-gray-50 rounded-md border border-gray-200" v-if="projectStats">
              <div class="flex flex-col items-center gap-1">
                <span class="text-xs text-gray-500 font-medium uppercase tracking-wider">Floors</span>
                <span class="text-sm font-semibold text-gray-900">{{ projectStats.floors }}</span>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="text-xs text-gray-500 font-medium uppercase tracking-wider">Windows</span>
                <span class="text-sm font-semibold text-gray-900">{{ projectStats.windows }}</span>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="text-xs text-gray-500 font-medium uppercase tracking-wider">Doors</span>
                <span class="text-sm font-semibold text-gray-900">{{ projectStats.doors }}</span>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="text-xs text-gray-500 font-medium uppercase tracking-wider">Rooms</span>
                <span class="text-sm font-semibold text-gray-900">{{ projectStats.rooms }}</span>
              </div>
            </div>

            <!-- Simple Status -->
            <div class="flex flex-col gap-2">
              <div class="text-xs text-gray-500 font-medium uppercase tracking-wider">Status</div>
              <div class="text-sm text-success-600 font-semibold">Planning Phase</div>
              <div class="flex items-center gap-2">
                <div class="flex-1 h-1 bg-gray-200 rounded-sm overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-300 ease-out" style="width: 65%"></div>
                </div>
                <span class="text-xs text-gray-500 font-medium whitespace-nowrap">65%</span>
              </div>
            </div>

            <!-- Open 3D Builder Button -->
            <button @click="enterBuilder" class="bg-primary-500 text-white border-0 px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all duration-200 w-full hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-md">
              Open 3D Builder
            </button>
          </div>
        </div>

        <!-- Right Column: Work Management Schedule -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex-1 min-w-0 overflow-hidden">
          <div class="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <h3 class="text-xl font-semibold text-gray-800">Renovation Works</h3>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-500 font-medium">{{ activeWorks.length }} active</span>
                <span class="text-gray-300">•</span>
                <span class="text-gray-500 font-medium">{{ plannedWorks.length }} planned</span>
                <span class="text-gray-300">•</span>
                <span class="text-gray-900 font-semibold">{{ formatCurrency(totalBudget) }} total budget</span>
              </div>
              <button 
                @click="showCreateWorkModal = true"
                class="bg-primary-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors duration-200 flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Work
              </button>
            </div>
          </div>
          
          <!-- Work Items List -->
          <div class="flex flex-col gap-8 min-w-0 overflow-hidden">
            <!-- Active Works -->
            <div class="flex flex-col gap-4 min-w-0" v-if="activeWorks.length > 0">
              <div class="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Active</div>
              
              <div class="flex relative" v-for="work in activeWorks" :key="work.id">
                <div class="flex-1 bg-white border border-gray-300 rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer" @click="openWorkDetail(work)">
                  <div class="flex justify-between items-start gap-4 min-w-0">
                    <div class="flex flex-col gap-2 flex-1 min-w-0">
                      <h4 class="text-base font-semibold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">{{ work.name }}</h4>
                      <div class="flex items-center gap-3 text-sm flex-wrap">
                        <span class="font-semibold text-success-600">{{ formatCurrency(work.budget) }}</span>
                        <span 
                          class="px-2 py-0.5 rounded text-xs font-semibold"
                          :class="{
                            'bg-success-100 text-success-800': work.executionType === 'DIY',
                            'bg-primary-100 text-primary-800': work.executionType === 'Hybrid',
                            'bg-warning-100 text-warning-800': work.executionType === 'Contractor'
                          }"
                        >
                          {{ work.executionType }}
                        </span>
                        <span class="text-primary-600 font-semibold text-xs bg-primary-100 px-2 py-0.5 rounded">{{ formatWorkTimeline(work.timeline, work.year) }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500 font-medium">{{ work.todos.length }} tasks</span>
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex-1 h-1.5 bg-gray-200 rounded-sm overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-300 ease-out" :style="`width: ${work.progress}%`"></div>
                    </div>
                    <span class="text-xs text-gray-500 font-medium whitespace-nowrap">{{ work.progressDescription || `${work.progress}% complete` }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <WorkActivationToggle
                      :work-id="work.id"
                      :start-date="work.startDate"
                      :todos="work.todos"
                      @update-start-date="handleUpdateStartDate"
                      @open-planning="() => openWorkDetail(work)"
                    />
                  </div>
                </div>
              </div>

            </div>

            <!-- Planned Works -->
            <div class="flex flex-col gap-4 min-w-0" v-if="plannedWorks.length > 0">
              <div class="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Not planned</div>
              
              <div class="flex relative" v-for="work in plannedWorks" :key="work.id">
                <div class="flex-1 bg-warning-50 border border-warning-300 border-dashed rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 hover:bg-warning-100">
                  <div class="flex justify-between items-start gap-4 min-w-0 cursor-pointer" @click="openWorkDetail(work)">
                    <div class="flex flex-col gap-2 flex-1 min-w-0">
                      <h4 class="text-base font-semibold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">{{ work.name }}</h4>
                      <div class="flex items-center gap-3 text-sm flex-wrap">
                        <span class="font-semibold text-success-600">{{ formatCurrency(work.budget) }}</span>
                        <span class="text-gray-600 font-medium" v-if="work.financing?.secured">{{ work.financing.type || 'Budgeted' }}</span>
                        <span class="text-warning-600 font-semibold text-xs bg-warning-100 px-2 py-0.5 rounded">{{ formatWorkTimeline(work.timeline, work.year) }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500 font-medium">{{ work.todos.length }} tasks</span>
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div class="text-xs text-gray-500 italic mb-2" v-if="work.description">
                    {{ work.description }}
                  </div>
                  <div class="flex justify-between items-center">
                    <WorkActivationToggle
                      :work-id="work.id"
                      :start-date="work.startDate"
                      :todos="work.todos"
                      @update-start-date="handleUpdateStartDate"
                      @open-planning="() => openWorkDetail(work)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Future Works -->
            <div class="flex flex-col gap-4 min-w-0" v-if="futureWorks.length > 0">
              <div class="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Future Planned</div>
              
              <div class="flex relative" v-for="work in futureWorks" :key="work.id">
                <div class="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 opacity-70 hover:opacity-90 cursor-pointer" @click="openWorkDetail(work)">
                  <div class="flex justify-between items-start gap-4 min-w-0">
                    <div class="flex flex-col gap-2 flex-1 min-w-0">
                      <h4 class="text-base font-semibold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">{{ work.name }}</h4>
                      <div class="flex items-center gap-3 text-sm flex-wrap">
                        <span class="font-semibold text-success-600">{{ formatCurrency(work.budget) }}</span>
                        <span class="text-gray-600 font-medium">{{ work.financing?.type || 'Conceptual' }}</span>
                        <span class="text-gray-500 font-semibold text-xs bg-gray-200 px-2 py-0.5 rounded">{{ formatWorkTimeline(work.timeline, work.year) }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500 font-medium">{{ work.todos.length }} tasks</span>
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div class="text-xs text-gray-500 italic" v-if="work.financing?.secured">
                    Financing secured • Awaiting {{ work.year }} for execution
                  </div>
                  <div class="text-xs text-gray-500 italic" v-else>
                    Long-term planning
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Renovation Work Detail Modal -->
    <RenovationWorkModal 
      v-if="selectedWork"
      :work="selectedWork"
      :is-open="isModalOpen"
      @close="closeWorkDetail"
      @update="handleWorkUpdate"
    />

    <!-- Create Work Modal -->
    <CreateWorkModal 
      :is-open="showCreateWorkModal"
      @close="showCreateWorkModal = false"
      @create="handleCreateWork"
    />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'
import RenovationWorkModal from '~/components/modals/RenovationWorkModal.vue'
import CreateWorkModal from '~/components/modals/CreateWorkModal.vue'
import type { RenovationWork } from '~/types/renovationWork'

// Protect this page with authentication and onboarding checks
definePageMeta({
  middleware: ['auth', 'onboarding']
})

// Get authentication state
const { currentUser, getUserRegion, logout } = useAuth()

// Get project data
const { currentProject, loadProject } = useProject()

// Get renovation works data
const { 
  state: worksState,
  activeWorks, 
  plannedWorks, 
  futureWorks,
  totalBudget,
  loadWorks,
  activateWork,
  deactivateWork,
  updateWork,
  createWork,
  completeWork
} = useRenovationWorks()

// Modal state
const selectedWork = ref<RenovationWork | null>(null)
const isModalOpen = ref(false)
const showCreateWorkModal = ref(false)

// Calculate project statistics from real Strapi data
const projectStats = computed(() => {
  if (!currentProject.value) return null
  
  const floors = Object.keys(currentProject.value.floors || {}).length
  let windows = 0
  let doors = 0
  let rooms = floors // Simplified: assume 1 room per floor for now
  
  // Count windows and doors across all floors
  Object.values(currentProject.value.floors || {}).forEach((floor: any) => {
    windows += Object.keys(floor.windows || {}).length
    doors += Object.keys(floor.doors || {}).length
  })
  
  return { floors, windows, doors, rooms }
})


// Computed properties for formatting
const daysSinceJoined = computed(() => {
  if (!currentUser.value?.createdAt) return 0
  const diff = Date.now() - new Date(currentUser.value.createdAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
})

// Formatting functions
const formatPropertyType = (type?: string) => {
  const types = {
    house: 'House',
    apartment: 'Apartment', 
    commercial: 'Commercial Property'
  }
  return type ? types[type as keyof typeof types] || type : 'Not specified'
}

const formatRenovationScale = (scale?: string) => {
  const scales = {
    room: 'Single Room',
    floor: 'Entire Floor',
    house: 'Whole Property'
  }
  return scale ? scales[scale as keyof typeof scales] || scale : 'Not specified'
}

const formatTimeline = (timeline?: string) => {
  const timelines = {
    immediate: 'Within 3 months',
    'this-year': 'This year',
    'next-year': 'Next year',
    planning: 'Just planning'
  }
  return timeline ? timelines[timeline as keyof typeof timelines] || timeline : 'Not specified'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long'
  })
}


// Navigation to 3D builder mode
const enterBuilder = () => {
  navigateTo('/builder')
}


// Load project data on mount
onMounted(async () => {
  try {
    const { loadProject } = useProject()
    console.log('🏠 Loading dashboard with user context')
    console.log('User:', currentUser.value?.firstName, currentUser.value?.address?.municipality)
    
    // Load project data (fallback to mock if Strapi unavailable)
    await loadProject('ca66f5looy2mij5rua9yj987', true)
    
    // Load renovation works (using user ID when auth is ready, for now load all)
    await loadWorks()
  } catch (error) {
    console.error('Failed to load Strapi data, falling back to mock data:', error)
    const { loadProject } = useProject()
    await loadProject()
    await loadWorks()
  }
})

// Handle work activation
const handleActivateWork = async (workId: string) => {
  const success = await activateWork(workId)
  if (success) {
    console.log('✅ Work activated successfully')
  }
}

// Handle work deactivation
const handleDeactivateWork = async (workId: string) => {
  const success = await deactivateWork(workId)
  if (success) {
    console.log('⏸️ Work deactivated successfully')
  }
}

// Handle start date updates for works
const handleUpdateStartDate = async (workId: string, date: Date | null) => {
  const { updateWork, state } = useRenovationWorks()
  
  // Find the work to update
  const work = state.value.works.find(w => w.id === workId)
  if (!work) return
  
  // Update the work with new date
  const updatedWork = { ...work, startDate: date, updatedAt: new Date() }
  
  // Calculate new status based on date and todos
  if (!date) {
    updatedWork.status = 'planned'
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    
    if (startDate > today) {
      updatedWork.status = 'future'
    } else if (startDate <= today) {
      const allTodosCompleted = work.todos.length > 0 && 
        work.todos.every(t => t.completed)
      
      if (allTodosCompleted) {
        updatedWork.status = 'completed'
        updatedWork.completedAt = new Date()
      } else {
        updatedWork.status = 'active'
      }
    }
  }
  
  try {
    const success = await updateWork(workId, updatedWork)
    if (success) {
      console.log(`✅ Work date updated successfully`)
    } else {
      console.error(`❌ Failed to update work date`)
    }
  } catch (error) {
    console.error('Failed to update work:', error)
  }
}

// Handle work detail view
const openWorkDetail = (work: RenovationWork) => {
  selectedWork.value = work
  isModalOpen.value = true
}

const closeWorkDetail = () => {
  selectedWork.value = null
  isModalOpen.value = false
}

const handleWorkUpdate = (updatedWork: RenovationWork) => {
  updateWork(updatedWork.id, updatedWork)
}

const handleCreateWork = async (workData: Partial<RenovationWork>) => {
  const newWork = await createWork(workData)
  if (newWork) {
    console.log('✅ Work created successfully:', newWork.name)
    showCreateWorkModal.value = false
  }
}

const handleCompleteWork = async (workId: string) => {
  const result = await completeWork(workId)
  if (result && result.success) {
    console.log('✅ Work completed successfully')
  }
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format timeline
const formatWorkTimeline = (timeline: string, year?: number) => {
  if (timeline === 'now') return 'Now'
  if (year) {
    if (timeline.startsWith('Q')) {
      return `${timeline} ${year}`
    }
    return year.toString()
  }
  return timeline
}
</script>

