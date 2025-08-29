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
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-500 font-medium">3 active</span>
              <span class="text-gray-300">•</span>
              <span class="text-gray-500 font-medium">4 planned</span>
              <span class="text-gray-300">•</span>
              <span class="text-gray-900 font-semibold">€54,000 total budget</span>
            </div>
          </div>
          
          <!-- Work Items List -->
          <div class="flex flex-col gap-8 min-w-0 overflow-hidden">
            <!-- Active Works -->
            <div class="flex flex-col gap-4 min-w-0">
              <div class="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Active</div>
              
              <div class="flex relative">
                <div class="flex-1 bg-white border border-gray-300 rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 shadow-sm">
                  <div class="flex justify-between items-start gap-4 min-w-0">
                    <div class="flex flex-col gap-2 flex-1 min-w-0">
                      <h4 class="text-base font-semibold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">Kitchen Renovation</h4>
                      <div class="flex items-center gap-3 text-sm flex-wrap">
                        <span class="font-semibold text-success-600">€15,000</span>
                        <span class="bg-primary-100 text-primary-800 px-2 py-0.5 rounded text-xs font-semibold">Hybrid</span>
                        <span class="text-primary-600 font-semibold text-xs bg-primary-100 px-2 py-0.5 rounded">Now</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="flex gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-primary-500 transition-all duration-200" title="Dream & Discover"></span>
                      <span class="w-2 h-2 rounded-full bg-primary-500 transition-all duration-200" title="Financing"></span>
                      <span class="w-2 h-2 rounded-full bg-primary-500 transition-all duration-200" title="Design"></span>
                      <span class="w-2 h-2 rounded-full bg-primary-500 transition-all duration-200" title="Prepare & Plan"></span>
                      <span class="w-2 h-2 rounded-full bg-warning-400 shadow-sm animate-pulse-slow" title="Execute & Track"></span>
                      <span class="w-2 h-2 rounded-full bg-gray-200 transition-all duration-200" title="Administration"></span>
                      <span class="w-2 h-2 rounded-full bg-gray-200 transition-all duration-200" title="Close"></span>
                    </div>
                    <span class="text-xs font-semibold text-gray-600">Execute & Track</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex-1 h-1.5 bg-gray-200 rounded-sm overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-300 ease-out" style="width: 65%"></div>
                    </div>
                    <span class="text-xs text-gray-500 font-medium whitespace-nowrap">65% complete</span>
                  </div>
                </div>
              </div>

              <div class="flex relative">
                <div class="flex-1 bg-white border border-gray-300 rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 shadow-sm">
                  <div class="flex justify-between items-start gap-4 min-w-0">
                    <div class="flex flex-col gap-2 flex-1 min-w-0">
                      <h4 class="text-base font-semibold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">Bathroom Remodel</h4>
                      <div class="flex items-center gap-3 text-sm flex-wrap">
                        <span class="font-semibold text-success-600">€8,000</span>
                        <span class="bg-success-100 text-success-800 px-2 py-0.5 rounded text-xs font-semibold">DIY</span>
                        <span class="text-primary-600 font-semibold text-xs bg-primary-100 px-2 py-0.5 rounded">Now</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="flex gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-primary-500 transition-all duration-200" title="Dream & Discover"></span>
                      <span class="w-2 h-2 rounded-full bg-primary-500 transition-all duration-200" title="Financing"></span>
                      <span class="w-2 h-2 rounded-full bg-primary-500 transition-all duration-200" title="Design"></span>
                      <span class="w-2 h-2 rounded-full bg-warning-400 shadow-sm animate-pulse-slow" title="Prepare & Plan"></span>
                      <span class="w-2 h-2 rounded-full bg-gray-200 transition-all duration-200" title="Execute & Track"></span>
                      <span class="w-2 h-2 rounded-full bg-gray-200 transition-all duration-200" title="Administration"></span>
                      <span class="w-2 h-2 rounded-full bg-gray-200 transition-all duration-200" title="Close"></span>
                    </div>
                    <span class="text-xs font-semibold text-gray-600">Prepare & Plan</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex-1 h-1.5 bg-gray-200 rounded-sm overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-300 ease-out" style="width: 30%"></div>
                    </div>
                    <span class="text-xs text-gray-500 font-medium whitespace-nowrap">Ordering materials</span>
                  </div>
                </div>
              </div>

              <div class="flex relative">
                <div class="flex-1 bg-white border border-gray-300 rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 shadow-sm">
                  <div class="flex justify-between items-start gap-4 min-w-0">
                    <div class="flex flex-col gap-2 flex-1 min-w-0">
                      <h4 class="text-base font-semibold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">Roof Insulation</h4>
                      <div class="flex items-center gap-3 text-sm flex-wrap">
                        <span class="font-semibold text-success-600">€6,000</span>
                        <span class="bg-warning-100 text-warning-800 px-2 py-0.5 rounded text-xs font-semibold">Contractor</span>
                        <span class="text-primary-600 font-semibold text-xs bg-primary-100 px-2 py-0.5 rounded">Now</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="flex gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-primary-500 transition-all duration-200" title="Dream & Discover"></span>
                      <span class="w-2 h-2 rounded-full bg-warning-400 shadow-sm animate-pulse-slow" title="Financing"></span>
                      <span class="w-2 h-2 rounded-full bg-gray-200 transition-all duration-200" title="Design"></span>
                      <span class="w-2 h-2 rounded-full bg-gray-200 transition-all duration-200" title="Prepare & Plan"></span>
                      <span class="w-2 h-2 rounded-full bg-gray-200 transition-all duration-200" title="Execute & Track"></span>
                      <span class="w-2 h-2 rounded-full bg-gray-200 transition-all duration-200" title="Administration"></span>
                      <span class="w-2 h-2 rounded-full bg-gray-200 transition-all duration-200" title="Close"></span>
                    </div>
                    <span class="text-xs font-semibold text-gray-600">Financing</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex-1 h-1.5 bg-gray-200 rounded-sm overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-300 ease-out" style="width: 15%"></div>
                    </div>
                    <span class="text-xs text-gray-500 font-medium whitespace-nowrap">Applying for green loan</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Planned Works -->
            <div class="flex flex-col gap-4 min-w-0">
              <div class="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Ready to Activate</div>
              
              <div class="flex relative">
                <div class="flex-1 bg-warning-50 border border-warning-300 border-dashed rounded-lg p-4 flex flex-col gap-3 transition-all duration-200">
                  <div class="flex justify-between items-start gap-4 min-w-0">
                    <div class="flex flex-col gap-2 flex-1 min-w-0">
                      <h4 class="text-base font-semibold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">Solar Panel Installation</h4>
                      <div class="flex items-center gap-3 text-sm flex-wrap">
                        <span class="font-semibold text-success-600">€8,000</span>
                        <span class="text-gray-600 font-medium">Budgeted</span>
                        <span class="text-warning-600 font-semibold text-xs bg-warning-100 px-2 py-0.5 rounded">Q2 2025</span>
                      </div>
                    </div>
                    <button class="flex-shrink-0 bg-primary-500 text-white border-0 px-3 py-1.5 rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-600 hover:translate-x-0.5 hover:shadow-md whitespace-nowrap">
                      Activate →
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex relative">
                <div class="flex-1 bg-warning-50 border border-warning-300 border-dashed rounded-lg p-4 flex flex-col gap-3 transition-all duration-200">
                  <div class="flex justify-between items-start gap-4 min-w-0">
                    <div class="flex flex-col gap-2 flex-1 min-w-0">
                      <h4 class="text-base font-semibold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">Garden Terrace</h4>
                      <div class="flex items-center gap-3 text-sm flex-wrap">
                        <span class="font-semibold text-success-600">€5,000</span>
                        <span class="text-gray-600 font-medium">Budgeted</span>
                        <span class="text-warning-600 font-semibold text-xs bg-warning-100 px-2 py-0.5 rounded">Q3 2025</span>
                      </div>
                    </div>
                    <button class="flex-shrink-0 bg-primary-500 text-white border-0 px-3 py-1.5 rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-600 hover:translate-x-0.5 hover:shadow-md whitespace-nowrap">
                      Activate →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Future Works -->
            <div class="flex flex-col gap-4 min-w-0">
              <div class="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Future Planned</div>
              
              <div class="flex relative">
                <div class="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 opacity-70">
                  <div class="flex justify-between items-start gap-4 min-w-0">
                    <div class="flex flex-col gap-2 flex-1 min-w-0">
                      <h4 class="text-base font-semibold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">Window Replacement</h4>
                      <div class="flex items-center gap-3 text-sm flex-wrap">
                        <span class="font-semibold text-success-600">€12,000</span>
                        <span class="text-gray-600 font-medium">Mijnverbouwlening secured</span>
                        <span class="text-gray-500 font-semibold text-xs bg-gray-200 px-2 py-0.5 rounded">2027</span>
                      </div>
                    </div>
                  </div>
                  <div class="text-xs text-gray-500 italic">
                    Financing secured • Awaiting 2027 for execution
                  </div>
                </div>
              </div>

              <div class="flex relative">
                <div class="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 opacity-70">
                  <div class="flex justify-between items-start gap-4 min-w-0">
                    <div class="flex flex-col gap-2 flex-1 min-w-0">
                      <h4 class="text-base font-semibold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">Full Attic Conversion</h4>
                      <div class="flex items-center gap-3 text-sm flex-wrap">
                        <span class="font-semibold text-success-600">€20,000</span>
                        <span class="text-gray-600 font-medium">Conceptual</span>
                        <span class="text-gray-500 font-semibold text-xs bg-gray-200 px-2 py-0.5 rounded">2028</span>
                      </div>
                    </div>
                  </div>
                  <div class="text-xs text-gray-500 italic">
                    Long-term planning
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'

// Protect this page with authentication
definePageMeta({
  middleware: 'auth'
})

// Get authentication state
const { currentUser, getUserRegion, logout } = useAuth()

// Get project data
const { currentProject, loadProject } = useProject()

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
  } catch (error) {
    console.error('Failed to load Strapi data, falling back to mock data:', error)
    const { loadProject } = useProject()
    await loadProject()
  }
})
</script>

