<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="header-content">
              <h2 class="modal-title">
                {{ work.name }}
                <span v-if="hasUnsavedChanges" class="unsaved-indicator">• Unsaved changes</span>
              </h2>
              <div class="header-badges">
                <span 
                  class="execution-badge"
                  :class="{
                    'badge-diy': work.executionType === 'DIY',
                    'badge-contractor': work.executionType === 'Contractor',
                    'badge-hybrid': work.executionType === 'Hybrid'
                  }"
                >
                  {{ work.executionType }}
                </span>
                <span class="timeline-badge">{{ formatWorkTimeline(work.timeline, work.year) }}</span>
              </div>
            </div>
            <div class="header-actions">
              <button class="header-btn btn-edit" @click="showEditMode = !showEditMode">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              <button class="header-btn btn-uploads" @click="showUploadsSection = !showUploadsSection">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Uploads
              </button>
              <button class="close-button" @click="close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Work Status Control - Prominent Position -->
          <div class="status-section">
            <WorkActivationToggle
              :work-id="work.id"
              :start-date="work.startDate"
              :todos="work.todos"
              @update-start-date="handleUpdateStartDate"
            />
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Edit Mode -->
            <div v-if="showEditMode" class="edit-mode">
              <form @submit.prevent="saveEditChanges" class="edit-form">
                <!-- Basic Information -->
                <div class="edit-section">
                  <h3 class="section-title">Basic Information</h3>
                  <div class="form-grid">
                    <div class="form-field">
                      <label class="form-label" for="editWorkName">Work Name</label>
                      <input 
                        id="editWorkName"
                        v-model="localWork.name"
                        type="text"
                        required
                        class="form-input"
                      />
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="editWorkBudget">Budget (EUR)</label>
                      <input 
                        id="editWorkBudget"
                        v-model.number="localWork.budget"
                        type="number"
                        required
                        min="0"
                        step="100"
                        class="form-input"
                      />
                    </div>
                  </div>
                  
                  <div class="form-field">
                    <label class="form-label" for="editWorkDescription">Description</label>
                    <textarea 
                      id="editWorkDescription"
                      v-model="localWork.description"
                      placeholder="Describe the work to be done..."
                      rows="3"
                      class="form-textarea"
                    ></textarea>
                  </div>
                </div>

                <!-- Execution Type -->
                <div class="edit-section">
                  <h3 class="section-title">Execution Type</h3>
                  <div class="execution-selector">
                    <label 
                      v-for="type in ['DIY', 'Contractor', 'Hybrid']"
                      :key="type"
                      class="execution-option"
                      :class="{ 'selected': localWork.executionType === type }"
                    >
                      <input 
                        type="radio" 
                        :value="type" 
                        v-model="localWork.executionType"
                        class="execution-radio"
                      />
                      <div class="option-content">
                        <span class="option-icon">
                          {{ type === 'DIY' ? '🔨' : type === 'Contractor' ? '👷' : '🤝' }}
                        </span>
                        <div class="option-text">
                          <span class="option-label">{{ type }}</span>
                          <span class="option-desc">
                            {{ type === 'DIY' ? 'Do it yourself' : type === 'Contractor' ? 'Hire professional' : 'Mix of both' }}
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Timeline -->
                <div class="edit-section">
                  <h3 class="section-title">Timeline</h3>
                  <div class="form-grid">
                    <div class="form-field">
                      <label class="form-label" for="editTimeline">Timeline</label>
                      <select 
                        id="editTimeline"
                        v-model="localWork.timeline" 
                        class="form-select"
                      >
                        <option value="now">Now</option>
                        <option value="Q1">Q1</option>
                        <option value="Q2">Q2</option>
                        <option value="Q3">Q3</option>
                        <option value="Q4">Q4</option>
                      </select>
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="editYear">Year</label>
                      <select 
                        id="editYear"
                        v-model.number="localWork.year"
                        class="form-select"
                      >
                        <option 
                          v-for="year in availableYears" 
                          :key="year" 
                          :value="year"
                        >
                          {{ year }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <!-- Upload Mode -->
            <div v-else-if="showUploadsSection" class="upload-mode">
              <div class="upload-sections">
                <!-- Images Upload Section -->
                <div class="upload-section">
                  <h3 class="section-title">📸 Images & Photos</h3>
                  <div class="upload-area">
                    <input 
                      ref="imageInput" 
                      type="file" 
                      multiple 
                      accept="image/*"
                      @change="handleImageSelect"
                      class="file-input"
                    />
                    <div 
                      @click="triggerImageInput"
                      @dragover.prevent="imageDragOver = true"
                      @dragleave.prevent="imageDragOver = false"
                      @drop.prevent="handleImageDrop"
                      class="drop-zone"
                      :class="{ 'drag-over': imageDragOver }"
                    >
                      <div class="upload-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                      </div>
                      <div class="upload-text">
                        <p class="upload-primary">Drop images here or click to browse</p>
                        <p class="upload-secondary">Supports: JPG, PNG, GIF, WEBP (max 10MB each)</p>
                      </div>
                    </div>
                    
                    <!-- Uploaded Images -->
                    <div v-if="uploadedImages.length > 0" class="uploaded-files">
                      <h4 class="uploaded-title">Uploaded Images ({{ uploadedImages.length }})</h4>
                      <div class="image-grid">
                        <div 
                          v-for="image in uploadedImages" 
                          :key="image.id"
                          class="image-item"
                        >
                          <div class="image-preview">
                            <img :src="image.preview" :alt="image.name" class="image-thumbnail" />
                            <div class="image-overlay">
                              <button @click="removeImage(image.id)" class="btn-remove-image">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path d="18 6L6 18M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div class="image-details">
                            <span class="image-name">{{ image.name }}</span>
                            <span class="image-size">{{ formatFileSize(image.size) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Documents Upload Section -->
                <div class="upload-section">
                  <h3 class="section-title">📄 Documents</h3>
                  <div class="upload-area">
                    <input 
                      ref="documentInput" 
                      type="file" 
                      multiple 
                      accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                      @change="handleDocumentSelect"
                      class="file-input"
                    />
                    <div 
                      @click="triggerDocumentInput"
                      @dragover.prevent="documentDragOver = true"
                      @dragleave.prevent="documentDragOver = false"
                      @drop.prevent="handleDocumentDrop"
                      class="drop-zone"
                      :class="{ 'drag-over': documentDragOver }"
                    >
                      <div class="upload-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="14,2 H6A2,2 0 0,0 4,4 V20A2,2 0 0,0 6,22 H18A2,2 0 0,0 20,20 V8L14,2Z"/>
                          <polyline points="14,2 14,8 20,8"/>
                        </svg>
                      </div>
                      <div class="upload-text">
                        <p class="upload-primary">Drop documents here or click to browse</p>
                        <p class="upload-secondary">Supports: PDF, DOC, DOCX, TXT, XLS, XLSX (max 25MB each)</p>
                      </div>
                    </div>
                    
                    <!-- Uploaded Documents -->
                    <div v-if="uploadedDocuments.length > 0" class="uploaded-files">
                      <h4 class="uploaded-title">Uploaded Documents ({{ uploadedDocuments.length }})</h4>
                      <div class="document-list">
                        <div 
                          v-for="doc in uploadedDocuments" 
                          :key="doc.id"
                          class="document-item"
                        >
                          <div class="document-icon">
                            {{ getDocumentIcon(doc.name) }}
                          </div>
                          <div class="document-details">
                            <span class="document-name">{{ doc.name }}</span>
                            <div class="document-meta">
                              <span class="document-size">{{ formatFileSize(doc.size) }}</span>
                              <span class="document-type">{{ getFileExtension(doc.name) }}</span>
                            </div>
                          </div>
                          <button @click="removeDocument(doc.id)" class="btn-remove-document">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- View Mode -->
            <div v-else class="view-mode">
              <!-- Work Details Section -->
            <div class="detail-section">
              <h3 class="section-title">Project Details</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">Budget</span>
                  <span class="detail-value text-success">{{ formatCurrency(work.budget) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Actual Cost</span>
                  <span class="detail-value">{{ work.actualCost ? formatCurrency(work.actualCost) : '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status</span>
                  <span class="detail-value">{{ work.status }}</span>
                </div>
              </div>
              
              <div class="description-section" v-if="work.description">
                <p class="description-text">{{ work.description }}</p>
              </div>
            </div>

            <!-- Contractor Section -->
            <div v-if="localWork.executionType === 'Contractor' || localWork.executionType === 'Hybrid'" class="detail-section">
              <h3 class="section-title">Contractor</h3>
              
              <!-- If no contractor assigned -->
              <div v-if="!hasAssignedContractor" class="contractor-request">
                <div class="request-message">
                  <span class="request-icon">👷</span>
                  <p>No contractor assigned yet</p>
                </div>
                <button class="btn-request-contractor" @click="showComingSoonModal = true">
                  Request Contractor
                </button>
              </div>

              <!-- If contractor is assigned -->
              <div v-else class="contractor-details">
                <div class="contractor-card">
                  <div class="contractor-info">
                    <div class="contractor-header">
                      <div class="contractor-main">
                        <h4 class="contractor-name">{{ localWork.contractor.name }}</h4>
                        <p class="contractor-contact">{{ localWork.contractor.phone }}</p>
                        <p class="contractor-contact">{{ localWork.contractor.email }}</p>
                        <span v-if="localWork.contractor.contractSigned" class="contract-status signed">
                          ✓ Contract Signed
                        </span>
                        <span v-else class="contract-status pending">
                          ⏳ Contract Pending
                        </span>
                      </div>
                      <button 
                        @click="showRemoveContractorDialog = true" 
                        class="btn-remove-contractor"
                        title="Remove contractor"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Todo List Section -->
            <div class="detail-section">
              <div class="section-header">
                <h3 class="section-title">Tasks & To-Dos</h3>
                <div class="progress-indicator">
                  <span class="progress-text">{{ completedTodosCount }}/{{ localWork.todos.length }} completed</span>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: `${todoProgress}%` }"></div>
                  </div>
                  <span class="progress-percentage">{{ todoProgress }}%</span>
                </div>
              </div>

              <!-- Add Todo Form -->
              <div class="add-todo-form">
                <input 
                  v-model="newTodoText"
                  @keyup.enter="addTodo"
                  placeholder="Add a new task..."
                  class="todo-input"
                />
                <select v-model="newTodoPriority" class="priority-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button @click="addTodo" class="add-todo-button">
                  Add Task
                </button>
              </div>

              <!-- Todo List -->
              <div class="todo-list">
                <TransitionGroup name="todo">
                  <div 
                    v-for="todo in localWork.todos" 
                    :key="todo.id"
                    class="todo-item"
                    :class="{ 'completed': todo.completed }"
                  >
                    <input 
                      type="checkbox"
                      :checked="todo.completed"
                      @change="toggleTodo(todo.id)"
                      class="todo-checkbox"
                    />
                    <div class="todo-content">
                      <span class="todo-text">{{ todo.text }}</span>
                      <div class="todo-meta">
                        <span 
                          class="todo-priority"
                          :class="`priority-${todo.priority || 'medium'}`"
                        >
                          {{ todo.priority || 'medium' }}
                        </span>
                        <span v-if="todo.dueDate" class="todo-due">
                          Due: {{ formatDate(todo.dueDate) }}
                        </span>
                      </div>
                    </div>
                    <button @click="deleteTodo(todo.id)" class="delete-todo">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </TransitionGroup>
                
                <div v-if="localWork.todos.length === 0" class="empty-todos">
                  <span class="empty-icon">📝</span>
                  <p>No tasks yet. Add your first task above!</p>
                </div>
              </div>
            </div>

            <!-- Uploads Section -->
            <div v-if="showUploadsSection" class="detail-section">
              <h3 class="section-title">📸 Uploads</h3>
              <div class="uploads-content">
                <!-- File Upload Area -->
                <div class="upload-area">
                  <input 
                    ref="fileInput" 
                    type="file" 
                    multiple 
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    @change="handleFileSelect"
                    class="file-input"
                  />
                  <div 
                    @click="triggerFileInput"
                    @dragover.prevent="dragOver = true"
                    @dragleave.prevent="dragOver = false"
                    @drop.prevent="handleFileDrop"
                    class="drop-zone"
                    :class="{ 'drag-over': dragOver }"
                  >
                    <div class="upload-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                    </div>
                    <div class="upload-text">
                      <p class="upload-primary">Drop files here or click to browse</p>
                      <p class="upload-secondary">Supports: PDF, Images, Documents</p>
                    </div>
                  </div>
                  
                  <!-- Uploaded Files List -->
                  <div v-if="uploadedFiles.length > 0" class="uploaded-files">
                    <h4 class="uploaded-title">Uploaded Files</h4>
                    <div class="files-list">
                      <div 
                        v-for="file in uploadedFiles" 
                        :key="file.id"
                        class="file-item"
                      >
                        <div class="file-icon">
                          {{ getFileIcon(file.name) }}
                        </div>
                        <div class="file-details">
                          <span class="file-name">{{ file.name }}</span>
                          <span class="file-size">{{ formatFileSize(file.size) }}</span>
                        </div>
                        <button @click="removeFile(file.id)" class="btn-remove-file">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Cost Lines -->
                <div class="cost-lines">
                  <div class="add-cost-form">
                    <input 
                      v-model="newCostDescription"
                      @keyup.enter="addCostLine"
                      placeholder="Description (e.g., 'Paint supplies')"
                      class="cost-description-input"
                    />
                    <input 
                      v-model.number="newCostAmount"
                      @keyup.enter="addCostLine"
                      type="number" 
                      placeholder="Amount"
                      class="cost-amount-input"
                    />
                    <button @click="addCostLine" class="add-cost-button">
                      Add Cost
                    </button>
                  </div>

                  <div class="cost-list">
                    <div 
                      v-for="cost in localWork.costLines" 
                      :key="cost.id"
                      class="cost-item"
                    >
                      <span class="cost-description">{{ cost.description }}</span>
                      <span class="cost-amount">{{ formatCurrency(cost.amount) }}</span>
                      <button @click="deleteCostLine(cost.id)" class="delete-cost">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div v-if="localWork.costLines && localWork.costLines.length === 0" class="empty-costs">
                    <p>No costs added yet</p>
                  </div>
                </div>
              </div>
            </div>
            </div> <!-- End view-mode -->

          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <template v-if="showEditMode">
              <button type="button" @click="cancelEdit" class="btn-secondary">
                Cancel
              </button>
              <button type="button" @click="saveEditChanges" class="btn-primary">
                Save Changes
              </button>
            </template>
            <template v-else-if="showUploadsSection">
              <button @click="showUploadsSection = false" class="btn-secondary">Back to View</button>
              <button @click="saveUploads" class="btn-primary">Save Uploads</button>
            </template>
            <template v-else>
              <button @click="close" class="btn-secondary">Close</button>
              <button @click="saveChanges" class="btn-primary">Save Changes</button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Confirmation Modal for Unsaved Changes -->
    <ConfirmationModal
      :is-open="showConfirmDialog"
      title="Unsaved Changes"
      message="You have unsaved changes. What would you like to do?"
      confirm-text="Save Changes"
      cancel-text="Discard Changes"
      continue-text="Continue Editing"
      :show-continue="true"
      variant="info"
      @confirm="handleSaveAndClose"
      @cancel="handleConfirmClose"
      @continue="showConfirmDialog = false"
    />
    
    <!-- Confirmation Modal for Removing Contractor -->
    <ConfirmationModal
      :is-open="showRemoveContractorDialog"
      title="Remove Contractor"
      message="This action cannot be undone. Any deposits or down payments made will still need to be paid and will not be automatically reimbursed. Are you sure you want to remove this contractor?"
      confirm-text="Remove Contractor"
      cancel-text="Keep Contractor"
      variant="danger"
      @confirm="handleRemoveContractor"
      @cancel="showRemoveContractorDialog = false"
    />
    
    <!-- Coming Soon Modal for Contractor Request -->
    <ComingSoonModal
      :is-open="showComingSoonModal"
      title="Contractor Marketplace"
      subtitle="Connect with trusted renovation professionals"
      description="We're building a curated network of verified contractors in Belgium. Soon you'll be able to browse profiles, compare quotes, and connect directly with professionals who specialize in your type of renovation work."
      @close="showComingSoonModal = false"
      @request-notification="handleNotificationRequest"
    />
  </Teleport>
</template>

<script setup lang="ts">
import type { RenovationWork, WorkTodo, ExecutionType } from '~/types/renovationWork'
import ConfirmationModal from '~/components/modals/ConfirmationModal.vue'
import ComingSoonModal from '~/components/modals/ComingSoonModal.vue'

const props = defineProps<{
  work: RenovationWork
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  update: [work: RenovationWork]
}>()

// Get renovation works functions
const {
  areAllTodosCompleted,
  completeWork
} = useRenovationWorks()

// Local state for editing
const initializeLocalWork = (work: RenovationWork): RenovationWork => {
  const localWorkData = JSON.parse(JSON.stringify(work))
  
  // Ensure contractor object exists
  if (!localWorkData.contractor) {
    localWorkData.contractor = {
      name: '',
      phone: '',
      email: '',
      contractSigned: false
    }
  }
  
  // Set current year as default if no year is provided
  if (!localWorkData.year) {
    localWorkData.year = new Date().getFullYear()
  }
  
  return localWorkData
}

const localWork = ref<RenovationWork>(initializeLocalWork(props.work))
const originalWork = ref<RenovationWork>(initializeLocalWork(props.work))
const newTodoText = ref('')
const newTodoPriority = ref<'low' | 'medium' | 'high'>('medium')
const hasUnsavedChanges = ref(false)
const showConfirmDialog = ref(false)

// Modal state
const showUploadsSection = ref(false)
const showEditMode = ref(false)
const showRemoveContractorDialog = ref(false)
const showComingSoonModal = ref(false)
const newCostDescription = ref('')
const newCostAmount = ref<number | null>(null)

// Upload state
const imageDragOver = ref(false)
const documentDragOver = ref(false)
const uploadedImages = ref<Array<{id: string, name: string, size: number, preview: string}>>([])
const uploadedDocuments = ref<Array<{id: string, name: string, size: number}>>([])
const imageInput = ref<HTMLInputElement | null>(null)
const documentInput = ref<HTMLInputElement | null>(null)

// Computed properties
const hasAssignedContractor = computed(() => {
  return localWork.value.contractor && 
         localWork.value.contractor.name && 
         localWork.value.contractor.name.trim().length > 0
})

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  // Add previous year for completion of past projects
  years.push(currentYear - 1)
  // Add current year and next 10 years
  for (let i = 0; i <= 10; i++) {
    years.push(currentYear + i)
  }
  return years
})

// Watch for prop changes
watch(() => props.work, (newWork) => {
  localWork.value = initializeLocalWork(newWork)
  originalWork.value = initializeLocalWork(newWork)
  hasUnsavedChanges.value = false
}, { deep: true })

// Watch for changes to detect unsaved modifications
watch(localWork, () => {
  hasUnsavedChanges.value = JSON.stringify(localWork.value) !== JSON.stringify(originalWork.value)
}, { deep: true })

// Computed properties
const completedTodosCount = computed(() => 
  localWork.value.todos.filter(t => t.completed).length
)

const todoProgress = computed(() => {
  if (localWork.value.todos.length === 0) return 0
  return Math.round((completedTodosCount.value / localWork.value.todos.length) * 100)
})

// Methods

const addTodo = () => {
  if (!newTodoText.value.trim()) return
  
  const newTodo: WorkTodo = {
    id: `todo-${Date.now()}`,
    text: newTodoText.value,
    completed: false,
    priority: newTodoPriority.value,
    createdAt: new Date()
  }
  
  localWork.value.todos.push(newTodo)
  newTodoText.value = ''
  newTodoPriority.value = 'medium'
}

const toggleTodo = (todoId: string) => {
  const todo = localWork.value.todos.find(t => t.id === todoId)
  if (todo) {
    todo.completed = !todo.completed
    if (todo.completed) {
      todo.completedAt = new Date()
    } else {
      todo.completedAt = undefined
    }
    
    // Update progress when todos change
    nextTick(() => {
      localWork.value.progress = todoProgress.value
      localWork.value.progressDescription = `${completedTodosCount.value}/${localWork.value.todos.length} tasks completed`
    })
  }
}

const deleteTodo = (todoId: string) => {
  const index = localWork.value.todos.findIndex(t => t.id === todoId)
  if (index !== -1) {
    localWork.value.todos.splice(index, 1)
  }
}

// Handle start date updates
const handleUpdateStartDate = async (workId: string, date: Date | null) => {
  const { updateWork } = useRenovationWorks()
  
  // Update local work
  localWork.value.startDate = date
  localWork.value.updatedAt = new Date()
  
  // Calculate new status based on date and todos
  if (!date) {
    localWork.value.status = 'planned'
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    
    if (startDate > today) {
      localWork.value.status = 'future'
    } else if (startDate <= today) {
      const allTodosCompleted = localWork.value.todos.length > 0 && 
        localWork.value.todos.every(t => t.completed)
      
      if (allTodosCompleted) {
        localWork.value.status = 'completed'
        localWork.value.completedAt = new Date()
      } else {
        localWork.value.status = 'active'
      }
    }
  }
  
  try {
    const success = await updateWork(workId, localWork.value)
    if (success) {
      console.log(`✅ Work date updated successfully`)
      emit('update', localWork.value)
    } else {
      console.error(`❌ Failed to update work date`)
    }
  } catch (error) {
    console.error('Failed to update work:', error)
  }
}

// Work completion method
const handleCompleteWork = async () => {
  if (!areAllTodosCompleted(localWork.value)) {
    alert('Please complete all tasks before marking the work as completed.')
    return
  }
  
  const result = await completeWork(localWork.value.id)
  if (result && result.success) {
    localWork.value.status = 'completed'
    localWork.value.completedAt = new Date()
    localWork.value.progress = 100
    localWork.value.progressDescription = 'Work completed'
    localWork.value.updatedAt = new Date()
    
    emit('update', localWork.value)
    emit('close')
  }
}

const saveChanges = () => {
  // Update progress based on todos
  localWork.value.progress = todoProgress.value
  localWork.value.progressDescription = `${completedTodosCount.value}/${localWork.value.todos.length} tasks completed`
  
  emit('update', localWork.value)
  originalWork.value = JSON.parse(JSON.stringify(localWork.value))
  hasUnsavedChanges.value = false
  emit('close')
}

const close = () => {
  if (hasUnsavedChanges.value) {
    showConfirmDialog.value = true
    return
  }
  emit('close')
}

const handleConfirmClose = () => {
  // User chose to discard changes
  localWork.value = initializeLocalWork(props.work)
  hasUnsavedChanges.value = false
  showConfirmDialog.value = false
  emit('close')
}

const handleSaveAndClose = () => {
  // User chose to save changes
  showConfirmDialog.value = false
  saveChanges()
}

// Computed properties for work completion
const allTodosCompleted = computed(() => areAllTodosCompleted(localWork.value))

// Upload and cost methods
const triggerFileUpload = (type: 'document') => {
  // TODO: Implement file upload functionality
  console.log(`Triggering file upload for: ${type}`)
  alert(`File upload not implemented yet. This will open a file picker in the final implementation.`)
}

const addCostLine = () => {
  if (!newCostDescription.value.trim() || !newCostAmount.value) return
  
  const newCost = {
    id: `cost-${Date.now()}`,
    description: newCostDescription.value,
    amount: newCostAmount.value,
    createdAt: new Date()
  }
  
  if (!localWork.value.costLines) {
    localWork.value.costLines = []
  }
  
  localWork.value.costLines.push(newCost)
  newCostDescription.value = ''
  newCostAmount.value = null
}

const deleteCostLine = (costId: string) => {
  if (!localWork.value.costLines) return
  const index = localWork.value.costLines.findIndex(c => c.id === costId)
  if (index !== -1) {
    localWork.value.costLines.splice(index, 1)
  }
}

// Edit mode methods
const saveEditChanges = () => {
  showEditMode.value = false
  // Changes are already applied to localWork, will be saved when modal closes
}

const cancelEdit = () => {
  // Restore original work data
  localWork.value = initializeLocalWork(originalWork.value)
  showEditMode.value = false
}

// Contractor methods
const handleRemoveContractor = () => {
  if (localWork.value.contractor) {
    localWork.value.contractor = {
      name: '',
      phone: '',
      email: '',
      contractSigned: false
    }
  }
  showRemoveContractorDialog.value = false
}

// Image upload methods
const triggerImageInput = () => {
  imageInput.value?.click()
}

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    processImages(Array.from(target.files))
  }
}

const handleImageDrop = (event: DragEvent) => {
  imageDragOver.value = false
  if (event.dataTransfer?.files) {
    processImages(Array.from(event.dataTransfer.files))
  }
}

const processImages = (files: File[]) => {
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageObj = {
          id: `image-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          preview: e.target?.result as string
        }
        uploadedImages.value.push(imageObj)
      }
      reader.readAsDataURL(file)
    }
  })
  
  // Clear the input
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

const removeImage = (imageId: string) => {
  const index = uploadedImages.value.findIndex(img => img.id === imageId)
  if (index !== -1) {
    uploadedImages.value.splice(index, 1)
  }
}

// Document upload methods
const triggerDocumentInput = () => {
  documentInput.value?.click()
}

const handleDocumentSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    processDocuments(Array.from(target.files))
  }
}

const handleDocumentDrop = (event: DragEvent) => {
  documentDragOver.value = false
  if (event.dataTransfer?.files) {
    processDocuments(Array.from(event.dataTransfer.files))
  }
}

const processDocuments = (files: File[]) => {
  files.forEach(file => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx']
    
    if (allowedTypes.includes(extension || '')) {
      const docObj = {
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size
      }
      uploadedDocuments.value.push(docObj)
    }
  })
  
  // Clear the input
  if (documentInput.value) {
    documentInput.value.value = ''
  }
}

const removeDocument = (docId: string) => {
  const index = uploadedDocuments.value.findIndex(doc => doc.id === docId)
  if (index !== -1) {
    uploadedDocuments.value.splice(index, 1)
  }
}

const getDocumentIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'pdf': return '📄'
    case 'doc':
    case 'docx': return '📝'
    case 'txt': return '📋'
    case 'xls':
    case 'xlsx': return '📊'
    default: return '📎'
  }
}

const getFileExtension = (fileName: string) => {
  return fileName.split('.').pop()?.toUpperCase() || 'FILE'
}

const saveUploads = () => {
  // TODO: Implement actual upload to backend
  console.log('Saving uploads:', { 
    images: uploadedImages.value, 
    documents: uploadedDocuments.value 
  })
  
  // For now, just close the upload panel
  showUploadsSection.value = false
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Formatting functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-BE')
}

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

// Coming Soon Modal handler
const handleNotificationRequest = async (email: string) => {
  const { saveInformationInquiry } = useStrapi()
  
  try {
    // Include context about the current user and work for better targeting
    const userData = {
      workId: props.work.id,
      workName: props.work.name,
      executionType: props.work.executionType,
      // Add user ID when auth is available
      userId: null // TODO: Get from useAuth when ready
    }
    
    const result = await saveInformationInquiry(email, 'contractor-marketplace', userData)
    
    if (result.success) {
      console.log('✅ Email saved successfully:', result.message)
      // TODO: Show success toast/notification to user
    } else {
      console.error('❌ Failed to save email:', result.message)
      // TODO: Show error message to user
    }
  } catch (error) {
    console.error('Failed to save information inquiry:', error)
  }
}
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Modal Header */
.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.header-btn:hover {
  background: #e5e7eb;
}

/* Edit Mode */
.edit-mode {
  padding: 1rem 0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.edit-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-section {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.execution-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.execution-option {
  position: relative;
  cursor: pointer;
}

.execution-radio {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  transition: all 0.2s;
}

.execution-option:hover .option-content {
  border-color: #3b82f6;
}

.execution-option.selected .option-content {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option-icon {
  font-size: 1.5rem;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.option-label {
  font-weight: 500;
  color: #111827;
}

.option-desc {
  font-size: 0.75rem;
  color: #6b7280;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-save:hover {
  background: #2563eb;
}

/* Contractor Section */
.contractor-request {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
}

.request-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.request-icon {
  font-size: 1.5rem;
}

.request-message p {
  margin: 0;
  color: #6b7280;
}

.btn-request-contractor {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-request-contractor:hover {
  background: #2563eb;
}

.contractor-details {
  padding: 0;
}

.contractor-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.contractor-info {
  width: 100%;
}

.contractor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.contractor-main {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.btn-remove-contractor {
  padding: 0.375rem;
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-remove-contractor:hover {
  background: #fee2e2;
}

.contractor-name {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.contractor-contact {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.contract-status {
  align-self: flex-start;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.contract-status.signed {
  background: #d1fae5;
  color: #065f46;
}

.contract-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.unsaved-indicator {
  font-size: 0.875rem;
  font-weight: 400;
  color: #f59e0b;
  margin-left: 0.5rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.header-badges {
  display: flex;
  gap: 0.5rem;
}

.execution-badge,
.timeline-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-diy {
  background: #dcfce7;
  color: #166534;
}

.badge-contractor {
  background: #fef3c7;
  color: #92400e;
}

.badge-hybrid {
  background: #dbeafe;
  color: #1e40af;
}

.timeline-badge {
  background: #f3f4f6;
  color: #4b5563;
}

.close-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.close-button:hover {
  color: #111827;
}

/* Modal Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.detail-value {
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
}

.text-success {
  color: #059669;
}

.description-text {
  color: #4b5563;
  line-height: 1.5;
}

/* Upload Mode */
.upload-mode {
  padding: 1rem 0;
}

.upload-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-input {
  display: none;
}

.drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.drop-zone:hover .upload-icon,
.drop-zone.drag-over .upload-icon {
  color: #3b82f6;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-primary {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.upload-secondary {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.uploaded-files {
  margin-top: 1rem;
}

.uploaded-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

/* Image Grid */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.image-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.image-preview {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.image-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.btn-remove-image {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove-image:hover {
  background: white;
  transform: scale(1.1);
}

.image-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.image-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-size {
  font-size: 0.625rem;
  color: #6b7280;
}

/* Document List */
.document-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  transition: all 0.2s;
}

.document-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.document-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.document-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.document-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.document-meta {
  display: flex;
  gap: 0.75rem;
}

.document-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.document-type {
  font-size: 0.75rem;
  font-weight: 500;
  color: #3b82f6;
  text-transform: uppercase;
}

.btn-remove-document {
  padding: 0.5rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-remove-document:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Contractor Info */
.contractor-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.subsection-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 0.75rem 0;
}

.contractor-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.contractor-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

/* Progress Indicator */
.progress-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  transition: width 0.3s ease;
}

.progress-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

/* Todo Section */
.add-todo-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.todo-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.priority-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  background: white;
}

.add-todo-button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.875rem;
}

.add-todo-button:hover {
  background: #2563eb;
}

/* Todo List */
.todo-list {
  /* Removed max-height and overflow to prevent nested scrolling */
}

.todo-item {
  display: flex;
  align-items: start;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 0.25rem;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.todo-item:hover {
  background: #f9fafb;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #9ca3af;
}

.todo-checkbox {
  margin-top: 0.125rem;
  cursor: pointer;
}

.todo-content {
  flex: 1;
}

.todo-text {
  display: block;
  color: #111827;
  margin-bottom: 0.25rem;
}

.todo-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.todo-priority {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
}

.priority-high {
  background: #fee2e2;
  color: #991b1b;
}

.priority-medium {
  background: #fef3c7;
  color: #92400e;
}

.priority-low {
  background: #dbeafe;
  color: #1e40af;
}

.todo-due {
  color: #6b7280;
}

.delete-todo {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s;
}

.delete-todo:hover {
  color: #ef4444;
}

.empty-todos {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

/* Phase Actions */
.phase-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-phase-advance {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.btn-phase-advance:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

/* Phases Timeline */
.phases-timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 1rem 0;
}

.phases-timeline::before {
  content: '';
  position: absolute;
  top: 1.5rem;
  left: 1rem;
  right: 1rem;
  height: 2px;
  background: #e5e7eb;
}

.phase-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  position: relative;
  z-index: 1;
}

.phase-marker {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  background: white;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.phase-item.completed .phase-marker {
  background: #10b981;
  border-color: #10b981;
}

.phase-item.current .phase-marker {
  background: #f59e0b;
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
  animation: pulse-current 2s infinite;
}

@keyframes pulse-current {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.phase-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #4b5563;
  text-align: center;
}

.phase-status {
  font-size: 0.625rem;
  color: #9ca3af;
}

.phase-date {
  font-size: 0.625rem;
  color: #059669;
  font-weight: 500;
}

/* Manual Complete Button */
.manual-complete-button {
  position: absolute;
  bottom: -3rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.manual-complete-button:hover {
  background: rgba(239, 68, 68, 1);
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

/* Fade transition for manual complete button */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal Footer */
.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container {
  transform: scale(0.9);
}

.modal-leave-to .modal-container {
  transform: scale(0.9);
}

.todo-enter-active,
.todo-leave-active {
  transition: all 0.3s ease;
}

.todo-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.todo-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Uploads Section */
.btn-toggle-uploads {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-uploads:hover {
  background: #e5e7eb;
}

.btn-toggle-uploads.expanded {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.uploads-content {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.upload-field {
  margin-bottom: 1.5rem;
}

.btn-upload {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  color: #374151;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

/* Upload Area */
.upload-area {
  margin-bottom: 1.5rem;
}

.file-input {
  display: none;
}

.drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.drop-zone:hover .upload-icon,
.drop-zone.drag-over .upload-icon {
  color: #3b82f6;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-primary {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.upload-secondary {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.uploaded-files {
  margin-top: 1.5rem;
}

.uploaded-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
}

.file-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.btn-remove-file {
  padding: 0.25rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-remove-file:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Cost Lines */
.cost-lines {
  margin-top: 1rem;
}

.add-cost-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.cost-description-input {
  flex: 2;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.cost-amount-input {
  flex: 1;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.cost-description-input:focus,
.cost-amount-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.add-cost-button {
  padding: 0.625rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.add-cost-button:hover {
  background: #2563eb;
}

.cost-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cost-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
}

.cost-description {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
}

.cost-amount {
  font-size: 0.875rem;
  font-weight: 600;
  color: #059669;
  margin-right: 0.5rem;
}

.delete-cost {
  padding: 0.25rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.delete-cost:hover {
  background: #fee2e2;
  color: #dc2626;
}

.empty-costs {
  text-align: center;
  padding: 1.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.btn-add-doc {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add-doc:hover {
  background: #2563eb;
}

.empty-documents,
.empty-progress {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.doc-icon {
  font-size: 1.5rem;
}

.doc-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.doc-name {
  font-weight: 500;
  color: #111827;
}

.doc-meta {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: capitalize;
}

.doc-amount {
  font-size: 0.875rem;
  font-weight: 600;
  color: #059669;
}

.btn-remove-doc,
.btn-remove-update {
  padding: 0.375rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-remove-doc:hover,
.btn-remove-update:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Progress Tab */
.progress-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.progress-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}

.progress-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.progress-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-add-photo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-photo:hover {
  background: #e5e7eb;
}

.btn-save-progress {
  padding: 0.5rem 1rem;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save-progress:hover {
  background: #047857;
}

.progress-updates {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-update-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.update-date {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
}

.update-content {
  flex: 1;
}

.update-description {
  margin: 0 0 0.75rem 0;
  color: #374151;
  line-height: 1.5;
}

.update-photos {
  display: flex;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.progress-photo {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.update-notes {
  margin: 0.75rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .modal-container {
    max-height: 100vh;
    height: 100vh;
    max-width: 100%;
    border-radius: 0;
  }
  
  .execution-selector {
    grid-template-columns: 1fr;
  }
  
  .phases-timeline {
    flex-wrap: wrap;
  }

  .cost-summary {
    grid-template-columns: 1fr;
  }

  .progress-actions {
    flex-direction: column;
  }

  .progress-update-item {
    flex-direction: column;
    gap: 0.75rem;
  }

  .update-date {
    align-self: flex-start;
  }
}
</style>