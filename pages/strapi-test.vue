<template>
  <div style="padding: 32px; font-family: system-ui;">
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 24px;">Strapi Integration Test</h1>
    
    <!-- Buttons Section -->
    <div style="margin-bottom: 32px; border: 2px solid #ccc; padding: 16px;">
      <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Data Source Controls</h2>
      
      <div style="display: flex; gap: 16px; margin-bottom: 16px; align-items: center;">
        <button 
          @click="loadMockData" 
          style="padding: 12px 20px; background: #f3f4f6; color: #111; border: 2px solid #d1d5db; border-radius: 6px; cursor: pointer; font-weight: 500;"
        >
          📁 Load Mock Data
        </button>
        
        <button 
          @click="loadStrapiData" 
          style="padding: 12px 20px; background: #3b82f6; color: white; border: 2px solid #1d4ed8; border-radius: 6px; cursor: pointer; font-weight: 500;"
        >
          🌐 Load Strapi Data
        </button>
        
        <span style="margin-left: 16px; font-size: 14px; color: #6b7280;">
          Current: <strong>{{ dataSource }}</strong>
        </span>
      </div>
      
      <!-- Debug Info -->
      <div style="background: #fef3c7; padding: 12px; border-radius: 4px; font-size: 14px; margin-bottom: 16px;">
        🐛 Debug: Both buttons should be visible above. dataSource = "{{ dataSource }}"
      </div>
    </div>

    <div v-if="isLoading" class="text-blue-600">Loading...</div>
    <div v-if="error" class="text-red-600">Error: {{ error }}</div>

    <div v-if="currentProject" class="bg-gray-50 p-4 rounded">
      <h2 class="text-lg font-semibold mb-4">Project Data</h2>
      <div class="space-y-2 text-sm">
        <div><strong>ID:</strong> {{ currentProject.id }}</div>
        <div><strong>Name:</strong> {{ currentProject.name }}</div>
        <div><strong>Property Size:</strong> {{ currentProject.generalAttributes.propertySize.width }}x{{ currentProject.generalAttributes.propertySize.depth }}cm</div>
        <div><strong>Floor Size:</strong> {{ currentProject.generalAttributes.floorSize.width }}x{{ currentProject.generalAttributes.floorSize.depth }}cm</div>
        <div><strong>Floors:</strong> {{ Object.keys(currentProject.floors).length }}</div>
        <div><strong>Roof Type:</strong> {{ currentProject.roof.type }}</div>
      </div>
      
      <div class="mt-4">
        <h3 class="font-semibold mb-2">Floor Details:</h3>
        <div v-for="(floor, floorId) in currentProject.floors" :key="floorId" class="mb-2 p-2 bg-white rounded">
          <div class="text-sm">
            <div><strong>Floor {{ floorId }}:</strong> Storey {{ floor.storey }}</div>
            <div>Height: {{ floor.height }}cm, Position: {{ floor.heightPosition }}cm, Color: {{ floor.color }}</div>
            <div>Windows: {{ Object.keys(floor.windows || {}).length }}, Doors: {{ Object.keys(floor.doors || {}).length }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <h2 class="text-lg font-semibold mb-4">Integration Status</h2>
      <div class="space-y-2 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Frontend composables created</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Strapi schemas updated</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>API transformation layer ready</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Strapi server connection (start Strapi on :1337)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Test data in Strapi (add project via admin)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { currentProject, isLoading, error, loadProject } = useProject()
const dataSource = ref<'mock' | 'strapi'>('mock')

const loadMockData = async () => {
  dataSource.value = 'mock'
  await loadProject()
}

const loadStrapiData = async () => {
  dataSource.value = 'strapi'
  // Use the actual documentId from our Strapi project
  await loadProject('ca66f5looy2mij5rua9yj987', true)
}

// Load mock data by default
onMounted(() => {
  loadMockData()
})
</script>

<style scoped>
/* Add any custom styles here */
</style>