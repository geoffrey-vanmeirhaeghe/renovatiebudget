# RenovatieBudget Project Documentation

## Project Overview

RenovatieBudget is a comprehensive renovation platform for the Belgian market that connects homeowners with contractors while providing advanced project management and 3D visualization tools.

### Platform Purpose
- **For Homeowners**: Project planning, 3D house visualization, contractor matching, document management, cost tracking, and renovation guidance
- **For Contractors**: Job opportunities, offer management, project management tools, review system, communication tools, and administrative burden relief

### Current Status
- Frontend: Nuxt 3 with 3D house builder/visualizer (Three.js/TresJS)
- Backend: Strapi CMS (separate repository at ../renovatiebudget-strapi)
- Authentication: JWT-based with Strapi
- User Flow: Onboarding → Project Setup (3D Builder) → Dashboard

## Architecture

### Tech Stack

#### Frontend (This Repository)
- **Framework**: Nuxt 3 (Vue 3 with SSR/SSG)
- **3D Visualization**: Three.js + TresJS
- **Styling**: Tailwind CSS
- **State Management**: Vue Composition API (composables)
- **Type Safety**: TypeScript

#### Backend (renovatiebudget-strapi)
- **CMS**: Strapi v4
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT with users-permissions plugin
- **Custom Fields**: Address selection plugin

## Data Models

### Core Entities

#### Project
```typescript
{
  ProjectName: string (required)
  ProjectID: uid
  Scope: enum [
    "New construction",
    "Casco project", 
    "Full renovation",
    "Energetic renovation",
    "Interior renovation",
    "Home extension",
    "Layout renovation",
    "Finishing work"
  ]
  ProjectStatus: enum ["Setup", "In process", "Follow-up", "Done"]
  StartDate: date
  EndDate: date
  MovingDate: date
  Description: text (max 500)
  Address: custom field
  GeneralAttributes: json {
    propertySize: { width, depth, area? }
    floorSize: { width, depth, area? }
    region?: string
    buildingCode?: string
  }
  
  // Relations
  user: User (many-to-one)
  building: Building (one-to-one)
  renovation_works: RenovationWork[] (one-to-many)
}
```

#### Building
```typescript
{
  Description: string (required, max 75)
  ConstructionYear: date
  
  // Relations & Components
  floors: Floor[] (one-to-many)
  Roof: RoofComponent[] (repeatable component)
  room: Room (one-to-one)
  project: Project (one-to-one)
}
```

#### Floor
```typescript
{
  Storey: number
  Height: number (default: 250cm)
  HeightPosition: number (calculated: storey * height)
  Color: string (hex)
  Dimensions: {
    width?: number
    depth?: number
    height: number
    position?: { x, z }
  }
  
  // Elements
  Windows: WindowComponent[]
  Doors: DoorComponent[]
}
```

#### User (Extended Strapi User)
```typescript
{
  // Default Strapi fields
  email: string
  username: string
  
  // Custom fields
  firstName: string
  lastName: string
  phone: string
  userPhase: enum ["onboarding", "project-setup", "active"]
  
  // Relations
  projects: Project[] (one-to-many)
}
```

## API Integration

### Configuration

#### Environment Variables
```env
# Frontend (.env)
STRAPI_BASE_URL=http://localhost:1337

# Strapi Backend (.env)
HOST=0.0.0.0
PORT=1337
APP_KEYS=<generated>
API_TOKEN_SALT=<generated>
ADMIN_JWT_SECRET=<generated>
JWT_SECRET=<generated>
```

### Authentication Flow

1. **Registration**: `/api/auth/local/register`
   - Creates user with `userPhase: "onboarding"`
   - Returns JWT token
   - Redirects to `/onboarding`

2. **Login**: `/api/auth/local`
   - Validates credentials
   - Returns JWT + user data
   - Redirects based on userPhase:
     - `onboarding` → `/onboarding`
     - `project-setup` → `/builder`
     - `active` → `/dashboard`

3. **Token Storage**: localStorage (`auth_token`, `user_data`)

### Main API Endpoints

#### Projects
- `GET /api/projects` - List user projects
- `GET /api/projects/:id?populate=deep` - Get project with relations
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project

