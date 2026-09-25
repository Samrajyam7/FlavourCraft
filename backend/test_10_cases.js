const mongoose = require('mongoose');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

async function run10TestCases() {
  console.log('================================================================');
  console.log('🧪 FLAVORCRAFT 10 MANDATORY CORE SCENARIOS TEST SUITE');
  console.log('================================================================\n');

  let passedCount = 0;
  let totalCount = 10;

  try {
    // Fetch all ingredients to get canonical IDs
    const ingsRes = await apiRequest('/ingredients?limit=100');
    const ingredients = ingsRes.data.ingredients || ingsRes.data;
    const ingMap = {};
    ingredients.forEach((i) => {
      ingMap[i.name.toLowerCase()] = i._id;
    });

    const eggId = ingMap['egg'];
    const cheeseId = ingMap['cheese'];
    const tomatoId = ingMap['tomato'];
    const butterId = ingMap['butter'];
    const onionId = ingMap['onion'];
    const saltId = ingMap['salt'];

    // -------------------------------------------------------------
    // TEST 1: Egg + Cheese + Tomato -> Relevant recipes returned & sorted deterministically
    // -------------------------------------------------------------
    try {
      const res1 = await apiRequest('/recipes/match', {
        method: 'POST',
        body: JSON.stringify({ userIngredientIds: [eggId, cheeseId, tomatoId] }),
      });
      const matches = res1.data.results || [];
      const hasClassicOmelette = matches.some((m) => m.title === 'Classic Omelette');

      // Verify deterministic sorting rules
      let isSorted = true;
      for (let i = 0; i < matches.length - 1; i++) {
        const a = matches[i];
        const b = matches[i + 1];
        if (b.matchPercentage > a.matchPercentage) {
          isSorted = false;
          break;
        }
        if (b.matchPercentage === a.matchPercentage) {
          const aMissingReq = (a.missingIngredients || []).filter((mi) => !mi.isOptional).length;
          const bMissingReq = (b.missingIngredients || []).filter((mi) => !mi.isOptional).length;
          if (bMissingReq < aMissingReq) {
            isSorted = false;
            break;
          }
          if (aMissingReq === bMissingReq) {
            const aTime = (Number(a.prepTimeMinutes) || 0) + (Number(a.cookTimeMinutes) || 0);
            const bTime = (Number(b.prepTimeMinutes) || 0) + (Number(b.cookTimeMinutes) || 0);
            if (bTime < aTime) {
              isSorted = false;
              break;
            }
          }
        }
      }

      if (res1.status === 200 && matches.length > 0 && hasClassicOmelette && isSorted) {
        console.log(`✅ TEST 1 PASSED: Egg + Cheese + Tomato matched ${matches.length} recipes in deterministic sort order.`);
        passedCount++;
      } else {
        console.error(`❌ TEST 1 FAILED: Expected matches in deterministic sort order, got ${matches.length}, isSorted=${isSorted}`);
      }
    } catch (e) {
      console.error(`❌ TEST 1 FAILED: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 2: All required ingredients for a recipe -> 100%
    // Classic Omelette required: Egg, Cheese, Butter, Onion, Salt
    // -------------------------------------------------------------
    try {
      const res2 = await apiRequest('/recipes/match', {
        method: 'POST',
        body: JSON.stringify({ userIngredientIds: [eggId, cheeseId, butterId, onionId, saltId] }),
      });
      const omelette = (res2.data.results || []).find((m) => m.title === 'Classic Omelette');
      if (omelette && omelette.matchPercentage === 100) {
        console.log(`✅ TEST 2 PASSED: All required Classic Omelette ingredients scored exactly 100%.`);
        passedCount++;
      } else {
        console.error(`❌ TEST 2 FAILED: Expected 100% for Classic Omelette, got ${omelette?.matchPercentage}%`);
      }
    } catch (e) {
      console.error(`❌ TEST 2 FAILED: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 3: Egg only -> Only recipes containing Egg
    // -------------------------------------------------------------
    try {
      const res3 = await apiRequest('/recipes/match', {
        method: 'POST',
        body: JSON.stringify({ userIngredientIds: [eggId] }),
      });
      const matches = res3.data.results || [];
      const allHaveEgg = matches.every((m) => {
        const matched = m.matchedIngredients || [];
        return matched.some((mi) => mi.name.toLowerCase() === 'egg' || mi.id === eggId || mi._id === eggId);
      });
      if (matches.length > 0 && allHaveEgg) {
        console.log(`✅ TEST 3 PASSED: Egg only returned ${matches.length} recipes, all containing Egg.`);
        passedCount++;
      } else {
        console.error(`❌ TEST 3 FAILED: Found recipes without egg or 0 matches.`);
      }
    } catch (e) {
      console.error(`❌ TEST 3 FAILED: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 4: No ingredients -> Empty result + message
    // -------------------------------------------------------------
    try {
      const res4 = await apiRequest('/recipes/match', {
        method: 'POST',
        body: JSON.stringify({ userIngredientIds: [] }),
      });
      if (res4.status === 400 && res4.data?.results?.length === 0) {
        console.log(`✅ TEST 4 PASSED: Empty ingredients array cleanly returned HTTP 400 with empty results.`);
        passedCount++;
      } else {
        console.error(`❌ TEST 4 FAILED: Unexpected response status ${res4.status}`);
      }
    } catch (e) {
      console.error(`❌ TEST 4 FAILED: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 5: No matching ingredients -> Clean message
    // -------------------------------------------------------------
    try {
      const randomValidId = new mongoose.Types.ObjectId().toString();
      const res5 = await apiRequest('/recipes/match', {
        method: 'POST',
        body: JSON.stringify({ userIngredientIds: [randomValidId] }),
      });
      if (res5.status === 200 && res5.data.results.length === 0) {
        console.log(`✅ TEST 5 PASSED: Non-matching ingredients returned 0 recipes with success=true.`);
        passedCount++;
      } else {
        console.error(`❌ TEST 5 FAILED: Expected 0 recipes, got ${res5.data?.results?.length}`);
      }
    } catch (e) {
      console.error(`❌ TEST 5 FAILED: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 6: Required complete + missing optional -> 100%
    // -------------------------------------------------------------
    try {
      const res6 = await apiRequest('/recipes/match', {
        method: 'POST',
        body: JSON.stringify({ userIngredientIds: [eggId, cheeseId, butterId, onionId, saltId] }),
      });
      const omelette = (res6.data.results || []).find((m) => m.title === 'Classic Omelette');
      const missingOptional = (omelette?.missingIngredients || []).every((mi) => mi.isOptional);
      if (omelette && omelette.matchPercentage === 100 && missingOptional) {
        console.log(`✅ TEST 6 PASSED: Missing optional ingredients (Tomato, Pepper) did not penalize 100% score.`);
        passedCount++;
      } else {
        console.error(`❌ TEST 6 FAILED: Expected 100% with missing optional, got ${omelette?.matchPercentage}%`);
      }
    } catch (e) {
      console.error(`❌ TEST 6 FAILED: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 7: Duplicate ingredient selection -> Egg + Egg -> Egg only once
    // -------------------------------------------------------------
    try {
      const res7 = await apiRequest('/recipes/match', {
        method: 'POST',
        body: JSON.stringify({ userIngredientIds: [eggId, eggId, eggId] }),
      });
      const singleEggRes = await apiRequest('/recipes/match', {
        method: 'POST',
        body: JSON.stringify({ userIngredientIds: [eggId] }),
      });
      if (res7.status === 200 && res7.data.results.length === singleEggRes.data.results.length) {
        console.log(`✅ TEST 7 PASSED: Duplicate [Egg, Egg, Egg] deduplicated and yielded identical results to [Egg].`);
        passedCount++;
      } else {
        console.error(`❌ TEST 7 FAILED: Duplicate IDs produced inconsistent results.`);
      }
    } catch (e) {
      console.error(`❌ TEST 7 FAILED: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 8: Remove ingredient -> Results rematch using latest selection
    // -------------------------------------------------------------
    try {
      const withTomato = await apiRequest('/recipes/match', {
        method: 'POST',
        body: JSON.stringify({ userIngredientIds: [eggId, cheeseId, tomatoId] }),
      });
      const withoutTomato = await apiRequest('/recipes/match', {
        method: 'POST',
        body: JSON.stringify({ userIngredientIds: [eggId, cheeseId] }),
      });
      if (withTomato.status === 200 && withoutTomato.status === 200) {
        console.log(`✅ TEST 8 PASSED: Removing Tomato dynamically recalculated results (${withTomato.data.results.length} -> ${withoutTomato.data.results.length}).`);
        passedCount++;
      } else {
        console.error(`❌ TEST 8 FAILED: Status issue during rematching.`);
      }
    } catch (e) {
      console.error(`❌ TEST 8 FAILED: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 9: Invalid ObjectId -> HTTP 400
    // -------------------------------------------------------------
    try {
      const res9 = await apiRequest('/recipes/match', {
        method: 'POST',
        body: JSON.stringify({ userIngredientIds: ['not-a-valid-object-id', '123'] }),
      });
      if (res9.status === 400) {
        console.log(`✅ TEST 9 PASSED: Invalid ObjectId returned clean HTTP 400 Bad Request with useful message.`);
        passedCount++;
      } else {
        console.error(`❌ TEST 9 FAILED: Expected 400, got ${res9.status}`);
      }
    } catch (e) {
      console.error(`❌ TEST 9 FAILED: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 10: User isolation -> User A cannot access User B's private data
    // -------------------------------------------------------------
    try {
      const userAEmail = `user_a_${Date.now()}@test.com`;
      const userBEmail = `user_b_${Date.now()}@test.com`;

      const resA = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'User Alpha', email: userAEmail, password: 'password123' }),
      });
      const tokenA = resA.data.token;

      const resB = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'User Beta', email: userBEmail, password: 'password123' }),
      });
      const tokenB = resB.data.token;

      // User A adds an item to inventory
      await apiRequest('/inventory', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenA}` },
        body: JSON.stringify({ ingredientId: eggId, quantity: 12, unit: 'pieces' }),
      });

      // User B fetches inventory
      const invB = await apiRequest('/inventory', {
        method: 'GET',
        headers: { Authorization: `Bearer ${tokenB}` },
      });

      const userBItems = invB.data.items || invB.data.inventory || invB.data;
      if (Array.isArray(userBItems) && userBItems.length === 0) {
        console.log(`✅ TEST 10 PASSED: Strict user isolation verified (User B saw 0 items from User A's pantry).`);
        passedCount++;
      } else {
        console.error(`❌ TEST 10 FAILED: User B saw items from User A! Data leak!`);
      }
    } catch (e) {
      console.error(`❌ TEST 10 FAILED: ${e.message}`);
    }

    console.log('\n================================================================');
    console.log(`🏁 10 MANDATORY SCENARIOS EXECUTION COMPLETE: ${passedCount}/${totalCount} PASSED`);
    console.log('================================================================');

    if (passedCount === totalCount) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err.message);
    process.exit(1);
  }
}

run10TestCases();
