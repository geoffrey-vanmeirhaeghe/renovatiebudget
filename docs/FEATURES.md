# RenovatieBudget Features Documentation

This document provides detailed documentation of all features in the RenovatieBudget platform.

## Table of Contents

1. [3D House Builder](#3d-house-builder)
2. [Renovation Works Management](#renovation-works-management)
3. [User Authentication & Onboarding](#user-authentication--onboarding)
4. [Project Management](#project-management)
5. [Dashboard](#dashboard)

---

## 3D House Builder

### Overview
The 3D house builder allows users to create and visualize their property structure using Three.js/TresJS technology.

### Core Components
- **House Renderer** (`components/renderings/house.vue`)
- **Element Selection System** 
- **Property Panels** for customization
- **Tool System** for adding elements

### Capabilities

#### Floors
- Add multiple floors with individual properties
- Configurable dimensions (width, depth, height)
- Custom colors and positioning
- Height positioning relative to other floors

#### Windows & Doors
- Click-to-place system on 3D surfaces
- Configurable dimensions and positioning
- Orientation-based placement (front, back, left, right)
- Real-time visual updates

#### Roof System
- Supported types: Gable, Hip, Flat, Shed
- Custom geometry generation
- Configurable dimensions and positioning
- Belgian building standards compliance

### Technical Implementation

#### Geometry Calculation
```javascript
// Convert 2D coordinates to 3D positioning
calcOffsetPosition(orientation, x, width, depth)

// Calculate element dimensions based on wall orientation  
calcOffsetSize(orientation, elementWidth, elementHeight, wallThickness)
```

#### Data Structure
```typescript
interface Project {
  generalAttributes: {
    propertySize: { width, depth, area? }
    floorSize: { width, depth, area? }
  }
  floors: Record<string, Floor>
  roof: Roof
}
```

---

## Renovation Works Management

### Overview
Comprehensive system for planning, tracking, and managing renovation projects. Supports both DIY and contractor-based work.

### Core Features

#### Work Status Management
- **Active**: Currently in progress
- **Planned**: Ready to start (can be activated)
- **Future**: Scheduled for later
- **Completed**: Finished work

#### Execution Types
- **DIY**: User executes the work themselves
- **Contractor**: Professional contractor hired
- **Hybrid**: Combination of DIY and contractor work

#### Timeline Management
- **Now**: Immediate execution
- **Q1/Q2/Q3/Q4**: Quarterly planning
- **Custom**: Flexible scheduling

### Data Structure

#### RenovationWork Interface
```typescript
interface RenovationWork {
  id: string
  name: string
  description?: string
  budget: number
  actualCost?: number
  status: 'active' | 'planned' | 'future' | 'completed'
  executionType: 'DIY' | 'Contractor' | 'Hybrid'
  timeline: 'now' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | string
  year?: number
  todos: WorkTodo[]
  attachments: WorkAttachment[]
  progress: number // 0-100
  canActivate: boolean
  contractor?: {
    name?: string
    phone?: string
    email?: string
  }
  startDate?: Date
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  projectId?: string
}
```

#### Todo System
```typescript
interface WorkTodo {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  completedAt?: Date
  dueDate?: Date
  assignee?: string
  notes?: string
}
```

#### Attachment System
```typescript
interface WorkAttachment {
  id: string
  type: 'invoice' | 'receipt' | 'quote' | 'contract' | 'photo' | 'other'
  name: string
  url?: string
  file?: File
  uploadedAt: Date
  amount?: number
  description?: string
}
```

### Key Functionality

#### Work Lifecycle Management
1. **Creation**: Create new renovation work items
2. **Planning**: Set timeline, budget, execution type
3. **Activation**: Start planned work (changes status to 'active')
4. **Progress Tracking**: Update completion percentage and add todos
5. **Completion**: Mark as completed with final costs

#### State Management (`useRenovationWorks`)

**Work Filtering:**
```typescript
const activeWorks = computed(() => 
  state.value.works.filter(w => w.status === 'active')
)
const plannedWorks = computed(() => 
  state.value.works.filter(w => w.status === 'planned')  
)
```

**Budget Tracking:**
```typescript
const totalBudget = computed(() => 
  state.value.works.reduce((sum, work) => sum + work.budget, 0)
)
const totalSpent = computed(() => 
  state.value.works
    .filter(w => w.actualCost)
    .reduce((sum, work) => sum + (work.actualCost || 0), 0)
)
```

**Core Actions:**
- `activateWork(workId)` - Start planned work
- `deactivateWork(workId)` - Move active work back to planned
- `updateWorkProgress(workId, progress, description)` - Update completion
- `createWork(workData)` - Create new work item
- `deleteWork(workId)` - Remove work item
- `addTodoToWork(workId, todoText, priority)` - Add task
- `toggleTodo(workId, todoId)` - Complete/uncomplete task
- `completeWork(workId)` - Mark work as finished

### Backend Integration

#### Strapi Content Type
Located at: `renovatiebudget-strapi/src/api/renovation-work/`

**Schema Attributes:**
- Name (string, required, max 100 chars)
- Description (text, max 1000 chars)
- Timeline (enum: Now, Q1, Q2, Q3, Q4)
- Year (integer, 2024-2099)
- Budget (decimal, required, default 0)
- ActualCost (integer)
- ScheduledStatus (enum: Active, Planned, Future, Completed)
- progress (integer, 0-100, default 0)
- canActivate (boolean, default false)
- executionType (enum: DIY, Contractor, Hybrid)
- Contractor (json)
- StartDate (date)
- CompletedAt (date)
- todos (component: work.todo, repeatable)
- attachments (component: work.attachment, repeatable)

**Relations:**
- project (many-to-one with api::project.project)
- users_permissions_user (many-to-one)

### UI Components

#### Main Components
- **RenovationWorkModal** (`components/modals/RenovationWorkModal.vue`) - Create/edit works
- **CreateWorkModal** (`components/modals/CreateWorkModal.vue`) - Quick work creation
- **WorkActivationToggle** (`components/ui/WorkActivationToggle.vue`) - Start/stop work

#### Dashboard Integration
- Work status overview cards
- Budget tracking summaries  
- Progress visualizations
- Quick action buttons

### Future Enhancements

#### Planned Features
- **Document Management**: PDF storage, photo uploads, receipt tracking
- **Cost Estimation**: Integration with material/labor cost databases
- **Contractor Integration**: Direct contractor communication and offer management
- **Progress Photos**: Visual documentation of work completion
- **Permit Tracking**: Manage required building permits
- **Timeline Visualization**: Gantt charts and project timelines

#### WorkComponent System (Planned)
```typescript
interface WorkComponent {
  id: string
  type: 'insulation' | 'demolition' | 'installation' | 'finishing' | 'structural'
  category: string // e.g., 'roof-insulation', 'wall-demolition'
  name: string
  description: string
  estimatedCost?: number
  estimatedDuration?: number // in days
  requiredSkills: 'DIY' | 'Professional' | 'Specialist'
  materials?: string[]
  warnings?: string[] // e.g., 'Requires asbestos check', 'Permit needed'
  selected: boolean
  completed: boolean
}
```

---

## User Authentication & Onboarding

### Authentication Flow

#### Registration
1. User provides email and password
2. Account created in Strapi with `userPhase: 'onboarding'`
3. JWT token stored in localStorage
4. Redirect to `/onboarding`

#### Login
1. Credential validation against Strapi
2. User data transformation to frontend format
3. Redirect based on `userPhase`:
   - `onboarding` → `/onboarding`
   - `project-setup` → `/builder`
   - `active` → `/dashboard`

#### User Phases
- **onboarding**: Complete profile (name, phone, project type)
- **project-setup**: Build 3D house model
- **active**: Access full dashboard and features

### Onboarding Process

#### Steps
1. **Welcome & Profile**: Collect user details
2. **Project Information**: Property type, renovation scope
3. **Builder Guide**: Introduction to 3D tools
4. **Project Creation**: Initial house structure setup

#### Data Collection
```typescript
interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  phone: string
  userPhase: 'onboarding' | 'project-setup' | 'active'
  createdAt: Date
  updatedAt: Date
}
```

---

## Project Management

### Project Structure

#### Core Data Model
```typescript
interface Project {
  id?: string
  name?: string
  description?: string
  generalAttributes: GeneralAttributes
  floors: Record<string, Floor>
  roof: Roof
  createdAt?: string
  updatedAt?: string
  ownerId?: string
  collaborators?: string[]
}
```

#### Project Scopes (Strapi)
- New construction
- Casco project
- Full renovation
- Energetic renovation
- Interior renovation
- Home extension
- Layout renovation
- Finishing work

#### Project Status
- Setup
- In process
- Follow-up
- Done

### Sync System

#### Frontend ↔ Strapi Transformation
The `useStrapi` composable handles bidirectional data transformation:

**Strapi → Frontend:**
```typescript
const transformProject = (strapiProject: any): Project => {
  return {
    name: strapiProject.ProjectName,
    generalAttributes: strapiProject.GeneralAttributes,
    floors: transformFloors(strapiProject.building.floors),
    roof: transformRoof(strapiProject.building.Roof[0])
  }
}
```

**Frontend → Strapi:**
```typescript
const transformProjectToStrapi = (project: Project): any => {
  return {
    ProjectName: project.name,
    GeneralAttributes: project.generalAttributes,
    building: {
      Description: `Building for project: ${project.name}`,
      floors: transformFloorsToStrapi(project.floors),
      Roof: [transformRoofToStrapi(project.roof)]
    }
  }
}
```

---

## Dashboard

### Overview
Central hub for managing projects, renovation works, and accessing tools.

### Current Features

#### Project Overview
- Active project display
- Quick statistics (budget, progress, timeline)
- Recent activity feed

#### Renovation Works Summary
- Status-based work filtering (Active, Planned, Future, Completed)
- Budget tracking and spending overview
- Progress indicators

#### Quick Actions
- Create new renovation work
- Access 3D builder
- View project details

### Planned Enhancements

#### Contractor Dashboard (Future)
- Job opportunity listings
- Offer management system
- Review and rating display
- Communication tools

#### Advanced Analytics
- Cost trend analysis
- Timeline optimization suggestions
- Completion rate tracking
- ROI calculations

#### Integration Features
- Calendar integration for scheduling
- Weather impact notifications
- Material delivery tracking
- Permit status monitoring

---

## Development Notes

### State Management Philosophy
- **Composables**: Vue 3 Composition API for reactive state
- **Local-first**: Offline capability with Strapi sync
- **Optimistic Updates**: Immediate UI feedback with background sync
- **Error Handling**: Graceful fallbacks when backend unavailable

### Performance Considerations
- **3D Optimization**: Level-of-detail rendering for complex models
- **Bundle Splitting**: Route-based code splitting
- **Image Optimization**: Automatic compression and lazy loading
- **Progressive Loading**: Staged feature availability

### Browser Support
- **WebGL Required**: For 3D visualization features
- **Modern Browsers**: ES2020+ features used
- **Mobile Responsive**: Touch-optimized 3D controls

---

*Last Updated: September 2024*