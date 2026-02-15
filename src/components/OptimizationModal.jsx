import React from 'react';

const OptimizationModal = ({ 
  optimizationResult, 
  weekPlan, 
  onClose, 
  onApplySuggestion, 
  onApplyAll 
}) => {
  if (!optimizationResult || !optimizationResult.suggestions || optimizationResult.suggestions.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative animate-in slide-in-from-bottom duration-300"
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
            🤖 AI Optimization for {optimizationResult.day}
          </h2>

          {/* Analysis */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Analysis
            </h3>
            <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
              {optimizationResult.analysis}
            </p>
          </div>

          {/* Suggestions */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Suggestions
              </h3>
              {optimizationResult.suggestions.length > 1 && (
                <button 
                  onClick={onApplyAll}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
                >
                  Apply All ({optimizationResult.suggestions.length})
                </button>
              )}
            </div>

            <div className="space-y-4">
              {optimizationResult.suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 pt-10 sm:p-5 sm:pt-10 relative overflow-hidden"
                >
                  {/* Meal Type Badge */}
                  <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 text-xs font-semibold capitalize mb-3 absolute top-0 left-0 right-0">
                    {suggestion.mealType}
                  </span>

                  {/* Swap */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-500 font-medium block mb-1">Current:</span>
                      <span className="text-sm sm:text-base font-semibold text-gray-900 block break-words">
                        {weekPlan[optimizationResult.day][suggestion.mealType].name}
                      </span>
                    </div>
                    <span className="text-2xl text-emerald-600 transform sm:rotate-0 rotate-90">→</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-500 font-medium block mb-1">Replace with:</span>
                      <span className="text-sm sm:text-base font-semibold text-emerald-600 block break-words">
                        {suggestion.replacementMealName}
                      </span>
                    </div>
                  </div>

                  {/* Reason */}
                  <p className="text-sm text-gray-700 bg-white p-3 rounded-lg mb-4 leading-relaxed">
                    {suggestion.reason}
                  </p>

                  {/* Apply Button */}
                  <button 
                    onClick={() => onApplySuggestion(suggestion)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Apply This
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationModal;