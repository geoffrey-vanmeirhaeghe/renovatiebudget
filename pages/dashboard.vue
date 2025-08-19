<template>
  <div class="app-container">
    <!-- App Header -->
    <AppHeader />
    
    <div class="dashboard">
      <!-- Top Section: 3D Preview + Project Overview -->
      <section class="dashboard-top">
        <!-- Left: 3D Model Preview -->
        <div class="model-section">
          <div class="model-container" @click="enterBuilder">
            <div class="model-overlay">
              <div class="play-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div class="overlay-text">
                <h3>3D Builder</h3>
                <p>Click to enter 3D editing mode</p>
              </div>
            </div>
            <!-- 3D Model Preview Placeholder -->
            <div class="model-preview-placeholder">
              <div class="preview-content">
                <div class="house-icon">🏠</div>
                <h3>3D Model Preview</h3>
                <p v-if="projectStats">
                  {{ projectStats.floors }} floors • {{ projectStats.windows }} windows • {{ projectStats.doors }} doors
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Key Project Information -->
        <div class="project-overview">
          <!-- Header Section -->
          <div class="project-header">
            <div class="project-title-section">
              <h2>{{ currentProject?.name || 'Untitled Project' }}</h2>
              <div class="project-meta">
                <span class="property-type">{{ formatPropertyType(currentUser?.propertyType) }}</span>
                <span class="location">{{ currentUser?.address?.municipality }}</span>
              </div>
            </div>
            <button @click="enterBuilder" class="btn-primary">
              Open 3D Builder
            </button>
          </div>
          
          <!-- Horizontal Stats Dashboard -->
          <div class="stats-dashboard" v-if="projectStats">
            <div class="stat-card">
              <div class="stat-icon">🏢</div>
              <div class="stat-content">
                <span class="stat-number">{{ projectStats.floors }}</span>
                <span class="stat-label">Floors</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🪟</div>
              <div class="stat-content">
                <span class="stat-number">{{ projectStats.windows }}</span>
                <span class="stat-label">Windows</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🚪</div>
              <div class="stat-content">
                <span class="stat-number">{{ projectStats.doors }}</span>
                <span class="stat-label">Doors</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📐</div>
              <div class="stat-content">
                <span class="stat-number">{{ projectStats.rooms }}</span>
                <span class="stat-label">Rooms</span>
              </div>
            </div>
          </div>

          <!-- Property Details Strip -->
          <div class="property-details">
            <div class="detail-row">
              <div class="detail-group">
                <span class="detail-label">Project Type</span>
                <span class="detail-value">{{ formatPropertyType(currentUser?.propertyType) }}</span>
              </div>
              <div class="detail-group">
                <span class="detail-label">Location</span>
                <span class="detail-value">{{ currentUser?.address?.municipality || 'Not specified' }}</span>
              </div>
              <div class="detail-group">
                <span class="detail-label">Status</span>
                <span class="detail-value status-active">Planning Phase</span>
              </div>
              <div class="detail-group">
                <span class="detail-label">Progress</span>
                <span class="detail-value">65% Complete</span>
              </div>
            </div>
          </div>

          <!-- Quick Progress Indicator -->
          <div class="progress-strip">
            <div class="progress-bar-mini">
              <div class="progress-fill-mini" style="width: 65%"></div>
            </div>
            <div class="progress-phases">
              <span class="phase completed">Design</span>
              <span class="phase completed">Planning</span>
              <span class="phase active">Permits</span>
              <span class="phase pending">Build</span>
              <span class="phase pending">Finish</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Section: Additional Dashboard Content -->
      <section class="dashboard-bottom">
        <!-- Quick Actions -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div class="action-grid">
            <button @click="enterBuilder" class="action-btn primary">
              <span class="action-icon">🏗️</span>
              <div class="action-content">
                <span class="action-title">3D Builder</span>
                <span class="action-desc">Design and modify your property</span>
              </div>
            </button>
            <button @click="navigateTo('/planning')" class="action-btn">
              <span class="action-icon">📋</span>
              <div class="action-content">
                <span class="action-title">Planning</span>
                <span class="action-desc">Manage renovation timeline</span>
              </div>
            </button>
            <button @click="navigateTo('/marketplace')" class="action-btn">
              <span class="action-icon">👷</span>
              <div class="action-content">
                <span class="action-title">Find Contractors</span>
                <span class="action-desc">Connect with professionals</span>
              </div>
            </button>
            <button @click="navigateTo('/documents')" class="action-btn">
              <span class="action-icon">📄</span>
              <div class="action-content">
                <span class="action-title">Documents</span>
                <span class="action-desc">Manage project files</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>Recent Activity</h3>
            <span class="card-subtitle">Last 7 days</span>
          </div>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon">🏗️</div>
              <div class="activity-content">
                <span class="activity-title">3D Model Updated</span>
                <span class="activity-time">2 hours ago</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">📝</div>
              <div class="activity-content">
                <span class="activity-title">Project Details Modified</span>
                <span class="activity-time">1 day ago</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">👷</div>
              <div class="activity-content">
                <span class="activity-title">Contractor Inquiry Received</span>
                <span class="activity-time">3 days ago</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">📋</div>
              <div class="activity-content">
                <span class="activity-title">Planning Phase Started</span>
                <span class="activity-time">5 days ago</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Project Progress -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>Project Progress</h3>
            <span class="progress-percentage">65%</span>
          </div>
          <div class="progress-content">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 65%"></div>
            </div>
            <div class="progress-stages">
              <div class="stage completed">
                <div class="stage-dot"></div>
                <span class="stage-label">Design</span>
              </div>
              <div class="stage completed">
                <div class="stage-dot"></div>
                <span class="stage-label">Planning</span>
              </div>
              <div class="stage active">
                <div class="stage-dot"></div>
                <span class="stage-label">Permits</span>
              </div>
              <div class="stage pending">
                <div class="stage-dot"></div>
                <span class="stage-label">Construction</span>
              </div>
              <div class="stage pending">
                <div class="stage-dot"></div>
                <span class="stage-label">Completion</span>
              </div>
            </div>
          </div>
        </div>
      </section>
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

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.dashboard {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  gap: 2rem;
}

