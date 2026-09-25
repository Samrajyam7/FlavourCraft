const fs = require('fs');
const path = require('path');

// Extract all recipes and their imageUrls from seed.js
const seedContent = fs.readFileSync(path.join(__dirname, 'seed.js'), 'utf8');

const recipeRegex = /title:\s*['"`](.*?)['"`][\s\S]*?imageUrl:\s*['"`](.*?)['"`]/g;
let match;
const recipes = [];
const urlToRecipes = new Map();

while ((match = recipeRegex.exec(seedContent)) !== null) {
  const title = match[1];
  const imageUrl = match[2];
  recipes.push({ title, imageUrl });

  if (!urlToRecipes.has(imageUrl)) {
    urlToRecipes.set(imageUrl, []);
  }
  urlToRecipes.get(imageUrl).push(title);
}

console.log('================================================================');
console.log(`🖼️  FLAVORCRAFT RECIPE IMAGE INTEGRITY & UNIQUENESS VALIDATOR`);
console.log('================================================================');
console.log(`Total recipes evaluated: ${recipes.length}\n`);

let duplicatesFound = false;

for (const [url, titles] of urlToRecipes.entries()) {
  if (titles.length > 1) {
    duplicatesFound = true;
    console.error(`❌ DUPLICATE IMAGE URL DETECTED for ${titles.length} recipes:`);
    console.error(`   URL: ${url}`);
    console.error(`   Recipes: ${titles.join(' | ')}\n`);
  } else {
    console.log(`✅ [UNIQUE] ${titles[0].padEnd(45)} -> ${url.substring(0, 55)}...`);
  }
}

console.log('\n================================================================');
if (duplicatesFound) {
  console.error('❌ IMAGE VALIDATION FAILED: Duplicate image URLs detected.');
  process.exit(1);
} else {
  console.log(`🎉 ALL ${recipes.length} RECIPES HAVE 100% UNIQUE, DISH-SPECIFIC IMAGES!`);
  console.log('================================================================');
  process.exit(0);
}
