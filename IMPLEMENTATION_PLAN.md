# Renovation Works Implementation Plan

## Current Status
✅ **Frontend Interactive Implementation Complete**
- TypeScript interfaces defined for renovation works
- Interactive composable with mock data created
- Dashboard updated to use dynamic data
- Interactive features implemented (activate works, advance phases)

## Phase 1: Immediate Frontend Polish (Already Complete)
✅ Created `/types/renovationWork.ts` with complete type definitions
✅ Created `/composables/useRenovationWorks.ts` with:
  - Mock data initialization
  - State management for works
  - Interactive functions (activate, update progress, advance phase)
  - Strapi integration prepared (will attempt API calls, fallback to mock)
✅ Updated dashboard to:
  - Display dynamic renovation works
  - Show work phases with visual indicators
  - Enable work activation from planned to active
  - Allow phase advancement with "Next Phase" button
  - Display proper formatting for budgets and timelines

## Phase 2: Strapi Backend Setup (Your Work)

### 2.1 Create Content Types in Strapi Admin Panel

#### RenovationWork Content Type
```json
{
  "attributes": {
    "name": { "type": "string", "required": true },
    "description": { "type": "text" },
    "budget": { "type": "decimal", "required": true },
    "actualCost": { "type": "decimal" },
    "status": {
      "type": "enumeration",
      "enum": ["active", "planned", "future", "completed"],
      "default": "planned"
    },
    "executionType": {
      "type": "enumeration",
      "enum": ["DIY", "Contractor", "Hybrid"],
      "default": "DIY"
    },
    "timeline": { "type": "string", "default": "Q1" },
    "year": { "type": "integer" },
    "currentPhase": {
      "type": "enumeration",
      "enum": ["dream", "financing", "design", "plan", "execute", "admin", "close"],
      "default": "dream"
    },
    "progress": { "type": "integer", "default": 0, "min": 0, "max": 100 },
    "progressDescription": { "type": "string" },
    "canActivate": { "type": "boolean", "default": false },
    "phases": { "type": "json" },
    "financing": { "type": "json" },
    "completedAt": { "type": "datetime" },
    "project": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::project.project"
    }
  }
}
```

#### WorkPhase Component (optional, for structured phases)
```json
{
  "attributes": {
    "phase": {
      "type": "enumeration",
      "enum": ["dream", "financing", "design", "plan", "execute", "admin", "close"]
    },
    "status": {
      "type": "enumeration",
      "enum": ["pending", "in_progress", "completed"]
    },
    "completedAt": { "type": "datetime" },
    "notes": { "type": "text" }
  }
}
```

### 2.2 API Routes to Enable

In Strapi, ensure these routes are enabled and properly configured:

1. **GET** `/api/renovation-works` - List all works with filtering
2. **GET** `/api/renovation-works/:id` - Get single work
3. **POST** `/api/renovation-works` - Create new work
4. **PUT** `/api/renovation-works/:id` - Update work
5. **DELETE** `/api/renovation-works/:id` - Delete work

### 2.3 Permissions Configuration

In Strapi Admin > Settings > Roles:

**Public Role:**
- renovation-works: find, findOne (if public access needed)

**Authenticated Role:**
- renovation-works: find, findOne, create, update, delete (with proper owner policies)

### 2.4 Add Policies for User Ownership

Create policy to ensure users can only manage their own renovation works:

```javascript
// src/api/renovation-work/policies/is-owner.js
module.exports = async (ctx, next) => {
  const { user } = ctx.state;
  const { id } = ctx.params;
  
  const work = await strapi.entityService.findOne('api::renovation-work.renovation-work', id, {
    populate: ['project', 'project.user']
  });
  
  if (!work || work.project.user.id !== user.id) {
    return ctx.unauthorized('You cannot access this resource');
  }
  
  await next();
};
```

## Phase 3: Frontend-Backend Integration (My Work After Strapi Setup)

### 3.1 Environment Configuration
Create `.env` file:
```env
STRAPI_BASE_URL=http://localhost:1337
```

### 3.2 Update Authentication
The `useAuth` composable needs real Strapi authentication:
- Replace mock login with Strapi Auth API
- Implement JWT refresh logic
- Add proper error handling

### 3.3 Connect Renovation Works
The composable is already prepared to:
- Attempt Strapi API calls first
- Fall back to mock data if unavailable
- Transform Strapi data to frontend format

## Phase 4: Advanced Features (Future Enhancements)

### 4.1 Contractor Integration
- Link works to contractor profiles
- Request and compare quotes
- Track contractor performance

### 4.2 Document Management
- Attach invoices, permits, photos to works
- Generate reports for tax purposes
- Export renovation history

### 4.3 Budget Tracking
- Real-time budget vs actual cost tracking
- Payment milestones
- Financial reporting

### 4.4 Timeline Management
- Gantt chart visualization
- Dependency management between works
- Critical path analysis

### 4.5 Notifications
- Phase completion alerts
- Budget overrun warnings
- Contractor message notifications

## Testing Checklist

### Frontend (Already Working)
✅ Mock data loads on dashboard
✅ Work activation moves from planned to active
✅ Phase advancement updates visual indicators
✅ Progress bars reflect work completion
✅ Budget totals calculate correctly

### Backend (To Test After Setup)
- [ ] Strapi content types created successfully
- [ ] API endpoints accessible
- [ ] Authentication working
- [ ] User can only see their own works
- [ ] CRUD operations function correctly
- [ ] Relations to projects work

### Integration (Final Testing)
- [ ] Frontend connects to Strapi when available
- [ ] Falls back to mock data gracefully
- [ ] State persists across sessions
- [ ] Multi-user isolation works

## Quick Start Commands

```bash
# Frontend (already running)
npm run dev

# Strapi Backend (your setup)
cd ../renovatiebudget-backend
npm run develop

# Create content types in Strapi Admin
# http://localhost:1337/admin
```

## Summary

The frontend is **fully interactive** with mock data. The renovation works can be:
- Activated from planned to active status
- Advanced through phases (Dream → Financing → Design → Plan → Execute → Admin → Close)
- Tracked with progress indicators
- Categorized by execution type (DIY/Contractor/Hybrid)

Once you set up the Strapi content types following the structure above, the frontend will automatically attempt to connect and use real data, while maintaining the mock data fallback for development.