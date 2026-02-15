import React from 'react';
import { SERVING_SIZE_MULTIPLIERS, GOAL_LABELS, MACRO_COLORS } from '../utils/constants';

const MealDetailModal = ({ meal, goal = 'maintenance', onClose }) => {
  if (!meal) return null;

  const multiplier = SERVING_SIZE_MULTIPLIERS[goal] || 1.0;

  const nutrition = {
    calories: Math.round(meal.baseCalories * multiplier),
    carbs: Math.round(meal.baseCarbs * multiplier),
    protein: Math.round(meal.baseProtein * multiplier),
    fat: Math.round(meal.baseFat * multiplier)
  };

  const carbCal = nutrition.carbs * 4;
  const proteinCal = nutrition.protein * 4;
  const fatCal = nutrition.fat * 9;
  const totalCal = carbCal + proteinCal + fatCal;

  const macros = [
    { 
      name: 'Carbs', 
      value: nutrition.carbs,
      percentage: ((carbCal / totalCal) * 100).toFixed(1),
      color: MACRO_COLORS.carbs
    },
    { 
      name: 'Protein', 
      value: nutrition.protein,
      percentage: ((proteinCal / totalCal) * 100).toFixed(1),
      color: MACRO_COLORS.protein
    },
    { 
      name: 'Fat', 
      value: nutrition.fat,
      percentage: ((fatCal / totalCal) * 100).toFixed(1),
      color: MACRO_COLORS.fat
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors text-2xl leading-none"
        >
          ×
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 pr-10 mb-2">
              {meal.name}
            </h2>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full capitalize">
              {meal.category}
            </span>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Ingredients
            </h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {meal.ingredients.map((ingredient, index) => (
                <li 
                  key={index}
                  className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg capitalize"
                >
                  • {ingredient}
                </li>
              ))}
            </ul>
          </div>

          {/* Nutrition */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Nutrition ({GOAL_LABELS[goal]})
            </h3>
            
            {/* Total Calories */}
            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl mb-4">
              <span className="text-base font-semibold text-gray-700">Total Calories</span>
              <span className="text-3xl font-bold text-emerald-600">{nutrition.calories} kcal</span>
            </div>

            {/* Macro Bar */}
            <div className="mb-4">
              <div className="flex h-8 rounded-full overflow-hidden shadow-inner">
                {macros.map((macro, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center text-white font-semibold text-xs transition-all hover:brightness-110"
                    style={{
                      width: `${macro.percentage}%`,
                      backgroundColor: macro.color
                    }}
                    title={`${macro.name}: ${macro.value}g (${macro.percentage}%)`}
                  >
                    {parseFloat(macro.percentage) > 12 && (
                      <span>{macro.percentage}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              {macros.map((macro, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: macro.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{macro.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {macro.value}g ({macro.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Allergens */}
          {meal.allergens.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Allergens
              </h3>
              <div className="flex flex-wrap gap-2">
                {meal.allergens.map(allergen => (
                  <span 
                    key={allergen}
                    className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-full capitalize"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealDetailModal;