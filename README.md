# 🥗 SmartMeal

> AI-powered weekly meal planner with macro tracking and personalized nutrition optimization

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express)
![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?logo=google)

---

## Demo

🔗 **Live Demo:** [smartmeal-architecture.vercel.app](https://smartmeal-architecture.vercel.app/)

> **Note:** The AI optimization uses Google Gemini API free tier (20 requests/day). If you see a quota message, clone the repo and run locally with your own API key.

---

## Overview

**AI-driven meal optimization engine** featuring mathematical macro validation and ingredient-level adjustment suggestions via Gemini 2.5 Flash.

SmartMeal generates personalized 7-day meal plans based on fitness goals (Weight Loss / Maintenance / Active / Muscle Gain) and dietary restrictions. Instead of simply swapping entire meals, the AI suggests specific ingredient adjustments with estimated macro impact—allowing users to fine-tune their nutrition without abandoning the meals they enjoy.

---

## GitHub Tags:

`react`
`tailwindcss-v4`
`google-gemini`
`fullstack`
`meal-planning`
`nutrition`
`ai-optimization`
`shadcn-ui`

---

## Features

- 🎯 **Goal-based meal planning** — Weight Loss / General Maintenance / Active Male / Muscle Gain
- 🚫 **Allergen filtering** — Automatically excludes meals containing selected allergens (dairy, eggs, gluten, nuts, shellfish, soy, fish)
- 📊 **Real-time macro visualization** — Calorie percentage breakdown with interactive macro bar
- 🤖 **AI-powered cooking adjustments** — Google Gemini suggests specific ingredient modifications with estimated macro impact
- 🖼️ **Meal detail view** — Full nutrition info, ingredients, and allergen list with responsive image layout
- 📱 **Fully responsive** — Optimized for both mobile and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| UI Components | shadcn/ui (Sonner) |
| Backend | Node.js, Express |
| AI | Google Gemini 2.5 Flash API |

---

## Architecture

### AI Role Separation

A key design decision was **not** to delegate all logic to AI.

Instead of asking Gemini to analyze macros and decide on meal swaps (slow, unreliable), the server handles all numerical calculation while AI is used only for what it excels at — generating natural language suggestions.

```
User clicks "Optimize with AI"
        ↓
Server calculates macro gaps mathematically
  - carbGap = current% - target%
  - proteinGap = current% - target%
  - fatGap = current% - target%
        ↓
If gap < 3%: return NO_SUGGESTIONS (no AI call)
        ↓
AI receives only: meal names, ingredients, and what needs to change
AI returns: specific ingredient adjustments with macro impact
        ↓
Result displayed to user
```

**Result:** Response time reduced from 60–75s → 10–15s with improved accuracy.

### Error Handling

| Status | Cause | User Feedback |
|---|---|---|
| `SUCCESS` | Suggestions found | Show modal with adjustments |
| `NO_SUGGESTIONS` | Macros already balanced | Toast notification |
| `QUOTA_EXCEEDED` | API daily limit hit (429) | Toast with retry guidance |
| `ERROR` | Unexpected failure | Toast with error message |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Google AI Studio API key ([get one here](https://aistudio.google.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/AmberHJK/smartmeal-architecture.git
cd smartmeal-architecture

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Environment Variables

Create a `.env` file in the `/server` directory:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

### Running the App

```bash
# Start backend (port 3001)
node server/api.js

# Start frontend (port 5173) — in a new terminal
npm run dev
```

Visit `http://localhost:5173`

---

## Project Structure
```
smartmeal-architecture/
├── public/
│   ├── data/
│   │   └── meals.json          # 82 meal recipes with nutrition data
│   └── images/
│       └── meals/              # AI-generated meal images
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── sonner.jsx      # shadcn/ui toast
│   │   ├── MealCard.jsx
│   │   ├── MealDetailModal.jsx
│   │   └── OptimizationModal.jsx
│   ├── lib/
│   │   └── utils.js            # shadcn utility
│   ├── pages/
│   │   ├── SetupPage.jsx
│   │   └── MealPlanPage.jsx
│   ├── services/
│   │   └── mealService.js
│   └── utils/
│       └── constants.js        # Centralized config (macros, colors, goals)
├── server/
│   └── api.js                  # Express + Gemini API
├── App.jsx
├── main.jsx
└── index.css
```

---

## Meal Data

The app includes 82 curated meals across 3 categories:

| Category | Count |
|---|---|
| Breakfast | 29 |
| Lunch | 28 |
| Dinner | 25 |

Each meal includes base nutrition data (calories, carbs, protein, fat), allergen info, and serving size multipliers per goal.

---

## License

This project is licensed under the MIT License.

### Image Credits
Meal images were generated using [Google Gemini](https://gemini.google.com/) (AI-generated content).
