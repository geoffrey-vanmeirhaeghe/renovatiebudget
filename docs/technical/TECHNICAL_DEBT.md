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

## 🌍 International Building Standards System

### **✅ Implemented: Runtime Unit Conversion**
- **Location**: `utils/unit-conversion.ts`, `constants/regional-standards.ts`, `composables/useBuildingStandards.ts`
- **Features**: 
  - All data stored internally in cm (Belgian standard)
  - Runtime conversion to display units (cm, inches, etc.)
  - Regional building standards (BE, NL, DE, FR, UK, US)
  - Backwards compatibility - existing Belgian code unchanged

### **🎯 Usage Examples**
```typescript
// Existing Belgian code continues to work unchanged
import { DIMENSION_RANGES } from '~/constants/building-standards' // Still works!

// New international features
const { setRegion, formatValue, getDisplayUnit } = useBuildingStandards()
setRegion('US') // Switch to US standards
formatValue(120) // "47.2 in" (converted from 120cm)
getDisplayUnit() // "in"

// Region-aware templates
const { getStandardFloorHeight } = useBuildingStandards()
getStandardFloorHeight() // 244cm (US) vs 270cm (BE)
```

### **🔧 Region Selector**
- **Location**: `components/ui/RegionSelector.vue`
- **Integration**: Added to PropertyPanel dev tools
- **Features**: Live region switching with immediate unit conversion

## 📋 Completed Items

### **🌍 International Building Standards** 
- **Runtime unit conversion system** - All data stays in cm, converts at display
- **Regional building standards** - 6 regions supported (BE, NL, DE, FR, UK, US)
- **Backwards compatibility** - Existing Belgian code unchanged
- **Region selector UI** - Easy switching between regions

---
*Last updated: 2025-08-12*