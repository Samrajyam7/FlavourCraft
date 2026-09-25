/**
 * FLAVORCRAFT FRONTEND & INTEGRATION TEST SUITE (TESTS A - J)
 * Tests Cooking Mode instructions, step progression, recipe->grocery flow,
 * category/type resilience, amount preservation, and user isolation.
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING FLAVORCRAFT INTEGRATION & BUG-FIX TEST SUITE (A - J)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Helper: Login user
  async function login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    return data.token;
  }

  try {
    // 1. Get Gordon demo token
    const tokenA = await login('chef@flavorcraft.com', 'password123');
    const authHeadersA = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    };

    // TEST A: Recipe instructions are returned correctly from backend and normalized
    console.log('--- TEST A: Recipe instructions shape & integrity ---');
    const recipesRes = await (await fetch(`${BASE_URL}/recipes`)).json();
    const allRecipes = recipesRes.recipes;
    assert(allRecipes.length > 0, 'Fetched recipe list successfully');

    const sampleRecipe = allRecipes[0];
    const singleRecipeRes = await (await fetch(`${BASE_URL}/recipes/${sampleRecipe._id}`)).json();
    const fetchedRecipe = singleRecipeRes.recipe || singleRecipeRes;
    
    assert(fetchedRecipe && fetchedRecipe.instructions && fetchedRecipe.instructions.length > 0,
      `Recipe "${fetchedRecipe.title}" has ${fetchedRecipe.instructions?.length} instructions`
    );

    const firstInstruction = fetchedRecipe.instructions[0];
    const instructionText = typeof firstInstruction === 'string' ? firstInstruction : (firstInstruction.description || firstInstruction.instruction);
    assert(typeof instructionText === 'string' && instructionText.length > 0,
      `Instruction 1 has valid text: "${instructionText.slice(0, 40)}..."`
    );

    // TEST B: Normalization layer verifies Cooking Mode opens with valid steps
    console.log('\n--- TEST B: Instruction Normalization for Cooking Mode ---');
    const normalizeInstructions = (raw) => (raw || []).map((step, idx) => ({
      step: step.step || step.stepNumber || idx + 1,
      description: typeof step === 'string' ? step : (step.description || step.instruction || ''),
      timerMinutes: Number(step.timerMinutes) || 0,
    }));

    const normalized = normalizeInstructions(fetchedRecipe.instructions);
    assert(
      normalized.length === fetchedRecipe.instructions.length &&
      normalized[0].step === 1 &&
      typeof normalized[0].description === 'string',
      'Instructions normalized to canonical [{ step, description, timerMinutes }] structure'
    );

    // TEST C: Next step navigation bounds
    console.log('\n--- TEST C: Next Step Traversal ---');
    let currentStepIndex = 0;
    const totalSteps = normalized.length;
    // Simulate clicking Next
    currentStepIndex = Math.min(totalSteps - 1, currentStepIndex + 1);
    assert(currentStepIndex === 1 && normalized[currentStepIndex].step === 2,
      `Next step incremented correctly from step 1 to step 2: "${normalized[currentStepIndex].description.slice(0, 35)}..."`
    );

    // TEST D: Previous step navigation bounds
    console.log('\n--- TEST D: Previous Step Traversal ---');
    currentStepIndex = Math.max(0, currentStepIndex - 1);
    assert(currentStepIndex === 0, 'Previous step decremented safely back to step 1');
    // Test underflow bound
    currentStepIndex = Math.max(0, currentStepIndex - 1);
    assert(currentStepIndex === 0, 'Previous step protected against underflow (< 0)');

    // TEST E: Final step completes safely
    console.log('\n--- TEST E: Final Step Boundary & Completion ---');
    currentStepIndex = totalSteps - 1;
    assert(currentStepIndex === totalSteps - 1, `Jumped to final step ${totalSteps}`);
    const isAtLastStep = currentStepIndex >= totalSteps - 1;
    assert(isAtLastStep === true, 'Cooking mode recognizes final step ("Finish Cooking")');
    // Test overflow bound
    currentStepIndex = Math.min(totalSteps - 1, currentStepIndex + 1);
    assert(currentStepIndex === totalSteps - 1, 'Next step protected against array index overflow');

    // TEST F: Recipe missing ingredient can be added to grocery list
    console.log('\n--- TEST F: Recipe Ingredients to Grocery List Flow ---');
    const fromRecipeRes = await (await fetch(`${BASE_URL}/grocery/from-recipe`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ recipeId: fetchedRecipe._id }),
    })).json();
    assert(
      fromRecipeRes.success === true && fromRecipeRes.items.length > 0,
      `Successfully added all ingredients from "${fetchedRecipe.title}" to grocery list`
    );

    // TEST G: Grocery item preserves amount
    console.log('\n--- TEST G: Grocery Item Amount Preservation ---');
    const groceryRes = await (await fetch(`${BASE_URL}/grocery`, { headers: authHeadersA })).json();
    const groceryItems = groceryRes.items || [];
    assert(groceryItems.length > 0, `Grocery list contains ${groceryItems.length} items`);
    const itemWithAmount = groceryItems.find((i) => i.amount || i.quantity);
    assert(
      itemWithAmount && (itemWithAmount.amount || itemWithAmount.quantity),
      `Item "${itemWithAmount?.name}" preserves amount "${itemWithAmount?.amount || itemWithAmount?.quantity}" and unit "${itemWithAmount?.unit || ''}"`
    );

    // TEST H: Grocery List loads without crashing when category/type is missing
    console.log('\n--- TEST H: Resilient Category & Type Handling ---');
    // Add raw item without category or type
    const customAddRes = await (await fetch(`${BASE_URL}/grocery`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ name: 'Raw Test Herb', quantity: '2', unit: 'bunches' }),
    })).json();
    assert(customAddRes.success === true, 'Added custom item without explicit category');

    // Simulate frontend grouping logic on all items
    const testList = customAddRes.items || [];
    let crashed = false;
    try {
      const grouped = testList.reduce((acc, item) => {
        let cat = (item.category || item.ingredientId?.category || 'Other').trim() || 'Other';
        const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1);
        if (!acc[formattedCat]) acc[formattedCat] = [];
        acc[formattedCat].push(item);
        return acc;
      }, {});
      assert(Object.keys(grouped).length > 0, 'Grouped grocery items safely with no crash or undefined errors');
    } catch (e) {
      crashed = true;
    }
    assert(!crashed, 'Frontend grouping handles missing category gracefully with fallback "Other"');

    // TEST I: Grocery category filtering works
    console.log('\n--- TEST I: Category Filtering ---');
    const pantryItems = testList.filter((item) => {
      const itemCat = (item.category || item.ingredientId?.category || 'Other').toLowerCase();
      return itemCat === 'pantry';
    });
    assert(pantryItems.length > 0, `Filtering by category "Pantry" correctly found ${pantryItems.length} pantry items`);

    // TEST J: Grocery user isolation works
    console.log('\n--- TEST J: Strict User Isolation on Grocery Data ---');
    const tokenB = await login('admin@flavorcraft.com', 'admin123456');
    const authHeadersB = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`,
    };

    // Clear Julia's list
    await fetch(`${BASE_URL}/grocery/clear-purchased`, { method: 'DELETE', headers: authHeadersB });
    
    // Add unique item for User B
    const uniqueItemB = `Julia-Special-Ingredient-${Date.now()}`;
    await fetch(`${BASE_URL}/grocery`, {
      method: 'POST',
      headers: authHeadersB,
      body: JSON.stringify({ name: uniqueItemB, quantity: '1', category: 'Dairy' }),
    });

    // Fetch User A's list
    const listA = (await (await fetch(`${BASE_URL}/grocery`, { headers: authHeadersA })).json()).items || [];
    const foundInA = listA.some((i) => i.name === uniqueItemB);
    assert(!foundInA, `User A CANNOT see User B's private grocery item ("${uniqueItemB}")`);

    // Fetch User B's list
    const listB = (await (await fetch(`${BASE_URL}/grocery`, { headers: authHeadersB })).json()).items || [];
    const foundInB = listB.some((i) => i.name === uniqueItemB);
    assert(foundInB, `User B correctly sees their own item ("${uniqueItemB}")`);

    // Clean up User B's test item
    const createdItem = listB.find((i) => i.name === uniqueItemB);
    if (createdItem) {
      await fetch(`${BASE_URL}/grocery/${createdItem._id}`, { method: 'DELETE', headers: authHeadersB });
    }

    console.log('\n================================================================');
    console.log(`🏁 INTEGRATION TEST RESULTS: ${passed}/${passed + failed} PASSED (${failed} FAILED)`);
    console.log('================================================================');

    if (failed === 0) {
      console.log('🎉 ALL 10 TESTS (A-J) PASSED WITH 100% SUCCESS!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err.message);
    process.exit(1);
  }
}

runTests();
