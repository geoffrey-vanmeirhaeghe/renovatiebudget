# Onboarding TODO List

## Critical Issues to Fix

### 1. **Fix Onboarding Project Save Functionality** 🚨
**Problem**: Onboarding creates a template project without ID, but user should have an existing project in Strapi.

**Current Issue**: 
- BuilderGuidePanel creates `{ name: 'My New House', ... }` without ID
- When saving, it tries to create new project instead of updating user's existing project
- Gets 404 error: `PUT http://localhost:1337/api/projects/onboarding-template 404 (Not Found)`

**Solution Needed**:
- Investigate if users get a project created during account registration
- Update BuilderGuidePanel to load and work with user's actual project from Strapi
- Ensure onboarding modifies existing project rather than creating template

### 2. **Investigate User Project Creation Flow**
**Questions to Answer**:
- When is a user's project created? (During registration? First builder visit?)
- What's the project ID structure?
- How should onboarding integrate with existing project workflow?

**Files to Check**:
- User registration flow
- `/pages/builder.vue` - existing project loading logic (line 367: `loadProject('ca66f5looy2mij5rua9yj987', true)`)
- Strapi backend project creation

### 3. **Update BuilderGuidePanel Integration**
**Current State**: ✅ UI improvements completed
- ✅ Combined positioning controls (Size + Position fields)  
- ✅ Immediate project loading
- ✅ Wider input fields (50px) for 3-digit values
- ✅ Fixed click interactions on dropdowns/inputs

**Remaining Work**:
- Replace template project creation with actual user project loading
- Update `createStandardProject()` to modify existing project instead of creating new one
- Ensure project updates properly sync with Strapi

### 4. **Test Complete Onboarding Flow**
**End-to-End Testing Needed**:
- New user registration → account setup → builder access
- Onboarding guide functionality with real project
- Project saving and persistence
- Transition from onboarding to full builder

## Technical Context

### Files Modified This Session:
- `/components/onboarding/BuilderGuidePanel.vue` - Main onboarding component
- `/pages/builder.vue` - Builder page with onboarding integration
- `/components/ui/CategoryButtons.vue` - Onboarding mode filtering

### Key Code Locations:
- **BuilderGuidePanel.vue:463** - `createStandardProject()` function (needs project loading instead)
- **builder.vue:334** - Onboarding detection logic (`userPhase === 'project-setup'`)
- **builder.vue:367** - Regular project loading (`loadProject('ca66f5looy2mij5rua9yj987', true)`)

### Current Project Structure:
```javascript
// Template project (WRONG - should use real user project)
{
  name: 'My New House',
  description: 'House design template for onboarding',
  generalAttributes: { propertySize, floorSize, region },
  floors: generateFloorsFromConfig(),
  roof: houseConfig.roofType ? generateRoofFromConfig() : null
}
```

## Next Steps Priority:
1. 🔥 **HIGH**: Fix project save functionality 
2. 🔥 **HIGH**: Understand user project creation workflow
3. 🟡 **MEDIUM**: Update onboarding to use real projects
4. 🟢 **LOW**: End-to-end testing and refinement

## Session Summary:
- ✅ Completed all UI/UX improvements for onboarding guide
- ❌ Discovered critical backend integration issue with project saving
- 📝 Documented technical debt for next session