#### Buildings & Floors
- Automatically managed through project relations
- Deep population returns full structure

## 3D Builder System

### Core Components

#### Rendering Engine (`components/renderings/house.vue`)
- Three.js scene setup
- Camera controls (OrbitControls)
- Element selection system
- Real-time updates

#### Geometry Generation
- **Floors**: Box geometry with configurable dimensions
- **Windows/Doors**: Cut-out system with box geometries
- **Roof**: Custom geometry functions (gable, hip, flat, shed)

#### Positioning System
```javascript
// Convert 2D floor plan to 3D coordinates
calcOffsetPosition(orientation, x, width, depth)

// Calculate 3D dimensions based on orientation
calcOffsetSize(orientation, elementWidth, elementHeight, wallThickness)
```

### Element Creation Flow
1. User selects tool (window/door/floor)
2. Clicks on 3D surface
3. Element positioned based on raycasting
4. Properties panel opens for customization
5. Element saved to project data

## User Journey

### Phase 1: Onboarding
- User registration/login
- Profile completion (name, phone)
- Project type selection
- Basic property information

### Phase 2: Project Setup (Builder)
- 3D house modeling
- Add floors, windows, doors
- Configure roof type
- Save project structure

### Phase 3: Active Dashboard
- View project overview
- Manage renovation works
- Track progress
- Communicate with contractors (future)

## Development Workflow

### Commands

#### Frontend
```bash
npm install          # Install dependencies
npm run dev         # Development server (localhost:3000)
npm run build       # Production build
npm run preview     # Preview production build
```

#### Strapi Backend
```bash
npm install         # Install dependencies
npm run develop     # Development server (localhost:1337)
npm run build       # Build admin panel
npm run start       # Production server
```

### Project Structure

```
renovatiebudget/
├── components/
│   ├── renderings/     # 3D visualization components
│   ├── ui/            # UI components
│   ├── modals/        # Modal dialogs
│   └── onboarding/    # Onboarding flow
├── composables/       # Vue composables (state management)
├── pages/            # Nuxt pages (routing)
├── types/            # TypeScript definitions
├── scripts/          # Utility scripts
└── assets/           # Static assets

renovatiebudget-strapi/
├── src/
│   ├── api/          # Content types & APIs
│   │   ├── project/
│   │   ├── building/
│   │   ├── floor/
│   │   └── renovation-work/
│   └── components/   # Shared components
└── config/           # Strapi configuration
```

## Current Features & Development Status

### Implemented ✅
- User authentication (register/login) with JWT
- Multi-step onboarding flow with user phases
- 3D house builder with:
  - Multiple floors with individual properties
  - Windows & doors placement via click-to-place
  - Roof types (gable, hip, flat, shed) with custom geometry
  - Element selection & editing system
  - Real-time 3D visualization updates
- Project persistence and sync with Strapi backend
- Renovation works system with:
  - Work status management (active, planned, future, completed)
  - Todo system with progress tracking
  - Budget and cost tracking
  - Timeline planning (quarterly + custom)
  - Execution types (DIY, Contractor, Hybrid)
- Basic dashboard with project overview

### Current Focus 🎯
**Dashboard Completion** (Primary Priority)
- Enhancing renovation works management interface
- Improving project overview and statistics
- Refining user experience flows
- Preparing for design phase transition

**Next Phase**: Figma Design Integration
- UI/UX design in Figma
- Design-to-code implementation
- Enhanced visual design while maintaining current functionality

### In Progress 🚧
- Dashboard refinements and user experience improvements
- Strapi content type optimizations
- Data flow improvements between frontend and backend

### Planned 📋
**Phase 1 (Post-Dashboard):**
- Enhanced 3D modeling with standardized shapes
- Improved geometry and positioning systems
- Better performance optimization

**Phase 2 (Core Platform):**
- Contractor matching system (bidirectional search)
- Direct communication between users and contractors
- Offer management system
- Review and rating system

**Phase 3 (Advanced Features):**
- Document management and file uploads
- Cost estimation database integration
- Payment/invoice processing
- Multi-language support (Dutch/French)
- Mobile responsive optimization

