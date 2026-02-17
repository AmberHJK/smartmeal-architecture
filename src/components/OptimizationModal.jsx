import React from 'react';

const OptimizationModal = ({ 
  optimizationResult, 
  weekPlan,
  onClose,
}) => {
  if (!optimizationResult || !optimizationResult.suggestions || optimizationResult.suggestions.length === 0) {
    return null;
  }

  // Group suggestions by mealType
  const grouped = optimizationResult.suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.mealType]) acc[suggestion.mealType] = [];
    acc[suggestion.mealType].push(suggestion);
    return acc;
  }, {});

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors text-2xl leading-none z-10"
        >
          ×
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Header */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 pr-10">
            🤖 AI Suggestions for {optimizationResult.day}
          </h2>

          {/* Analysis */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 mb-6">
            <h3 className="text-base font-semibold text-blue-900 mb-2">Analysis</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              {optimizationResult.analysis}
            </p>
          </div>

          {/* Suggestions - grouped by mealType */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Adjustments</h3>

            {Object.entries(grouped).map(([mealType, suggestions]) => {
              const meal = weekPlan[optimizationResult.day][mealType];

              if (!meal) return null;

              return (
                <div key={mealType} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  {/* Meal Type Badge */}
                  <div className="px-4 py-2 bg-emerald-100 text-emerald-700 text-xs font-semibold capitalize">
                    {mealType}
                  </div>

                  <div className="p-4 sm:p-5">
                    {/* Meal Info */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image */}
                      {meal.image && (
                        <div className="w-full sm:w-2/5 h-40 sm:h-45 rounded-lg overflow-hidden bg-gray-100 shadow-md flex-shrink-0">
                          <img
                            src={meal.image}
                            alt={meal.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/images/meals/placeholder.jpg'; }}
                          />
                        </div>
                      )}
                      {/* Name + Ingredients */}
                      <div className="w-full sm:w-3/5 min-w-0">
                        <h4 className="text-xl font-bold text-gray-900 mb-1">{meal.name}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed capitalize">
                          • {meal.ingredients.join(', ')}
                        </p>
                        
                        {/* Divider */}
                        <div className="border-t border-gray-200 my-2" />

                        {/* Suggestions */}
                        <div className="space-y-3">
                          {suggestions.map((suggestion, index) => (
                            <div key={index} className="flex flex-col gap-1.5">
                              <p className="text-sm font-normal text-gray-900">
                                - {suggestion.action}
                              </p>
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-200 rounded-lg w-fit mt-1">
                                <span className="text-sm">📊</span>
                                <span className="text-sm font-medium text-emerald-700">
                                  {suggestion.impact}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationModal;