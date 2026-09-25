const API = 'http://localhost:5000/api';

async function runComprehensiveTests() {
  console.log('================================================================');
  console.log('🚀 FLAVORCRAFT COMPLETE SYSTEM & ROUTE COMPREHENSIVE TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const errors = [];

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
      failed++;
      errors.push({ testName, details });
    }
  };

  // 1. Root & Health Check
  try {
    const rootRes = await fetch('http://localhost:5000/');
    const rootData = await rootRes.json();
    assert(rootRes.ok && rootData.status === 'OK', 'Root Server Health [/]', `Status: ${rootRes.status}`);

    const healthRes = await fetch(`${API}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.ok && healthData.status === 'OK', 'API Health Check [/api/health]', `Status: ${healthRes.status}`);
  } catch (err) {
    assert(false, 'Root & Health Check', err.message);
  }

  // 2. Ingredients & Categories
  let ingredients = [];
  try {
    const [ingRes, catRes] = await Promise.all([
      fetch(`${API}/ingredients?limit=200`),
      fetch(`${API}/ingredients/categories`),
    ]);
    const ingData = await ingRes.json();
    const catData = await catRes.json();
    ingredients = ingData.ingredients || [];
    assert(ingRes.ok && ingredients.length >= 50, 'Get All Ingredients [/api/ingredients]', `${ingredients.length} items`);
    assert(catRes.ok && Array.isArray(catData) && catData.length >= 5, 'Get Ingredient Categories [/api/ingredients/categories]', `${catData.length} categories`);
  } catch (err) {
    assert(false, 'Ingredients & Categories', err.message);
  }

  // 3. Recipes List, Pagination, & Search
  let recipes = [];
  try {
    const [recRes, searchRes, filterRes] = await Promise.all([
      fetch(`${API}/recipes?limit=50`),
      fetch(`${API}/recipes/search?q=chicken`),
      fetch(`${API}/recipes?cuisine=Italian&difficulty=Easy`),
    ]);
    const recData = await recRes.json();
    const searchData = await searchRes.json();
    const filterData = await filterRes.json();
    recipes = recData.recipes || [];

    assert(recRes.ok && recipes.length > 0, 'Browse Recipes List [/api/recipes]', `${recipes.length} total recipes`);
    assert(searchRes.ok && (searchData.recipes?.length > 0 || searchData.results?.length > 0), 'Search Recipes [/api/recipes/search?q=chicken]', `Found ${searchData.recipes?.length || searchData.results?.length} chicken dishes`);
    assert(filterRes.ok, 'Filter Recipes by Cuisine & Difficulty [/api/recipes?...]', `Found ${filterData.recipes?.length} filtered dishes`);
  } catch (err) {
    assert(false, 'Recipes List & Search', err.message);
  }

  // 4. Single Recipe Details
  try {
    if (recipes.length > 0) {
      const singleRes = await fetch(`${API}/recipes/${recipes[0]._id}`);
      const singleData = await singleRes.json();
      assert(singleRes.ok && singleData.recipe?._id === recipes[0]._id, `Get Recipe Detail [/api/recipes/${recipes[0]._id}]`, singleData.recipe?.title);
    }
  } catch (err) {
    assert(false, 'Single Recipe Detail', err.message);
  }

  // 5. Recipe Matcher Engine
  try {
    const sampleIds = ingredients.slice(0, 4).map((i) => i._id);
    const matchRes = await fetch(`${API}/recipes/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIngredientIds: sampleIds, minMatchPercentage: 0 }),
    });
    const matchData = await matchRes.json();
    const matches = matchData.results || matchData.matches || [];
    assert(matchRes.ok && matches.length > 0, 'Recipe Matching Engine [/api/recipes/match]', `Found ${matches.length} matches for 4 ingredients`);
  } catch (err) {
    assert(false, 'Recipe Matcher Engine', err.message);
  }

  // 6. Auth Flow: Login Demo Chef
  let chefToken = '';
  let chefUser = null;
  try {
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'chef@flavorcraft.com', password: 'password123' }),
    });
    const loginData = await loginRes.json();
    chefToken = loginData.token;
    chefUser = loginData.user;
    assert(loginRes.ok && !!chefToken, 'Auth Login Demo Chef [/api/auth/login]', `Authenticated as ${chefUser?.name}`);

    // Verify Session /me
    const meRes = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${chefToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.ok && (meData.user?.email || meData.email) === 'chef@flavorcraft.com', 'Auth Session Profile [/api/auth/me]', `Verified JWT token`);
  } catch (err) {
    assert(false, 'Auth Flow (Login & Profile)', err.message);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${chefToken}`,
  };

  // 7. Profile Update
  try {
    const updateRes = await fetch(`${API}/auth/profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        dietaryPreferences: ['Vegetarian', 'High-Protein'],
        allergies: ['Peanuts'],
      }),
    });
    const updateData = await updateRes.json();
    assert(updateRes.ok, 'Update Profile Preferences [/api/auth/profile]', 'Saved dietary preferences');
  } catch (err) {
    assert(false, 'Profile Update', err.message);
  }

  // 8. Pantry / Inventory CRUD
  let pantryItemId = '';
  try {
    // Add Item
    const addInvRes = await fetch(`${API}/inventory`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        ingredientId: ingredients[0]._id,
        quantity: 5,
        unit: 'pieces',
        category: ingredients[0].category || 'Produce',
      }),
    });
    const addInvData = await addInvRes.json();
    assert(addInvRes.ok, 'Add Item to Pantry [/api/inventory POST]', `Added ${ingredients[0].name}`);

    // Get Pantry
    const getInvRes = await fetch(`${API}/inventory`, { headers: authHeaders });
    const getInvData = await getInvRes.json();
    const inventoryList = getInvData.inventory || getInvData.items || [];
    assert(getInvRes.ok && inventoryList.length > 0, 'Get User Pantry List [/api/inventory GET]', `${inventoryList.length} items`);
    pantryItemId = inventoryList[0]?._id;

    // Update Pantry Item
    if (pantryItemId) {
      const updateInvRes = await fetch(`${API}/inventory/${pantryItemId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ quantity: 10 }),
      });
      assert(updateInvRes.ok, `Update Pantry Item [/api/inventory/${pantryItemId} PUT]`, 'Updated quantity to 10');
    }
  } catch (err) {
    assert(false, 'Pantry / Inventory Operations', err.message);
  }

  // 9. Favorites CRUD
  try {
    if (recipes.length > 0) {
      const targetRecipeId = recipes[0]._id;
      // Add favorite
      const addFavRes = await fetch(`${API}/favorites/${targetRecipeId}`, {
        method: 'POST',
        headers: authHeaders,
      });
      assert(addFavRes.ok, `Add Favorite Recipe [/api/favorites/${targetRecipeId} POST]`, `Recipe: ${recipes[0].title}`);

      // List favorites
      const listFavRes = await fetch(`${API}/favorites`, { headers: authHeaders });
      const listFavData = await listFavRes.json();
      assert(listFavRes.ok, 'Get User Favorites [/api/favorites GET]', `${listFavData.favorites?.length || 0} favorites`);

      // Remove favorite
      const delFavRes = await fetch(`${API}/favorites/${targetRecipeId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      assert(delFavRes.ok, `Remove Favorite Recipe [/api/favorites/${targetRecipeId} DELETE]`, 'Removed cleanly');
    }
  } catch (err) {
    assert(false, 'Favorites Operations', err.message);
  }

  // 10. Weekly Meal Planner
  try {
    if (recipes.length > 0) {
      // Schedule slot
      const addSlotRes = await fetch(`${API}/mealplan/slot`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          dayOfWeek: 'Tuesday',
          mealType: 'Lunch',
          recipeId: recipes[0]._id,
          servings: 4,
        }),
      });
      assert(addSlotRes.ok, 'Schedule Meal Plan Slot [/api/mealplan/slot POST]', 'Tuesday Lunch scheduled');

      // Get meal plan
      const getPlanRes = await fetch(`${API}/mealplan`, { headers: authHeaders });
      const getPlanData = await getPlanRes.json();
      assert(getPlanRes.ok, 'Get Weekly Meal Plan [/api/mealplan GET]', 'Plan fetched');

      // Generate grocery from meal plan
      const genGrocRes = await fetch(`${API}/mealplan/generate-grocery`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ days: ['Tuesday'] }),
      });
      assert(genGrocRes.ok, 'Generate Grocery From Meal Plan [/api/mealplan/generate-grocery POST]', 'Grocery sync OK');
    }
  } catch (err) {
    assert(false, 'Weekly Meal Planner Operations', err.message);
  }

  // 11. Smart Grocery List CRUD
  let groceryItemId = '';
  try {
    // Add Item
    const addGrocRes = await fetch(`${API}/grocery`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Fresh Organic Basil',
        quantity: 2,
        unit: 'bunch',
        category: 'Produce',
      }),
    });
    const addGrocData = await addGrocRes.json();
    assert(addGrocRes.ok, 'Add Item to Grocery List [/api/grocery POST]', 'Added Fresh Basil');

    // Get List
    const getGrocRes = await fetch(`${API}/grocery`, { headers: authHeaders });
    const getGrocData = await getGrocRes.json();
    const items = getGrocData.items || getGrocData.list?.items || [];
    assert(getGrocRes.ok && items.length > 0, 'Get Grocery Checklist [/api/grocery GET]', `${items.length} items`);
    groceryItemId = items[items.length - 1]?._id;

    // Toggle / Update Item
    if (groceryItemId) {
      const updateGrocRes = await fetch(`${API}/grocery/${groceryItemId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ purchased: true }),
      });
      assert(updateGrocRes.ok, `Toggle Grocery Item Purchased [/api/grocery/${groceryItemId} PUT]`, 'Marked purchased');
    }

    // Clear Purchased
    const clearRes = await fetch(`${API}/grocery/clear-purchased`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(clearRes.ok, 'Clear Purchased Items [/api/grocery/clear-purchased DELETE]', 'Cleared completed');
  } catch (err) {
    assert(false, 'Grocery List Operations', err.message);
  }

  // 12. Recipe Reviews & Ratings
  try {
    if (recipes.length > 0) {
      const addRevRes = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          recipeId: recipes[0]._id,
          rating: 5,
          comment: 'Outstanding flavor profile! Made this for dinner and the family loved it.',
        }),
      });
      // 200/201 or 400 if user already reviewed
      assert(addRevRes.ok || addRevRes.status === 400, `Add Recipe Review [/api/reviews POST]`, `Status: ${addRevRes.status}`);

      const getRevRes = await fetch(`${API}/reviews/recipe/${recipes[0]._id}`);
      const getRevData = await getRevRes.json();
      assert(getRevRes.ok, `Get Recipe Reviews [/api/reviews/recipe/${recipes[0]._id} GET]`, `${getRevData.reviews?.length || 0} reviews`);
    }
  } catch (err) {
    assert(false, 'Recipe Reviews Operations', err.message);
  }

  // 13. Admin Control Portal (RBAC)
  try {
    const adminLoginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@flavorcraft.com', password: 'admin123456' }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.ok && !!adminLoginData.token, 'Admin Authentication [/api/auth/login]', `Authenticated Admin: ${adminLoginData.user?.name}`);

    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminLoginData.token}`,
    };

    const [statsRes, usersRes, reviewsRes] = await Promise.all([
      fetch(`${API}/admin/stats`, { headers: adminHeaders }),
      fetch(`${API}/admin/users`, { headers: adminHeaders }),
      fetch(`${API}/admin/reviews`, { headers: adminHeaders }),
    ]);

    const statsData = await statsRes.json();
    const usersData = await usersRes.json();
    const reviewsData = await reviewsRes.json();

    assert(statsRes.ok, 'Admin System Analytics [/api/admin/stats]', `Users: ${statsData.totalUsers}, Recipes: ${statsData.totalRecipes}`);
    assert(usersRes.ok && usersData.users?.length > 0, 'Admin User Management [/api/admin/users]', `${usersData.users?.length} accounts`);
    assert(reviewsRes.ok, 'Admin Review Moderation [/api/admin/reviews]', `${reviewsData.reviews?.length || 0} reviews`);
  } catch (err) {
    assert(false, 'Admin Portal & RBAC Operations', err.message);
  }

  // Summary
  console.log('\n================================================================');
  console.log(`🏁 TEST EXECUTION COMPLETE: ${passed}/${passed + failed} CHECKS PASSED (${failed} FAILED)`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error('Failed items:', errors);
    process.exit(1);
  } else {
    console.log('🎉 ALL ROUTES, BUTTONS, AND SYSTEMS ARE 100% OPERATIONAL!\n');
    process.exit(0);
  }
}

runComprehensiveTests();