**Future Considerations:**
- Native mobile app
- Advanced analytics and reporting
- Integration with building material suppliers
- Permit tracking and regulatory compliance

## Business Model & Strategy

### Contractor Matching System
**Bidirectional Search Platform:**
- **Users** can search contractors based on:
  - Geographic proximity
  - Specialization/skills
  - Reviews and ratings
  - Availability
  - Price range
- **Contractors** can search for jobs based on:
  - Location preferences
  - Project types
  - Budget ranges
  - Timeline requirements

**Interaction Flow:**
1. Users post renovation projects (open jobs)
2. Contractors can submit offers on open jobs
3. Users review offers and decide to accept/decline
4. Direct communication channel opens upon acceptance
5. Transparent review system for both parties

**Quality Control:**
- Review system ensures bad contractors fade from platform
- Builds industry-wide quality improvement
- Transparent feedback system

### Monetization Strategy (TBD)
**User Tiers:**
- **Freemium/Premium Model**: Basic features free, premium features paid
- Potential full freemium approach depending on contractor revenue

**Contractor Revenue:**
- **Commission-based**: Percentage of completed projects, OR
- **Subscription Model**: Monthly/yearly contractor memberships
- Final model depends on contractor preferences and revenue forecasts

### Regional Strategy
**Phase 1**: Focus on **Flanders** (Flemish-speaking Belgium)
**Phase 2**: Expansion to **Wallonia** (French-speaking Belgium)  
**Phase 3**: Other European regions

**Implementation Notes:**
- Code already includes regional differentiation structure
- Building standards compliance varies by region
- Language localization planned (Dutch/French)

## Technical Specifications

### Infrastructure & Deployment
**Database Strategy:**
- **Development**: PostgreSQL (user's preferred choice)
- **Production**: PostgreSQL on DigitalOcean
- Note: User typically uses PostgreSQL consistently

**Deployment Platform:**
- **Preferred**: DigitalOcean for both frontend and backend
- Alternative consideration for frontend-only on Vercel
- Full-stack DigitalOcean deployment for unified management

**Current 3D Limitations:**
- Only rectangular shapes currently supported
- System considered "too abstract" for production use
- **Planned**: Standardized shapes with editable base sizings
- Future: More sophisticated 3D modeling capabilities

### Payment Strategy (TBD)
**Options Under Consideration:**
- Traditional payment gateways (Stripe, Mollie)
- **Invoice-based system**: Potentially preferred for B2B contractor payments
- Decision pending based on user feedback and regional preferences

### Testing Framework
**Recommended Approach:**
- **Vitest**: Modern, fast, Nuxt 3 native integration
- **Cypress**: Visual E2E testing (crucial for 3D interactions)
- **ESLint**: Relaxed rules to avoid development conflicts
- User admits to limited testing expertise - framework choice optimized for ease of use

### Browser & Performance
**Browser Support:**
- Modern browsers with WebGL support required
- Current 3D implementation needs performance optimization
- Target: Desktop-first, mobile responsive planned

**Performance Goals:**
- 3D rendering optimization priority
- Bundle size reduction planned
- Progressive loading for complex models

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow Vue 3 Composition API patterns
- Keep components small and focused
- Use composables for shared logic
- Prefer Tailwind classes over custom CSS

### Git Workflow
- Feature branches from `main`
- Descriptive commit messages
- PR reviews before merging
- Tag releases with semantic versioning

### Security Considerations
- Never commit secrets or API keys
- Use environment variables
- Validate all user inputs
- Sanitize data before display
- Implement proper CORS settings
- Use HTTPS in production

## Known Issues & Limitations

1. **3D Performance**: Complex models may lag on older devices
2. **Browser Support**: WebGL required for 3D visualization
3. **Offline Mode**: Currently requires internet connection
4. **Mobile Experience**: 3D builder optimized for desktop

## Support & Resources

- **Documentation**: This file and CLAUDE.md
- **Strapi Admin**: http://localhost:1337/admin
- **Vue DevTools**: Essential for debugging
- **Three.js Docs**: https://threejs.org/docs/

---

*Last Updated: September 2024*
*Version: 0.1.0 (Pre-production)*