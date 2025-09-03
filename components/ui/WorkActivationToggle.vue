<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <span 
        class="status-badge"
        :class="{
          'bg-gray-100 text-gray-800': workStatus === 'planned',
          'bg-yellow-100 text-yellow-800': workStatus === 'scheduled',
          'bg-blue-100 text-blue-800': workStatus === 'active',
          'bg-green-100 text-green-800': workStatus === 'completed'
        }"
      >
        {{ statusText }}
      </span>
      
      <div class="progress-bar" v-if="workStatus === 'active'">
        <div class="progress-fill" :style="`width: ${todoProgress}%`"></div>
      </div>
    </div>
    
    <button
      v-if="!startDate"
      @click="$emit('openPlanning')"
      class="plan-button"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      Plan
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  workId: string
  startDate?: Date
  todos: any[]
  loading?: boolean
}

interface Emits {
  (e: 'updateStartDate', workId: string, date: Date | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const today = new Date()
const minDate = new Date().toISOString().split('T')[0]

const startDateString = computed(() => {
  return props.startDate ? props.startDate.toISOString().split('T')[0] : ''
})

const isPastDate = computed(() => {
  if (!props.startDate) return false
  return props.startDate <= today
})

const isFutureDate = computed(() => {
  if (!props.startDate) return false
  return props.startDate > today
})

const completedTodos = computed(() => 
  props.todos.filter(t => t.completed).length
)

const totalTodos = computed(() => props.todos.length)

const todoProgress = computed(() => {
  if (totalTodos.value === 0) return 100
  return Math.round((completedTodos.value / totalTodos.value) * 100)
})

const allTodosCompleted = computed(() => 
  totalTodos.value > 0 && completedTodos.value === totalTodos.value
)

const workStatus = computed(() => {
  if (!props.startDate) return 'planned'
  
  if (isFutureDate.value) {
    return 'scheduled'
  } else if (isPastDate.value) {
    if (allTodosCompleted.value) {
      return 'completed'
    } else {
      return 'active'
    }
  }
  return 'planned'
})

const statusText = computed(() => {
  switch (workStatus.value) {
    case 'scheduled': return timeUntilStart.value
    case 'active': return 'Active'
    case 'completed': return 'Completed'
    default: return 'Not planned'
  }
})

const timeUntilStart = computed(() => {
  if (!props.startDate) return 'Planned'
  
  const now = new Date()
  const start = new Date(props.startDate)
  const diffTime = start.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Active'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `In ${diffDays} days`
  if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`
  return `In ${Math.ceil(diffDays / 30)} months`
})

const statusClass = computed(() => ({
  'status-planned': workStatus.value === 'planned',
  'status-scheduled': workStatus.value === 'scheduled', 
  'status-active': workStatus.value === 'active',
  'status-completed': workStatus.value === 'completed'
}))

const handleDateChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const dateValue = target.value
  
  if (dateValue) {
    const date = new Date(dateValue)
    emit('updateStartDate', props.workId, date)
  } else {
    emit('updateStartDate', props.workId, null)
  }
}
</script>

<style scoped>
.status-badge {
  @apply text-xs font-semibold px-2 py-1 rounded-full;
}

.progress-bar {
  @apply w-16 h-1.5 bg-gray-200 rounded-full;
}

.progress-fill {
  @apply h-full bg-blue-500 rounded-full transition-all duration-300;
}

.plan-button {
  @apply flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors;
}
</style>