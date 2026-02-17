import React from 'react';
import { SERVING_SIZE_MULTIPLIERS } from '../utils/constants';

const MealCard = ({ meal, goal = 'maintenance', onClick }) => {
  const multiplier = SERVING_SIZE_MULTIPLIERS[goal] || 1.0;
  
  const nutrition = {
    calories: Math.round(meal.baseCalories * multiplier),
    carbs: Math.round(meal.baseCarbs * multiplier),
    protein: Math.round(meal.baseProtein * multiplier),
    fat: Math.round(meal.baseFat * multiplier)
  };

  return (
    <div 
      onClick={() => onClick(meal)}
      className="relative bg-white rounded-xl border-2 border-gray-200 p-4 pt-12 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-emerald-300 flex flex-col h-full overflow-hidden"
    >
      {/* Category Badge */}
      <span className="absolute top-0 left-0 right-0 px-4 py-2 bg-teal-100 text-emerald-700 text-xs font-medium capitalize">
        {meal.category}
      </span>

      {/* Meal Image */}
      {meal.image && (
        <div className="w-full h-35 mb-3 rounded-lg overflow-hidden bg-gray-100 shadow-md">
          <img 
            src={meal.image} 
            alt={meal.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/images/meals/placeholder.jpg';
            }}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex-grow">
        <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {meal.name}
        </h4>
      </div>
      
      {/* Bottom Section */}
      <div className="mt-auto">
        {/* Allergens */}
        {meal.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {meal.allergens.map(allergen => (
              <span 
                key={allergen} 
                className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full capitalize"
              >
                {allergen}
              </span>
            ))}
          </div>
        )}

        {/* Calories */}
        <div className="flex justify-end">
          <div className="text-right">
            <span className="text-2xl font-bold text-emerald-600">
              {nutrition.calories}
            </span>
            <span className="text-sm text-gray-600 ml-1">kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCard;