# 🍳 FlavorCraft — Intelligent Ingredient-Based Recipe Discovery Platform

<div align="center">

![FlavorCraft Banner](https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80)

**Turn the ingredients you have into meals you'll love.**  
*Zero food waste. Precision recipe percentage matching. Smart weekly meal prep & grocery assistant.*

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## ✨ Features

### 🔍 1. Intelligent Recipe Matcher
- **Interactive Ingredient Selector**: Filter ingredients by Produce, Dairy, Meat & Seafood, Pantry, Grains & Pasta, Herbs & Spices, Condiments, etc.
- **Dynamic Percentage Match Algorithm**: Computes exact percentage matching against user pantry items.
- **Missing Ingredient Indicator**: Highlights missing items with 1-click transfer to your shopping list.
- **Match Threshold Sliders**: Adjust matching strictness from 10% (creative) to 100% (exact pantry match).

### 📖 2. Rich Recipe Catalog & Detailed View
- **Dynamic Serving Scaler**: Dynamically scales ingredient amounts based on chosen serving size.
- **Interactive Fullscreen Cooking Mode**: Step-by-step cooking interface with built-in voice-ready countdown timers and ingredient checklist drawer.
- **Community Ratings & Reviews**: Submit star ratings, reviews, and culinary adjustments.
- **Dietary & Cuisine Filters**: Filter by Italian, Asian, Mexican, Mediterranean, Indian, Keto, Vegan, Vegetarian, Gluten-Free.

### 🧊 3. Zero-Waste Smart Pantry (Inventory)
- **Track Home Ingredients**: Keep an exact count of stock, unit, and category.
- **Expiry Date Tracker**: Automatic warnings for items expiring in 3 days vs expired items.
- **1-Click Sync**: Load your current pantry directly into the recipe matcher in one tap.

### 📅 4. 7-Day Meal Planner & Smart Grocery List
- **Weekly Meal Planner**: Drag-and-drop / assign dishes to Monday–Sunday across Breakfast, Lunch, Dinner, and Snacks.
- **One-Click Grocery Export**: Automatically generate a complete shopping list from all planned weekly meals.
- **Categorized Shopping Aisle Checklist**: Check off items while shopping in real-time, print list, or clear purchased items.

### 👨‍🍳 5. Recipe Creator & User Dashboard
- **Create & Edit Recipes**: Rich recipe builder with ingredient amounts, units, notes, and timed steps.
- **Saved Favorites**: Bookmark recipes for quick access.
- **Admin Control Center**: System analytics dashboard, user role permissions, and master ingredients catalog CRUD.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router 6, Tailwind CSS, Lucide Icons, Framer Motion, Axios
- **Backend**: Node.js, Express.js, MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Styling**: Tailored dark mode design system with glassmorphic cards and micro-animations

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas database connection string or local MongoDB instance

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Samrajyam7/FlavourCraft.git
   cd FlavourCraft
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**
   - In `backend/.env`:
     ```env
     PORT=5000
     NODE_ENV=development
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key_here
     CLIENT_URL=http://localhost:5173
     ```

4. **Seed Initial Database with Chef Recipes & Ingredients:**
   ```bash
   npm run seed
   ```

5. **Start Development Servers (Frontend + Backend):**
   ```bash
   npm run dev
   ```
   - Frontend will run on: `http://localhost:5173`
   - Backend API will run on: `http://localhost:5000`

---

## 🔑 Demo Credentials

For quick local testing, you can use the pre-seeded demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Demo Chef** | `chef@flavorcraft.com` | `password123` |
| **Demo Admin** | `admin@flavorcraft.com` | `admin123` |

---

## 📂 Project Structure

```
FlavourCraft/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # ProtectedRoute, Toast
│   │   │   ├── layout/        # Navbar, Footer
│   │   │   ├── recipe/        # RecipeCard, CookingModeModal
│   │   │   ├── ingredient/    # IngredientPicker
│   │   │   └── mealplan/      # AddToMealPlanModal
│   │   ├── context/           # AuthContext, ToastContext
│   │   ├── pages/             # Home, Matcher, Recipes, Details, Pantry, MealPlan, Grocery, Admin, etc.
│   │   ├── services/          # Axios API services
│   │   ├── App.jsx            # Routing & Provider setup
│   │   ├── main.jsx
│   │   └── index.css          # Design system & Tailwind rules
│   └── package.json
├── backend/
│   ├── config/                # MongoDB connection
│   ├── controllers/           # Auth, Recipe, Inventory, MealPlan, Grocery, Admin
│   ├── middleware/            # Auth & Error handling
│   ├── models/                # Mongoose Schemas (User, Recipe, Ingredient, Inventory, etc.)
│   ├── routes/                # Express API routes
│   ├── seed.js                # Database seeder with gourmet recipes & ingredients
│   ├── server.js              # Express app entrypoint
│   └── package.json
└── package.json
```

---

## 📄 License
This project is licensed under the MIT License.
