# FLAVORCRAFT — SYSTEM AUDIT & DEBUG REPORT

**Audit Date**: September 25, 2026  
**Status**: Comprehensive Full-Stack Audit Completed  
**Technology Stack**: React.js (Vite), Tailwind CSS, Framer Motion, Lucide React, Express.js, MongoDB Atlas (Mongoose), JWT, bcryptjs.

---

## AUDIT MATRIX OF SUBSYSTEMS & DATA STRUCTURE MISMATCHES

### 1. Canonical Recipe Data Model & Contract
- **Frontend Implementation**: `RecipeCard.jsx`, `RecipeDetailPage.jsx`, `CookingModeModal.jsx` referenced legacy fields `prepTime`, `cookTime`, `averageRating`, `caloriesPerServing`, `step.instruction`, and `item.ingredient`.
- **Backend Implementation**: `Recipe.js` schema and `recipeController.js` use canonical fields `prepTimeMinutes`, `cookTimeMinutes`, `rating`, `reviewCount`, `nutrition.calories`, `step.description`, `step.timerMinutes`, and `ingredients[].ingredientId`.
- **Mismatch**: Missing fields causing `undefined` times, missing instruction descriptions, and broken nutrition macros on detail views.
- **Root Cause**: Evolution of backend schema without standardizing frontend consumption points.
- **Files Requiring Modification**:
  - `backend/models/Recipe.js`
  - `backend/controllers/recipeController.js`
  - `frontend/src/components/recipe/RecipeCard.jsx`
  - `frontend/src/pages/RecipeDetailPage.jsx`
  - `frontend/src/components/recipe/CookingModeModal.jsx`
  - `frontend/src/pages/RecipeFormPage.jsx`
- **Fix Applied**: Established single canonical contract across backend and frontend, unified response formatter, and standardized field mappings.
- **Verification Result**: PASS — Details, times, ingredients, and instructions render correctly.

---

### 2. Recipe Image Uniqueness & Visual Matching
- **Frontend Implementation**: Renders `recipe.imageUrl` directly.
- **Backend Implementation**: `seed.js` contains 32 curated recipes, but several Indian regional dishes shared duplicate image URLs (e.g. `Dal Makhani`, `Egg Curry`, `Fish Curry`, `Tadka Dal`, `Palak Paneer`, `Aloo Gobi`, `Sambar`, `Chole`, `Rajma`).
- **Mismatch**: Dishes showed images of completely different foods (e.g., Sambar showing Palak Paneer).
- **Root Cause**: Copy-pasting placeholder Unsplash URLs during initial seed data creation.
- **Files Requiring Modification**: `backend/seed.js`
- **Fix Applied**: Assigned authentic, unique, high-resolution food image URLs for every single recipe in the catalog and re-seeded MongoDB.
- **Verification Result**: PASS — All 32 recipes have distinct, authentic visual representation.

---

### 3. Recipe Matching Engine & Scoring Rules
- **Frontend Implementation**: `RecipeMatcherPage.jsx` and `IngredientPicker.jsx`.
- **Backend Implementation**: `backend/utils/recipeMatcher.js` and `recipeController.js`.
- **Mismatch**: Optional ingredients previously contributed an arbitrary +5% bonus, and empty input handling needed strict compliance with Rules 1-6.
- **Root Cause**: Non-canonical scoring logic with optional bonus inflating scores over 100%.
- **Files Requiring Modification**:
  - `backend/utils/recipeMatcher.js`
  - `backend/controllers/recipeController.js`
  - `frontend/src/pages/RecipeMatcherPage.jsx`
  - `frontend/src/pages/HomePage.jsx`
- **Fix Applied**: 
  - Rule 1: No ingredients selected returns `[]` with message.
  - Rule 2: No matching ingredients returns `[]`.
  - Rule 3: Optional ingredients do NOT add bonus; score is derived strictly from required ingredient weights `(matched_req_wt / total_req_wt) * 100`.
  - Rule 4: Match percentage clamped `0-100`.
  - Rule 5: 100% when all required ingredients are present.
  - Rule 6: Backend calculates all match percentages and returns canonical `matchedIngredients` and `missingIngredients`.
  - Fixed HomePage `'Eggs'` vs database `'Egg'` name resolution.
- **Verification Result**: PASS — Match percentages and missing ingredient lists are exact and deterministic.

---

### 4. Grocery List Purchased State & Data Persistence
- **Frontend Implementation**: `frontend/src/pages/GroceryListPage.jsx` used `item.isPurchased`.
- **Backend Implementation**: `backend/models/GroceryList.js` & `groceryController.js` stored `purchased: Boolean`.
- **Mismatch**: Checking items as purchased failed to persist or clear because frontend toggled `isPurchased` while backend saved `purchased`.
- **Root Cause**: Variable naming discrepancy (`purchased` vs `isPurchased`).
- **Files Requiring Modification**:
  - `frontend/src/pages/GroceryListPage.jsx`
  - `frontend/src/services/groceryService.js`
  - `backend/controllers/groceryController.js`
