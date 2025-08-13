# Selection Fix Verification Test

## Test Steps:

### Testing with Strapi Data:
1. Load the app (should load Strapi data by default)
2. Click on a floor (should turn orange)
3. Click on a window (window should turn orange, floor should return to default color)
4. Verify selection switching works correctly

### Testing with Mock Data:
1. Modify pages/index.vue to load mock data instead
2. Repeat the same test steps
3. Verify selection switching works correctly

## Expected Results:
- Both Strapi and Mock data should behave identically
- Selection should switch properly between floors and windows/doors
- No objects should remain selected when a different object is clicked

## Technical Details:
The fix normalizes all IDs to strings in both the selection functions and comparison logic, ensuring consistent behavior regardless of whether Vue's v-for returns string keys (mock data) or numeric indices (Strapi data).