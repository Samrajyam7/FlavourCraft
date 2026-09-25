import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChefHat, Plus, Trash2, Image, Sparkles, Clock, Users, Flame, Check } from 'lucide-react';
import { recipeService } from '../services/recipeService';
import { ingredientService } from '../services/ingredientService';
import { useToast } from '../context/ToastContext';

export const RecipeFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('Italian');
  const [mealType, setMealType] = useState('Dinner');
  const [difficulty, setDifficulty] = useState('Medium');
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(25);
  const [servings, setServings] = useState(4);
  const [caloriesPerServing, setCaloriesPerServing] = useState(450);
  const [imageUrl, setImageUrl] = useState('');
  const [dietaryTags, setDietaryTags] = useState([]);

  // Ingredients: [{ ingredientId, name, amount, unit, notes }]
  const [ingredientsList, setIngredientsList] = useState([
    { ingredientId: '', name: '', amount: 1, unit: 'tbsp', notes: '' },
  ]);

  // Instructions: [{ stepNumber, instruction, timerMinutes }]
  const [instructionsList, setInstructionsList] = useState([
    { stepNumber: 1, instruction: '', timerMinutes: 0 },
  ]);

  useEffect(() => {
    const init = async () => {
      try {
        const ingData = await ingredientService.getIngredients({ limit: 300 });
        setAvailableIngredients(ingData.ingredients || ingData || []);

        if (isEditMode) {
          setLoading(true);
          const recRes = await recipeService.getRecipeById(id);
          const rec = recRes?.recipe || recRes;
          setTitle(rec.title || '');
          setDescription(rec.description || '');
          setCuisine(rec.cuisine || 'Italian');
          setMealType(rec.mealType || 'Dinner');
          setDifficulty(rec.difficulty || 'Medium');
          setPrepTime(rec.prepTimeMinutes || rec.prepTime || 15);
          setCookTime(rec.cookTimeMinutes || rec.cookTime || 20);
          setServings(rec.servings || 4);
          setCaloriesPerServing(rec.caloriesPerServing || 400);
          setImageUrl(rec.imageUrl || '');
          setDietaryTags(rec.dietaryTags || []);

          if (rec.ingredients?.length > 0) {
            setIngredientsList(
              rec.ingredients.map((item) => ({
                ingredientId: item.ingredientId?._id || item.ingredient?._id || item.ingredientId || item.ingredient || '',
                name: item.ingredientId?.name || item.ingredient?.name || item.name || '',
                amount: item.amount || 1,
                unit: item.unit || item.ingredientId?.unit || 'unit',
                notes: item.notes || '',
              }))
            );
          }

          if (rec.instructions?.length > 0) {
            setInstructionsList(
              rec.instructions.map((step, idx) => ({
                stepNumber: step.step || step.stepNumber || idx + 1,
                instruction: typeof step === 'string' ? step : (step.description || step.instruction || ''),
                timerMinutes: Number(step.timerMinutes) || 0,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to init recipe form:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, isEditMode]);

  const handleAddIngredientRow = () => {
    setIngredientsList((prev) => [
      ...prev,
      { ingredientId: '', name: '', amount: 1, unit: 'unit', notes: '' },
    ]);
  };

  const handleRemoveIngredientRow = (idx) => {
    setIngredientsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleIngredientChange = (idx, field, value) => {
    setIngredientsList((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === 'ingredientId') {
        const found = availableIngredients.find((i) => i._id === value);
        if (found) {
          updated[idx].name = found.name;
        }
      }
      return updated;
    });
  };

  const handleAddInstructionRow = () => {
    setInstructionsList((prev) => [
      ...prev,
      { stepNumber: prev.length + 1, instruction: '', timerMinutes: 0 },
    ]);
  };

  const handleRemoveInstructionRow = (idx) => {
    setInstructionsList((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((step, i) => ({ ...step, stepNumber: i + 1 }))
    );
  };

  const handleInstructionChange = (idx, field, value) => {
    setInstructionsList((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleTagToggle = (tag) => {
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ingredientsList.length === 0 || !ingredientsList[0].name) {
      toastError('Please add at least one ingredient');
      return;
    }

    if (instructionsList.length === 0 || !instructionsList[0].instruction) {
      toastError('Please add at least one instruction step');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        cuisine,
        mealType,
        difficulty,
        prepTimeMinutes: Number(prepTime),
        cookTimeMinutes: Number(cookTime),
        servings: Number(servings),
        nutrition: {
          calories: Number(caloriesPerServing) || 0,
        },
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
        dietaryTags,
        ingredients: ingredientsList
          .filter((item) => item.ingredientId || item.name)
          .map((item) => ({
            ingredientId: item.ingredientId || undefined,
            amount: `${item.amount} ${item.unit || ''}`.trim(),
            isOptional: false,
            importance: 2,
          })),
        instructions: instructionsList
          .filter((step) => step.instruction || step.description)
          .map((step, idx) => ({
            step: step.stepNumber || idx + 1,
            description: step.instruction || step.description,
            timerMinutes: Number(step.timerMinutes) || 0,
          })),
      };

      if (isEditMode) {
        await recipeService.updateRecipe(id, payload);
        success('Recipe updated successfully!');
        navigate(`/recipes/${id}`);
      } else {
        const res = await recipeService.createRecipe(payload);
        const createdRecipe = res?.recipe || res;
        success('Recipe crafted & published! 🎉');
        navigate(`/recipes/${createdRecipe._id || ''}`);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  const commonDietTags = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Nut-Free', 'Low-Sodium'];

  return (
    <div className="container-page py-8 max-w-4xl space-y-8">
      <div className="border-b border-dark-border pb-4">
        <h1 className="text-3xl font-heading font-black text-white">
          {isEditMode ? 'Edit Recipe' : 'Craft a New Recipe'}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Share your culinary masterpieces with the FlavorCraft community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details Card */}
        <div className="card p-6 sm:p-8 bg-dark-card border-dark-border space-y-5">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" /> Basic Information
          </h2>

          <div>
            <label className="input-label">Recipe Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Creamy Tuscan Garlic Butter Salmon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input text-base font-semibold"
            />
          </div>

          <div>
            <label className="input-label">Story & Description</label>
            <textarea
              rows="3"
              placeholder="Describe flavors, aromas, serving pairings..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Cuisine</label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="input text-xs"
              >
                <option value="Italian">Italian</option>
                <option value="Asian">Asian</option>
                <option value="Mexican">Mexican</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Indian">Indian</option>
                <option value="American">American</option>
                <option value="French">French</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="input-label">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="input text-xs"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
                <option value="Dessert">Dessert</option>
              </select>
            </div>

            <div>
              <label className="input-label">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input text-xs"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="input-label">Prep Time (min)</label>
              <input
                type="number"
                min="0"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Cook Time (min)</label>
              <input
                type="number"
                min="0"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Servings</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Calories / Serving</label>
              <input
                type="number"
                min="0"
                value={caloriesPerServing}
                onChange={(e) => setCaloriesPerServing(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Cover Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="input-label">Dietary Badges</label>
            <div className="flex flex-wrap gap-2">
              {commonDietTags.map((tag) => {
                const selected = dietaryTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      selected
                        ? 'bg-primary text-white shadow-glow-green'
                        : 'bg-dark-surface text-text-secondary hover:text-white border border-dark-border'
                    }`}
                  >
                    {selected && '✓ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ingredients Builder */}
        <div className="card p-6 sm:p-8 bg-dark-card border-dark-border space-y-5">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" /> Recipe Ingredients
            </h2>
            <button
              type="button"
              onClick={handleAddIngredientRow}
              className="btn btn-outline text-xs !py-1.5 flex items-center gap-1 text-primary border-primary/30"
            >
              <Plus className="w-4 h-4" /> Add Ingredient
            </button>
          </div>

          <div className="space-y-3">
            {ingredientsList.map((row, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-dark-surface/50 p-3 rounded-xl border border-dark-border/60">
                {/* Select from catalog or type custom name */}
                <div className="w-full sm:flex-1">
                  <input
                    type="text"
                    placeholder="Ingredient Name (e.g. Garlic)"
                    value={row.name}
                    onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                    required
                    className="input text-xs !py-2"
                  />
                </div>

                <div className="w-full sm:w-24">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Qty"
                    value={row.amount}
                    onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                    className="input text-xs !py-2"
                  />
                </div>

                <div className="w-full sm:w-28">
                  <input
                    type="text"
                    placeholder="Unit (tbsp, g)"
                    value={row.unit}
                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                    className="input text-xs !py-2"
                  />
                </div>

                <div className="w-full sm:w-40">
                  <input
                    type="text"
                    placeholder="Notes (e.g. minced)"
                    value={row.notes}
                    onChange={(e) => handleIngredientChange(idx, 'notes', e.target.value)}
                    className="input text-xs !py-2"
                  />
                </div>

                {ingredientsList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredientRow(idx)}
                    className="text-text-muted hover:text-red-400 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step Instructions Builder */}
        <div className="card p-6 sm:p-8 bg-dark-card border-dark-border space-y-5">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-DEFAULT" /> Step-by-Step Directions
            </h2>
            <button
              type="button"
              onClick={handleAddInstructionRow}
              className="btn btn-outline text-xs !py-1.5 flex items-center gap-1 text-primary border-primary/30"
            >
              <Plus className="w-4 h-4" /> Add Step
            </button>
          </div>

          <div className="space-y-4">
            {instructionsList.map((step, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start bg-dark-surface/50 p-4 rounded-xl border border-dark-border/60">
                <span className="w-8 h-8 rounded-lg bg-dark-card text-primary font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {idx + 1}
                </span>

                <div className="flex-1 w-full space-y-2">
                  <textarea
                    rows="2"
                    placeholder={`Describe Step ${idx + 1}...`}
                    value={step.instruction}
                    onChange={(e) => handleInstructionChange(idx, 'instruction', e.target.value)}
                    required
                    className="input text-xs"
                  />

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-muted">Step Timer (optional minutes):</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 10"
                      value={step.timerMinutes || ''}
                      onChange={(e) => handleInstructionChange(idx, 'timerMinutes', e.target.value)}
                      className="input !py-1 !px-2 w-20 text-xs"
                    />
                  </div>
                </div>

                {instructionsList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInstructionRow(idx)}
                    className="text-text-muted hover:text-red-400 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg shadow-glow-green"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Recipe' : 'Publish Recipe 🚀'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeFormPage;