- **Fix Applied**: Standardized to `purchased` across the entire stack.
- **Verification Result**: PASS — State persists across reloads, toggles correctly, and clears purchased items cleanly.

---

### 5. Meal Planner 4-Meal Slot Schema & Grocery Aggregation
- **Frontend Implementation**: `MealPlannerPage.jsx` supported Breakfast, Lunch, Dinner, and Snack.
- **Backend Implementation**: `backend/models/MealPlan.js` only defined `breakfast`, `lunch`, `dinner`.
- **Mismatch**: Adding a meal to `snack` slot was dropped or rejected by the database schema.
- **Root Cause**: Schema omitted the `snack` slot field.
- **Files Requiring Modification**:
  - `backend/models/MealPlan.js`
  - `backend/controllers/mealPlanController.js`
  - `frontend/src/pages/MealPlannerPage.jsx`
- **Fix Applied**: Added `snack` slot to `mealSlotSchema`, implemented server-side batch grocery aggregation endpoint `POST /api/mealplan/generate-grocery`.
- **Verification Result**: PASS — All 4 slots function seamlessly and generate combined grocery items.

---

### 6. User Profile `bio` & Author Filter for Recipes
- **Frontend Implementation**: `ProfilePage.jsx` had a `bio` textarea and queried `recipes?author=userId`.
- **Backend Implementation**: `User.js` had no `bio` field, and `recipeController.js` did not filter by `createdBy`.
- **Mismatch**: Profile bio edits were lost upon refresh, and "My Recipes" listed all recipes.
- **Root Cause**: Missing schema attribute and missing query filter logic.
- **Files Requiring Modification**:
  - `backend/models/User.js`
  - `backend/controllers/authController.js`
  - `backend/controllers/recipeController.js`
  - `backend/routes/recipeRoutes.js`
- **Fix Applied**: Added `bio` to User model and profile update handler; added `author` / `createdBy` filter to `getRecipes`; allowed authenticated users to create/edit recipes.
- **Verification Result**: PASS — Bio persists and author-specific recipes filter accurately.

---

### 7. Reviews Population & Average Rating Recalculation
- **Frontend Implementation**: `RecipeDetailPage.jsx` expected `review.user.name`.
- **Backend Implementation**: `Review.js` populated `userId`.
- **Mismatch**: Reviewer names showed `Anonymous` or threw errors.
- **Root Cause**: Field key mismatch (`userId` vs `user`).
- **Files Requiring Modification**:
  - `backend/controllers/reviewController.js`
  - `frontend/src/pages/RecipeDetailPage.jsx`
- **Fix Applied**: Populated both `userId` and formatted response with `user: { name, avatar }`, automatically updating recipe rating and reviewCount on review creation/deletion.
- **Verification Result**: PASS — Author names, star ratings, and aggregate rating updates work seamlessly.

---

### 8. Admin Ingredient Categories Alignment
- **Frontend Implementation**: `AdminPage.jsx` ingredient category dropdown used ad-hoc values (`Meat & Seafood`, `Grains & Pasta`, `Herbs & Spices`).
- **Backend Implementation**: `Ingredient.js` model enum restricted values to `['Produce', 'Vegetables', 'Fruits', 'Protein', 'Dairy', 'Grains', 'Pantry', 'Spices']`.
- **Mismatch**: Admin ingredient additions failed validation with 400/500 errors.
- **Root Cause**: Category options in frontend did not match MongoDB schema enum.
- **Files Requiring Modification**: `frontend/src/pages/AdminPage.jsx`
- **Fix Applied**: Aligned frontend categories to match the MongoDB enum exactly.
- **Verification Result**: PASS — Ingredient creation and updates in Admin panel succeed consistently.

---

### 9. User Data Isolation & Security
- **Frontend Implementation**: Sends Bearer JWT in Axios headers.
- **Backend Implementation**: Verified all private routes (`/api/inventory`, `/api/grocery`, `/api/mealplan`, `/api/favorites`, `/api/reviews`) rely exclusively on `req.user._id`.
- **Mismatch / Risk**: Potential data leakage if `userId` was accepted from request body/params.
- **Root Cause**: Strict auditing to ensure no endpoint trusts client-supplied user IDs.
- **Files Requiring Modification**:
  - `backend/controllers/inventoryController.js`
  - `backend/controllers/groceryController.js`
  - `backend/controllers/mealPlanController.js`
  - `backend/controllers/favoriteController.js`
- **Fix Applied**: Enforced `req.user._id` across all queries and mutations.
- **Verification Result**: PASS — Multi-user isolation tests confirm zero data leakage between user sessions.
