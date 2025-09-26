# Testing Guide for RenovatieBudget

This guide covers testing strategies, framework comparisons, and implementation recommendations for the RenovatieBudget platform.

## Testing Framework Comparison

### Overview
Since you mentioned you're not an expert in testing, here's a comparison of the main testing frameworks suitable for Nuxt 3/Vue 3 projects:

### 1. Vitest ⭐ **RECOMMENDED**

**What it is:** Modern, fast testing framework built specifically for Vite-based projects (which Nuxt 3 uses under the hood).

**Pros:**
- ✅ **Perfect for Nuxt 3**: Native integration, no configuration needed
- ✅ **Extremely Fast**: Uses Vite's dev server, instant feedback
- ✅ **Vue/Nuxt Aware**: Understands composables, components, auto-imports
- ✅ **Modern API**: Jest-compatible API but more modern
- ✅ **TypeScript First**: Excellent TypeScript support
- ✅ **Easy Setup**: Minimal configuration required

**Cons:**
- ❌ **Newer**: Smaller community compared to Jest
- ❌ **Learning Curve**: If team is familiar with Jest

**Best For:**
- Unit testing composables (`useRenovationWorks`, `useAuth`)
- Component testing (Vue components)
- Integration testing (API calls, state management)

**Why Choose Vitest:**
Since you're using Nuxt 3 and mentioned linting concerns, Vitest is the natural choice. It's designed specifically for modern Vue projects and requires minimal setup.

### 2. Jest

**What it is:** Industry-standard JavaScript testing framework.

**Pros:**
- ✅ **Mature**: Huge ecosystem, lots of resources
- ✅ **Community**: Extensive community and plugins
- ✅ **Documentation**: Comprehensive docs and tutorials
- ✅ **Mocking**: Powerful mocking capabilities

**Cons:**
- ❌ **Slower**: Requires compilation, slower than Vitest
- ❌ **Configuration**: More setup needed for Nuxt 3
- ❌ **ESM Issues**: Can be tricky with modern ES modules

**Best For:**
- Teams already familiar with Jest
- Projects requiring extensive mocking

### 3. Cypress ⭐ **RECOMMENDED FOR E2E**

**What it is:** End-to-end testing framework that runs tests in a real browser.

**Pros:**
- ✅ **Real Browser**: Tests actual user interactions
- ✅ **Visual**: See tests running in real-time
- ✅ **Developer Experience**: Excellent debugging tools
- ✅ **Time Travel**: Step through test execution
- ✅ **Screenshots/Videos**: Automatic failure documentation

**Best For:**
- Testing complete user journeys (onboarding → builder → dashboard)
- 3D interactions and visual elements
- Cross-browser compatibility

**Why Choose Cypress:**
For a visual application like yours with 3D elements, Cypress is invaluable for testing the actual user experience.

### 4. Playwright

**What it is:** Microsoft's modern E2E testing framework.

**Pros:**
- ✅ **Fast**: Faster than Cypress for large test suites
- ✅ **Multiple Browsers**: Chrome, Firefox, Safari support
- ✅ **Parallel**: Built-in parallel execution

**Cons:**
- ❌ **Less Visual**: Not as developer-friendly as Cypress
- ❌ **Newer**: Smaller ecosystem

## Recommended Testing Strategy

### Phase 1: Start Simple (Immediate)
```bash
# Install Vitest
npm install --save-dev vitest @vue/test-utils happy-dom

# Install Cypress for E2E
npm install --save-dev cypress
```

### Phase 2: Testing Pyramid

#### 1. Unit Tests (Vitest) - 70%
**Focus:** Individual functions and composables
- `useRenovationWorks` composable logic
- `useAuth` authentication flows  
- `useProject` data transformations
- Utility functions (geometry calculations)

**Example:**
```typescript
// tests/composables/useRenovationWorks.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useRenovationWorks } from '~/composables/useRenovationWorks'

describe('useRenovationWorks', () => {
  it('should calculate total budget correctly', () => {
    const { totalBudget } = useRenovationWorks()
    // Test implementation
  })
})
```

#### 2. Component Tests (Vitest + Vue Test Utils) - 20%
**Focus:** Vue component behavior
- Form submissions (CreateWorkModal)
- User interactions (WorkActivationToggle)
- Data display (PropertyPanel)

**Example:**
```typescript
// tests/components/CreateWorkModal.test.ts
import { mount } from '@vue/test-utils'
import CreateWorkModal from '~/components/modals/CreateWorkModal.vue'

describe('CreateWorkModal', () => {
  it('should emit work creation on form submit', async () => {
    const wrapper = mount(CreateWorkModal)
    // Test component behavior
  })
})
```

