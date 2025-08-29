# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the frontend component of a comprehensive renovation platform targeting the Belgian market. The platform connects homeowners with contractors while providing project management tools and burden relief for both parties throughout the renovation process.

### Platform Vision
- **For Homeowners**: Project planning, process tracking, document management, contractor matching, technical guidance, and cost insights
- **For Contractors**: Job opportunities, offer management, project management tools, review system, communication tools, and administrative burden relief
- **Core Value**: Reducing complexity and administrative overhead for both parties while ensuring proper documentation, trusted connections, and informed decision-making

### Current Repository Scope
This Nuxt 3 frontend currently focuses on 3D house visualization but will expand to include the full platform interface for project management, contractor interactions, and renovation planning tools.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server on http://localhost:3000
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Generate static site
npm run generate
```

## Architecture

### Current Tech Stack
- **Nuxt 3**: Vue.js framework with SSR/SSG capabilities
- **TresJS**: Three.js integration for 3D house visualization
- **Three.js**: 3D graphics rendering
- **Vue 3**: Frontend framework

### External Dependencies
- **Strapi Backend**: Separate repository containing the CMS/API layer for user management, project data, contractor profiles, and document storage

### Current Structure
- `app.vue`: Main application entry point with hardcoded project data
- `components/renderings/house.vue`: 3D house visualization component
- `scripts/main.js`: 3D positioning and sizing utilities
- `scripts/customThree.js`: Custom Three.js geometry functions (roof generation)

### 3D Visualization System
The house visualization uses structured data representing:
- **generalAttributes**: Property dimensions and constraints
- **floors**: Multi-story configuration with architectural elements
- **roof**: Roof geometry and positioning

Key rendering functions:
- `calcOffsetPosition()`: Converts 2D floor plans to 3D coordinates
- `calcOffsetSize()`: Calculates 3D dimensions based on wall orientation
- `customThreeCreateRoof()`: Generates roof geometry using Three.js

## Development Context

### Belgian Market Focus
- Building regulations and standards should align with Belgian construction practices
- UI/UX should consider local renovation workflows and contractor relationships
- Future localization will be needed for Dutch/French language support

### Platform Integration Points
- User authentication and project data will come from Strapi backend
- 3D visualizations should integrate with project planning and cost estimation features
- Dual-sided project management tools for both homeowners and contractors
- Communication and documentation systems to reduce administrative burden

### Future Expansion Areas
- Project management dashboard for both user types
- Contractor profile, offer management, and review system
- Document management and dispute resolution
- Cost estimation and budget tracking
- Technical guidance and building process education
- Administrative workflow automation for contractors

## Specialized Agents

### 3d-expert
**Description**: Specialized in 3D visualization, Three.js/TresJS optimization, and architectural rendering
**Tools**: Read, Edit, Glob, Grep, Bash
**Use when**: Working on 3D rendering issues, geometry calculations, performance optimization, or visual bugs
**Auto-launch triggers**: roof, scaling, 3D positioning, Three.js errors, geometry, wireframe, rendering
**Examples**: "Fix roof positioning", "Optimize 3D scaling", "Debug wireframe rendering"

### ui-designer  
**Description**: Focuses on Vue components, user interface design, and interactive controls
**Tools**: Read, Edit, Glob, Grep
**Use when**: Creating or modifying UI components, property panels, or user interactions
**Auto-launch triggers**: UI, component, styling, hover, click, panel, button, form, layout
**Examples**: "Design property panel controls", "Add hover states", "Improve component styling"

### belgian-construction-expert
**Description**: Understands Belgian building standards, construction practices, and renovation workflows
**Tools**: Read, WebSearch, WebFetch
**Use when**: Validating building dimensions, understanding construction requirements, or market-specific features
**Auto-launch triggers**: Belgian, standards, building regulations, construction, dimensions, validation
**Examples**: "Validate window size standards", "Research Belgian roofing practices", "Check building regulations"

### full-stack-architect
**Description**: Handles complex system design, API integration, and overall architecture decisions
**Tools**: *
**Use when**: Major architectural changes, backend integration planning, or multi-component features
**Auto-launch triggers**: architecture, integration, Strapi, backend, API, system design, database
**Examples**: "Plan Strapi integration", "Design user authentication flow", "Architect contractor management system"

### performance-optimizer
**Description**: Specializes in build optimization, bundle analysis, and performance improvements
**Tools**: Bash, Read, Edit, Glob
**Use when**: Addressing performance issues, optimizing builds, or analyzing bundle size
**Auto-launch triggers**: performance, slow, optimization, bundle, build time, memory, speed
**Examples**: "Optimize build time", "Reduce bundle size", "Fix memory leaks"

### backend-integration-expert
**Description**: Specializes in Strapi CMS, API integration, authentication, and multi-repo development workflows
**Tools**: Bash, Read, Edit, WebSearch, WebFetch
**Use when**: Setting up Strapi, API integration, authentication flows, database modeling, or multi-repository challenges
**Auto-launch triggers**: Strapi, API, backend, authentication, database, auth, JWT, integration, multi-repo
**Examples**: "Set up Strapi content types", "Implement JWT authentication", "Configure API endpoints"

### diy-renovation-expert
**Description**: Understands the consumer/DIY perspective on home renovations, focusing on practical steps, common challenges, and real-world DIY workflows
**Tools**: Read, WebSearch, WebFetch
**Use when**: Designing user flows for DIY renovators, understanding consumer renovation journeys, or planning DIY-focused features
**Auto-launch triggers**: DIY, consumer, homeowner, renovation journey, DIY workflow, consumer perspective, home renovation
**Examples**: "Map typical DIY renovation steps", "Understand consumer renovation challenges", "Design DIY-friendly workflows"