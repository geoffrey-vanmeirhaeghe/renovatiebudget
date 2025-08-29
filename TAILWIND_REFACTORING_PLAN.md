# Tailwind CSS Refactoring Plan

## 📋 Overview

This document outlines the complete plan for refactoring the current custom CSS implementation to Tailwind CSS across the entire renovation platform frontend.

**Current Status**: Custom CSS with scoped styles  
**Target**: Tailwind CSS utility-first approach  
**Timeline**: 2-3 weeks (gradual implementation)

---

## 🎯 Phase 1: Setup & Configuration (Week 1, Day 1-2)

### Task 1.1: Install Tailwind CSS
```bash
npm install @nuxtjs/tailwindcss
```

### Task 1.2: Configure Nuxt
Add to `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  // ... other config
})
```

### Task 1.3: Create Tailwind Config
Create `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue"
  ],
  theme: {
    extend: {
      colors: {
        // Custom project colors
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        success: {
          500: '#059669',
          600: '#16a34a'
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706'
        },
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e0',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    }
  },
  plugins: []
}
```

### Task 1.4: Verification
Create a test component to verify Tailwind is working.

---

## 🏗️ Phase 2: Core Layout Refactoring (Week 1, Day 3-4)

### Task 2.1: Dashboard Container
**File**: `pages/dashboard.vue`

**Current**:
```css
.dashboard {
  flex: 1;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 1.5rem;
  box-sizing: border-box;
  min-width: 0;
}
```

**Target**:
```vue
<div class="flex-1 w-full max-w-7xl mx-auto p-6 box-border min-w-0">
```

### Task 2.2: Two-Column Layout
**Current**:
```css
.dashboard-content {
  display: flex;
  gap: 1.5rem;
  min-width: 0;
  width: 100%;
}
```

**Target**:
```vue
<div class="flex gap-6 min-w-0 w-full">
```

### Task 2.3: Left Column (Project Card)
**Current**:
```css
.left-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 0 0 300px;
  min-width: 0;
}
```

**Target**:
```vue
<div class="flex flex-col gap-6 flex-none w-75 min-w-0">
```

---

## 🎨 Phase 3: Project Card Component (Week 1, Day 5 - Week 2, Day 1)

### Task 3.1: Project Card Container
**Current**:
```css
.project-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid #e2e8f0;
}
```

**Target**:
```vue
<div class="bg-white rounded-lg p-4 shadow-sm flex flex-col gap-4 border border-gray-200">
```

### Task 3.2: Project Header
**Current**:
```css
.project-header-combined {
  text-align: center;
  padding-bottom: 0.5rem;
}
```

**Target**:
```vue
<div class="text-center pb-2">
```

### Task 3.3: 3D Model Preview
**Current**:
```css
.model-section-embedded {
  position: relative;
  min-height: 180px;
  border-radius: 6px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
```

**Target**:
```vue
<div class="relative min-h-45 rounded-md overflow-hidden bg-gray-50 border border-gray-200">
```

### Task 3.4: Stats Section
**Current**:
```css
.stats-compact {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
```

**Target**:
```vue
<div class="flex justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
```

### Task 3.5: Status & Progress
Map all status and progress bar styles to Tailwind utilities.

### Task 3.6: Buttons
Convert all button styles to Tailwind with proper hover states.

---

## 📊 Phase 4: Work Management Section (Week 2, Day 2-4)

### Task 4.1: Work Card Container
**Current**:
```css
.work-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
```

**Target**:
```vue
<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex-1 min-w-0 overflow-hidden">
```

### Task 4.2: Timeline Sections
Convert timeline structure and labels.

### Task 4.3: Work Items
**Priority**: High complexity due to multiple states (active, planned, future)

**Current states to convert**:
- `.work-item.active`
- `.work-item.planned` 
- `.work-item.future`

### Task 4.4: Phase Indicators
Convert the 7-dot phase progress indicators.

### Task 4.5: Progress Bars
Convert custom progress bar styles.

### Task 4.6: Action Buttons
Convert activate buttons and hover states.

---

## 📱 Phase 5: Responsive Design (Week 2, Day 5)

### Task 5.1: Mobile Breakpoints
**Current**:
```css
@media (max-width: 768px) {
  .dashboard-content {
    flex-direction: column;
    gap: 1rem;
  }
}
```

**Target**:
```vue
<div class="flex flex-col md:flex-row gap-4 md:gap-6">
```

### Task 5.2: Tablet Optimizations
Convert 1024px breakpoint styles to Tailwind `lg:` prefix.

### Task 5.3: Desktop Refinements
Ensure proper scaling on large screens.

---

## 🧹 Phase 6: Cleanup & Optimization (Week 3, Day 1)

### Task 6.1: Remove Custom CSS
- Delete all `<style scoped>` blocks
- Remove unused CSS imports
- Clean up component files

### Task 6.2: Optimize Bundle
- Configure Tailwind purging
- Remove unused utilities
- Verify bundle size reduction

### Task 6.3: Documentation Update
- Update component documentation
- Create style guide with Tailwind classes
- Document custom color palette

---

## 🔍 Component Priority Matrix

### High Priority (Week 1)
1. **Dashboard Layout** - Core structure
2. **Project Card** - Most visible component
3. **Responsive Layout** - Mobile usability

### Medium Priority (Week 2) 
4. **Work Management** - Complex but secondary
5. **Timeline Components** - Visual polish
6. **Interactive States** - User experience

### Low Priority (Week 3)
7. **Animations** - Enhancement
8. **Micro-interactions** - Polish
9. **Advanced Responsive** - Edge cases

---

## 🚨 Potential Challenges

### Challenge 1: Complex Work Item States
**Issue**: Multiple conditional classes for work states  
**Solution**: Create component variants or use Tailwind's arbitrary value syntax

### Challenge 2: Custom Progress Bars
**Issue**: Complex gradient fills and animations  
**Solution**: Custom Tailwind components or CSS-in-JS for complex cases

### Challenge 3: Phase Dot Indicators
**Issue**: 7-dot system with multiple states  
**Solution**: Component-based approach with Tailwind utilities

### Challenge 4: Hover States
**Issue**: Complex transform and shadow effects  
**Solution**: Tailwind's built-in hover: variants and custom shadow utilities

---

## ✅ Testing Checklist

### Visual Regression Testing
- [ ] Dashboard layout matches current design
- [ ] All interactive states work correctly
- [ ] Responsive design functions on all breakpoints
- [ ] Colors match existing brand palette

### Performance Testing
- [ ] Bundle size comparison (before/after)
- [ ] Initial load time impact
- [ ] Build time optimization

### Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## 📦 Deliverables

### Week 1
- ✅ Tailwind CSS installed and configured
- ✅ Core dashboard layout converted
- ✅ Project card component converted

### Week 2  
- ✅ Work management section converted
- ✅ All interactive states working
- ✅ Responsive design implemented

### Week 3
- ✅ All custom CSS removed
- ✅ Bundle optimized
- ✅ Documentation updated
- ✅ Testing completed

---

## 🔗 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Nuxt Tailwind Module](https://tailwindcss.nuxtjs.org/)
- [Tailwind UI Components](https://tailwindui.com/)
- [Headless UI Vue](https://headlessui.com/vue) (for complex components)

---

**Last Updated**: August 29, 2025  
**Next Review**: After Phase 1 completion

*This document should be updated as work progresses and new challenges or solutions are discovered.*