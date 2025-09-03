# Simple API Integration Examples

## Basic Strapi Setup

```typescript
// composables/useStrapi.ts
export const useStrapi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.strapiUrl || 'http://localhost:1337'
  
  const apiCall = async (endpoint: string, options: any = {}) => {
    const { data: user } = await useAuth()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    if (user.value?.jwt) {
      headers.Authorization = `Bearer ${user.value.jwt}`
    }
    
    return await $fetch(`${baseURL}/api${endpoint}`, {
      ...options,
      headers
    })
  }
  
  return { api: apiCall, baseURL }
}
```

## Get All Works

```typescript
const fetchUserWorks = async (userId: string) => {
  const { api } = useStrapi()
  
  const response = await api('/renovation-works', {
    method: 'GET',
    query: {
      filters: { user: { id: { $eq: userId } } },
      populate: ['todos', 'attachments', 'project'],
      sort: 'createdAt:desc'
    }
  })
  
  return response.data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
    createdAt: new Date(item.attributes.createdAt),
    updatedAt: new Date(item.attributes.updatedAt)
  }))
}
```

## Create Work

```typescript
const createWork = async (workData: Partial<RenovationWork>) => {
  const { api } = useStrapi()
  
  const response = await api('/renovation-works', {
    method: 'POST',
    body: {
      data: {
        name: workData.name,
        description: workData.description,
        budget: workData.budget,
        status: workData.status || 'planned',
        executionType: workData.executionType || 'DIY',
        timeline: workData.timeline || 'now',
        year: workData.year,
        user: workData.userId,
        project: workData.projectId
      }
    }
  })
  
  return response.data
}
```

## Update Work

```typescript
const updateWork = async (workId: string, updates: Partial<RenovationWork>) => {
  const { api } = useStrapi()
  
  const response = await api(`/renovation-works/${workId}`, {
    method: 'PUT',
    body: {
      data: {
        ...updates,
        // Handle todos
        todos: updates.todos?.map(todo => ({
          text: todo.text,
          completed: todo.completed
        })),
        // Handle contractor
        contractor: updates.contractor ? {
          name: updates.contractor.name,
          phone: updates.contractor.phone,
          email: updates.contractor.email
        } : null
      }
    }
  })
  
  return response.data
}
```

## File Upload & Delete

```typescript
// Upload file
const uploadFile = async (file: File, name: string) => {
  const { baseURL } = useStrapi()
  const { data: user } = await useAuth()
  
  const formData = new FormData()
  formData.append('files', file)
  
  const response = await fetch(`${baseURL}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user.value?.jwt}`
    },
    body: formData
  })
  
  const uploadedFiles = await response.json()
  return uploadedFiles[0] // Return first uploaded file
}

// Delete file from Strapi
const deleteFile = async (fileId: string) => {
  const { api } = useStrapi()
  
  try {
    await api(`/upload/files/${fileId}`, {
      method: 'DELETE'
    })
    return true
  } catch (error) {
    console.error('Failed to delete file:', error)
    return false
  }
}

// Add attachment to work
const addAttachment = async (workId: string, file: File, name: string) => {
  // First upload the file
  const uploadedFile = await uploadFile(file, name)
  
  // Get current work
  const currentWork = await api(`/renovation-works/${workId}?populate=attachments`)
  const currentAttachments = currentWork.data.attributes.attachments || []
  
  // Add new attachment
  const response = await api(`/renovation-works/${workId}`, {
    method: 'PUT',
    body: {
      data: {
        attachments: [
          ...currentAttachments,
          {
            name: name,
            file: uploadedFile.id
          }
        ]
      }
    }
  })
  
  return response.data
}

// Remove attachment from work
const removeAttachment = async (workId: string, attachmentIndex: number) => {
  // Get current work
  const currentWork = await api(`/renovation-works/${workId}?populate=attachments`)
  const currentAttachments = currentWork.data.attributes.attachments || []
  
  // Get the file ID before removing
  const attachmentToRemove = currentAttachments[attachmentIndex]
  const fileId = attachmentToRemove.file?.id
  
  // Remove from attachments array
  const updatedAttachments = currentAttachments.filter((_, index) => index !== attachmentIndex)
  
  // Update work
  await api(`/renovation-works/${workId}`, {
    method: 'PUT',
    body: {
      data: {
        attachments: updatedAttachments
      }
    }
  })
  
  // Delete the actual file from Strapi
  if (fileId) {
    await deleteFile(fileId)
  }
  
  return true
}
```

## Updated Frontend Types

```typescript
// types/renovationWork.ts - Simplified
export interface WorkTodo {
  id: string
  text: string
  completed: boolean
}

export interface WorkAttachment {
  id: string
  name: string
  file?: File
}

export interface RenovationWork {
  id: string
  name: string
  description?: string
  budget: number
  actualCost?: number
  status: 'active' | 'planned' | 'future' | 'completed'
  executionType: 'DIY' | 'Contractor' | 'Hybrid'
  timeline: string
  year?: number
  progress: number
  canActivate: boolean
  contractor?: {
    name?: string
    phone?: string
    email?: string
  }
  startDate?: Date
  completedAt?: Date
  todos: WorkTodo[]
  attachments: WorkAttachment[]
  createdAt: Date
  updatedAt: Date
  projectId?: string
}
```

## Updated useRenovationWorks

```typescript
// composables/useRenovationWorks.ts - Simplified
export const useRenovationWorks = () => {
  const state = useState<RenovationWorksState>('renovation-works', () => ({
    works: [],
    loading: false,
    error: null
  }))
  
  const { api } = useStrapi()
  const { data: user } = await useAuth()
  
  const fetchWorks = async () => {
    if (!user.value?.id) return
    
    state.value.loading = true
    try {
      const works = await fetchUserWorks(user.value.id)
      state.value.works = works
    } catch (error) {
      state.value.error = 'Failed to fetch works'
    } finally {
      state.value.loading = false
    }
  }
  
  const createWork = async (workData: Partial<RenovationWork>) => {
    if (!user.value?.id) return false
    
    try {
      const newWork = await createWork({
        ...workData,
        userId: user.value.id
      })
      state.value.works.push(newWork)
      return true
    } catch (error) {
      state.value.error = 'Failed to create work'
      return false
    }
  }
  
  const updateWork = async (workId: string, updates: Partial<RenovationWork>) => {
    try {
      const updatedWork = await updateWork(workId, updates)
      const index = state.value.works.findIndex(w => w.id === workId)
      if (index !== -1) {
        state.value.works[index] = { ...state.value.works[index], ...updatedWork.attributes }
      }
      return true
    } catch (error) {
      state.value.error = 'Failed to update work'
      return false
    }
  }
  
  return {
    state: readonly(state),
    fetchWorks,
    createWork,
    updateWork
  }
}
```

That's it - simple CRUD operations matching exactly what your frontend needs.