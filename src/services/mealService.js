export const mealService = {
  // Fetch all meals from JSON
  async fetchMeals() {
    const response = await fetch('/data/meals.json');
    const data = await response.json();
    return data.recipes;
  },

  // Filter by category
  filterByCategory(meals, category) {
    if (!category) return meals;
    return meals.filter(meal => meal.category === category);
  },

  // Filter by allergens
  filterByAllergens(meals, selectedAllergens) {
    if (!selectedAllergens || selectedAllergens.length === 0) return meals;
    return meals.filter(meal => 
      !meal.allergens.some(allergen => selectedAllergens.includes(allergen))
    );
  },

  // Calculate nutrition based on goal
  calculateNutrition(meal, goal = 'maintenance') {
    const multiplier = meal.servingSizes[goal] || 1.0;
    return {
      calories: Math.round(meal.baseCalories * multiplier),
      carbs: Math.round(meal.baseCarbs * multiplier),
      protein: Math.round(meal.baseProtein * multiplier),
      fat: Math.round(meal.baseFat * multiplier)
    };
  }
};