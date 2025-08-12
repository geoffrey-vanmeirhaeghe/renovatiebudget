# Technical Debt & Build Optimizations

This file tracks technical debt, TODOs, and build optimizations that need to be addressed.

## 🔧 Technical Debt Items

### High Priority
- [ ] **Project Selection**: Hard-coded project documentId needs dynamic selection UI
  - File: `pages/index.vue`
  - Current: Uses hard-coded `'ca66f5looy2mij5rua9yj987'`
  - TODO: Add project picker dropdown or user project list
  - Impact: Users can't switch between projects

### Medium Priority
- [ ] **User Authentication**: Add user login/logout functionality
  - Location: New auth system needed
  - TODO: Integrate with Strapi user system for multi-tenant support

- [ ] **Data Persistence**: Save property changes back to Strapi
  - Location: `composables/useStrapi.ts`
  - TODO: Implement reverse transformation and PATCH endpoints

- [ ] **Error Handling**: Improve error boundaries and user feedback
  - Location: Throughout Strapi integration
  - TODO: Add proper error states and retry mechanisms

- [ ] **Performance**: Optimize 3D rendering performance
  - Location: `components/renderings/house.vue`
  - TODO: Implement LOD (Level of Detail) for complex models

### Low Priority
- [ ] **Code Comments**: Add JSDoc comments to public API functions
  - Location: All composables
  - TODO: Document parameters and return types

## 🏗️ Build Optimizations

### Bundling
- [ ] **Tree Shaking**: Optimize bundle size by removing unused imports
- [ ] **Code Splitting**: Implement dynamic imports for heavy components
- [ ] **Asset Optimization**: Compress 3D models and textures

### Development Experience
- [ ] **Type Safety**: Add stricter TypeScript configs
- [ ] **Linting**: Set up pre-commit hooks with ESLint/Prettier
- [ ] **Testing**: Add unit tests for critical business logic

## 📋 Completed Items

*(Items will be moved here when completed)*

---
*Last updated: 2025-08-12*