#### 3. Integration Tests (Vitest) - 8%
**Focus:** API integration and data flow
- Strapi API calls
- Data transformations
- State synchronization

#### 4. E2E Tests (Cypress) - 2%
**Focus:** Critical user journeys
- User registration and onboarding
- 3D builder functionality
- Dashboard work management

**Example:**
```typescript
// cypress/e2e/onboarding.cy.ts
describe('User Onboarding', () => {
  it('should complete onboarding flow', () => {
    cy.visit('/auth/register')
    cy.get('[data-cy=email-input]').type('test@example.com')
    cy.get('[data-cy=password-input]').type('password123')
    cy.get('[data-cy=register-button]').click()
    cy.url().should('include', '/onboarding')
  })
})
```

## Implementation Plan

### Step 1: Package Configuration

**package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:e2e": "cypress open",
    "test:e2e:ci": "cypress run"
  }
}
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './')
    }
  }
})
```

### Step 2: Essential Tests to Start With

1. **`useRenovationWorks` composable** - Core business logic
2. **`useAuth` authentication flow** - Critical user journey
3. **3D geometry calculations** - Complex mathematical functions
4. **Strapi data transformations** - Data integrity

### Step 3: Test Organization

```
tests/
├── unit/
│   ├── composables/
│   │   ├── useRenovationWorks.test.ts
│   │   ├── useAuth.test.ts
│   │   └── useProject.test.ts
│   └── utils/
│       └── geometry.test.ts
├── components/
│   ├── modals/
│   │   └── CreateWorkModal.test.ts
│   └── ui/
│       └── WorkActivationToggle.test.ts
├── integration/
│   └── strapi-sync.test.ts
└── fixtures/
    ├── mockProject.ts
    └── mockRenovationWork.ts

cypress/
├── e2e/
│   ├── onboarding.cy.ts
│   ├── builder.cy.ts
│   └── dashboard.cy.ts
├── fixtures/
└── support/
```

## CI/CD Integration (Why You'd Want It)

### What is CI/CD?
**Continuous Integration/Continuous Deployment** - Automated processes that run when you push code.

### Why It Matters for You:
1. **Automatic Testing**: Tests run on every code change
2. **Catch Bugs Early**: Find issues before users see them
3. **Deployment Automation**: No manual deployment steps
4. **Collaboration**: Safe for multiple developers

### Simple GitHub Actions Setup:
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e:ci
```

### Benefits:
- **Peace of Mind**: Know your changes don't break anything
- **Professional**: Industry standard practice
- **Scaling**: Essential when working with contractors or team members

## Linting Setup (Addressing Your Concern)

Since you mentioned concerns about linting conflicts:

### ESLint + Prettier Configuration
```bash
npm install --save-dev eslint @nuxt/eslint-config prettier eslint-config-prettier
```

**eslint.config.js:**
```javascript
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    typescript: true,
    vue: true
  }
}).append({
  rules: {
    // Relaxed rules to avoid conflicts
    '@typescript-eslint/no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off',
    'no-console': 'off' // Allow console.log for debugging
  }
})
```

**Benefits:**
- **Consistency**: Same code style across the project
- **Error Prevention**: Catch common mistakes
- **IDE Integration**: Real-time feedback
- **Team Collaboration**: Uniform code when working with others

## Quick Start Recommendations

### For Immediate Implementation:
1. **Start with Vitest** for composable testing
2. **Add basic E2E with Cypress** for critical flows
3. **Set up simple linting** with relaxed rules
4. **Test one composable thoroughly** as a template

### Priority Testing Areas:
1. **Renovation Works Logic** - Business critical
2. **Authentication Flow** - Security critical
3. **3D Geometry Functions** - Complex logic
4. **Strapi Integration** - Data integrity

### When to Expand:
- **Component tests**: When UI becomes more complex
- **Performance tests**: When 3D models get larger
- **Accessibility tests**: Before public launch
- **Load tests**: When expecting high traffic

## Resources for Learning

### Vitest:
- [Official Docs](https://vitest.dev/)
- [Testing Composables Guide](https://vitest.dev/guide/testing-types.html#testing-composables)

### Cypress:
- [Official Docs](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)

### Vue Testing:
- [Vue Test Utils](https://vue-test-utils.vuejs.org/)
- [Nuxt Testing Guide](https://nuxt.com/docs/getting-started/testing)

---

**Remember:** Start small, test what matters most, and build confidence gradually. Testing should make development easier, not harder!

*Last Updated: September 2024*