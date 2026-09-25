const API = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Full FlavorCraft System Test...\n');
  let passed = 0;
  let failed = 0;

  // 1. Health Check
  try {
    const res = await fetch(`${API}/health`);
    const data = await res.json();
    if (res.ok && data.status === 'OK') {
      console.log('✅ [1/9] Health Check passed: Server is running healthy.');
      passed++;
    } else throw new Error(JSON.stringify(data));
  } catch (err) {
    console.error('❌ [1/9] Health Check failed:', err.message);
    failed++;
  }

  // 2. Ingredients List & Categories
  let ingredients = [];
  try {
    const [ingRes, catRes] = await Promise.all([
      fetch(`${API}/ingredients`),
      fetch(`${API}/ingredients/categories`),
    ]);
    const ingData = await ingRes.json();
    const catData = await catRes.json();
    ingredients = ingData.ingredients || [];
    if (ingRes.ok && catRes.ok) {
      console.log(`✅ [2/9] Ingredients & Categories passed: ${ingredients.length} ingredients, ${catData.length} categories.`);
      passed++;
    } else throw new Error('Ingredients or categories failed');
  } catch (err) {
    console.error('❌ [2/9] Ingredients endpoint failed:', err.message);
    failed++;
  }

  // 3. Recipes List & Search
  let recipes = [];
  try {
    const [recRes, searchRes] = await Promise.all([
      fetch(`${API}/recipes`),
      fetch(`${API}/recipes/search?q=Chicken`),
    ]);
    const recData = await recRes.json();
    const searchData = await searchRes.json();
    recipes = recData.recipes || [];
    if (recRes.ok && searchRes.ok) {
      console.log(`✅ [3/9] Recipes & Search passed: ${recipes.length} total recipes found, Search for 'Chicken' returned ${searchData.recipes?.length || 0} dishes.`);
      passed++;
    } else throw new Error('Recipes failed');
  } catch (err) {
    console.error('❌ [3/9] Recipes endpoint failed:', err.message);
    failed++;
  }

  // 4. Auth: Login with Demo Chef
  let chefToken = '';
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'chef@flavorcraft.com', password: 'password123' }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      chefToken = data.token;
      console.log(`✅ [4/9] Authentication Login passed: Successfully authenticated as ${data.user.name} (${data.user.email}).`);
      passed++;
    } else throw new Error(data.message || 'Login failed');
  } catch (err) {
    console.error('❌ [4/9] Auth Login failed:', err.message);
    failed++;
  }

  // 5. Recipe Matcher Algorithm
  try {
    const sampleIds = (recipes[0]?.ingredients?.map(i => (typeof i.ingredientId === 'object' ? i.ingredientId?._id : i.ingredientId)) || ingredients.slice(0, 5).map(i => i._id)).slice(0, 4);
    const res = await fetch(`${API}/recipes/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIngredientIds: sampleIds, minMatchPercentage: 10 }),
    });
    const data = await res.json();
    const matches = data.results || data.matches || [];
    if (res.ok) {
      console.log(`✅ [5/9] Recipe Matching Algorithm passed: Computed matches for ${matches.length} recipes.`);
      passed++;
    } else throw new Error(data.message || 'Match failed');
  } catch (err) {
    console.error('❌ [5/9] Recipe Matcher failed:', err.message);
    failed++;
  }

  // 6. Inventory / Pantry CRUD
  try {
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${chefToken}`,
    };
    const addRes = await fetch(`${API}/inventory`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ ingredientId: ingredients[0]._id, quantity: 3, unit: 'pieces' }),
    });
    const addData = await addRes.json();

    const getRes = await fetch(`${API}/inventory`, { headers: authHeaders });
    const getData = await getRes.json();
    if (addRes.ok && getRes.ok) {
      console.log(`✅ [6/9] Inventory / Pantry passed: Successfully added item and fetched pantry (${getData.inventory?.length || 0} items).`);
      passed++;
    } else throw new Error(addData.message || 'Inventory failed');
  } catch (err) {
    console.error('❌ [6/9] Inventory failed:', err.message);
    failed++;
  }

  // 7. Meal Planner
  try {
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${chefToken}`,
    };
    if (recipes.length > 0) {
      await fetch(`${API}/mealplan/slot`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          dayOfWeek: 'Monday',
          mealType: 'Dinner',
          recipeId: recipes[0]._id,
          servings: 2,
        }),
      });
    }
    const planRes = await fetch(`${API}/mealplan`, { headers: authHeaders });
    const planData = await planRes.json();
    if (planRes.ok) {
      console.log(`✅ [7/9] Weekly Meal Planner passed: Retrieved scheduled meal slots.`);
      passed++;
    } else throw new Error('Meal plan failed');
  } catch (err) {
    console.error('❌ [7/9] Meal Planner failed:', err.message);
    failed++;
  }

  // 8. Grocery List CRUD
  try {
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${chefToken}`,
    };
    const addGroc = await fetch(`${API}/grocery`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Fresh Mint Leaves', quantity: 1, unit: 'bunch', category: 'Produce' }),
    });
    const grocRes = await fetch(`${API}/grocery`, { headers: authHeaders });
    const grocData = await grocRes.json();
    if (addGroc.ok && grocRes.ok) {
      console.log(`✅ [8/9] Smart Grocery List passed: Added item and fetched checklist (${grocData.items?.length || 0} items).`);
      passed++;
    } else throw new Error('Grocery failed');
  } catch (err) {
    console.error('❌ [8/9] Grocery List failed:', err.message);
    failed++;
  }

  // 9. Admin Dashboard Stats
  try {
    const adminLoginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@flavorcraft.com', password: 'admin123456' }),
    });
    const adminData = await adminLoginRes.json();
    const adminHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminData.token}`,
    };
    const statsRes = await fetch(`${API}/admin/stats`, { headers: adminHeaders });
    const statsData = await statsRes.json();
    if (adminLoginRes.ok && statsRes.ok) {
      console.log(`✅ [9/9] Admin Control Portal passed: Verified admin permissions (Total users: ${statsData.totalUsers}, recipes: ${statsData.totalRecipes}, ingredients: ${statsData.totalIngredients}).`);
      passed++;
    } else throw new Error('Admin stats failed');
  } catch (err) {
    console.error('❌ [9/9] Admin Portal failed:', err.message);
    failed++;
  }

  console.log(`\n======================================================`);
  console.log(`🏁 SYSTEM TEST RESULTS: ${passed}/9 MODULES PASSED (${failed} FAILED)`);
  console.log(`======================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