.dashboard-top {
  display: flex;
  gap: 1.5rem;
  align-items: stretch;
}

.dashboard-bottom {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* Left column - 3D Model Preview */
.model-section {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  flex: 1;
  min-height: 300px;
}

.model-container {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  transition: transform 0.2s;
  min-height: 250px;
}

.model-container:hover {
  transform: scale(1.02);
}

.model-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  border-radius: 8px;
}

.model-container:hover .model-overlay {
  opacity: 1;
  pointer-events: auto;
}

.play-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}

.play-button:hover {
  transform: scale(1.1);
}

.overlay-text {
  text-align: center;
  color: white;
}

.overlay-text h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.overlay-text p {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
}

/* Model Preview Placeholder */
.model-preview-placeholder {
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #cbd5e0;
  transition: all 0.3s;
  min-height: 250px;
}

.model-container:hover .model-preview-placeholder {
  background: #e2e8f0;
  border-color: #94a3b8;
}

.preview-content {
  text-align: center;
  color: #64748b;
}

.house-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.preview-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #475569;
}

.preview-content p {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.8;
}

/* Right section - Project Overview */
.project-overview {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: 1px solid #e2e8f0;
  flex: 2;
}

/* Project Header */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.project-title-section h2 {
  font-size: 1.375rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.property-type, .location {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.property-type::after {
  content: "•";
  margin: 0 0.5rem;
  color: #d1d5db;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

/* Horizontal Stats Dashboard */
.stats-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
}

.stat-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.stat-icon {
  font-size: 1.5rem;
  opacity: 0.8;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* Property Details Strip */
.property-details {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 600;
}

.detail-value.status-active {
  color: #059669;
}

/* Progress Strip */
.progress-strip {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.progress-bar-mini {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
}

.progress-phases {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.phase {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  text-align: center;
  flex: 1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.phase.completed {
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 600;
}

.phase.active {
  background: #fef3c7;
  color: #d97706;
  font-weight: 600;
}

.phase.pending {
  color: #9ca3af;
}

/* Dashboard Cards */
.dashboard-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.progress-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
}

/* Action Grid */
.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  color: #4a5568;
  text-align: left;
}

.action-btn:hover {
  border-color: #cbd5e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.primary {
  border-color: #3b82f6;
  background: #eff6ff;
}

.action-btn.primary:hover {
  border-color: #2563eb;
  background: #dbeafe;
}

.action-icon {
  font-size: 1.5rem;
  min-width: 24px;
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #2d3748;
}

.action-desc {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.3;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.activity-icon {
  font-size: 1.25rem;
  min-width: 24px;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #2d3748;
  font-size: 0.9rem;
}

.activity-time {
  font-size: 0.8rem;
  color: #64748b;
}

/* Progress Bar */
.progress-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
}

.progress-stages {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.stage-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background: white;
  transition: all 0.2s;
}

.stage.completed .stage-dot {
  background: #3b82f6;
  border-color: #3b82f6;
}

.stage.active .stage-dot {
  background: #fbbf24;
  border-color: #f59e0b;
}

.stage-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  text-align: center;
}

.stage.completed .stage-label,
.stage.active .stage-label {
  color: #2d3748;
  font-weight: 600;
}



@media (max-width: 1024px) {
  .dashboard-top {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .model-section {
    min-height: 300px;
  }
  
  .dashboard-bottom {
    grid-template-columns: 1fr;
  }
  
  .stats-dashboard {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .detail-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .action-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
  
  .progress-phases {
    gap: 0.25rem;
  }
  
  .phase {
    padding: 0.25rem 0.25rem;
    font-size: 0.7rem;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
    gap: 1.5rem;
  }
  
  .dashboard-top {
    flex-direction: column;
    gap: 1rem;
  }
  
  .model-section {
    min-height: 250px;
  }
  
  .dashboard-bottom {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .project-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .btn-primary {
    align-self: flex-start;
  }
  
  .stats-dashboard {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .stat-card {
    padding: 0.75rem;
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .progress-phases {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .phase {
    min-width: 50px;
    font-size: 0.65rem;
  }
  
  .progress-stages {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .stage {
    min-width: 60px;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 0.75rem;
  }
  
  .dashboard-card {
    padding: 1rem;
  }
  
  .model-section {
    padding: 0.75rem;
  }
  
  .project-overview {
    padding: 1rem;
    gap: 1rem;
  }
  
  .stats-dashboard {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .stat-card {
    padding: 0.75rem;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .property-details {
    padding: 0.75rem;
  }
  
  .progress-phases {
    gap: 0.125rem;
  }
  
  .phase {
    font-size: 0.6rem;
    padding: 0.25rem 0.125rem;
    min-width: 45px;
  }
  
  .action-btn {
    padding: 0.75rem;
  }
}
</style>