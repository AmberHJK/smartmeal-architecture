import { useState } from 'react';
import { GOALS, ALLERGENS } from '../utils/constants';

const SetupPage = ({ onGenerate }) => {
  const [selectedGoal, setSelectedGoal] = useState('maintenance');
  const [selectedAllergens, setSelectedAllergens] = useState([]);

  const toggleAllergen = (allergen) => {
    setSelectedAllergens(prev => 
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const handleGenerate = () => {
    onGenerate({
      goal: selectedGoal,
      allergens: selectedAllergens
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 via-slate-300 to-teal-200 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 w-full max-w-4xl my-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Plan Your Meals
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Customize your weekly meal plan based on your goals and dietary needs
          </p>
        </div>

        {/* Goal Selection */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Select Your Goal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {GOALS.map(goal => (
              <button
                key={goal.value}
                onClick={() => setSelectedGoal(goal.value)}
                className={`
                  relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left
                  hover:scale-[1.02] hover:shadow-lg
                  ${selectedGoal === goal.value
                    ? 'border-emerald-500 bg-yellow-100 shadow-md'
                    : 'border-gray-200 bg-slate-100 hover:bg-yellow-50 hover:border-emerald-200'
                  }
                `}
              >
                {/* Selected Indicator */}
                {selectedGoal === goal.value && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 pr-8">
                  {goal.label}
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600 mb-3">
                  {goal.calories}
                </p>

                {/* Macro Bar */}
                <div className="mb-3">
                  <div className="flex h-5 rounded-full overflow-hidden bg-gray-200">
                    <div 
                      className="bg-green-500 flex items-center justify-center"
                      style={{ width: `${goal.macros.carb}%` }}
                      title={`Carbs ${goal.macros.carb}%`}
                    >
                      {goal.macros.carb > 15 && (
                        <span className="text-[11px] font-semibold text-white">Carb {goal.macros.carb}%</span>
                      )}
                    </div>
                    <div 
                      className="bg-sky-500 flex items-center justify-center relative"
                      style={{ width: `${goal.macros.protein}%` }}
                      title={`Protein ${goal.macros.protein}%`}
                    >
                      {goal.macros.protein > 15 && (
                        <span className="text-[11px] font-semibold text-white whitespace-nowrap absolute top-50% left-50% ml-50%">Protein {goal.macros.protein}%</span>
                      )}
                    </div>
                    <div 
                      className="bg-orange-500 flex items-center justify-center"
                      style={{ width: `${goal.macros.fat}%` }}
                      title={`Fat ${goal.macros.fat}%`}
                    >
                      {goal.macros.fat > 15 && (
                        <span className="text-[11px] font-semibold text-white">Fat {goal.macros.fat}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Allergen Selection */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Allergens to Avoid <span className="text-base font-normal text-gray-500">(Optional)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ALLERGENS.map(allergen => (
              <label
                key={allergen}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-yellow-100 group"
              >
                <input
                  type="checkbox"
                  checked={selectedAllergens.includes(allergen)}
                  onChange={() => toggleAllergen(allergen)}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:ring-offset-0 cursor-pointer accent-green-600"
                />
                <span className="text-sm sm:text-base text-gray-700 capitalize select-none group-hover:text-gray-900">
                  {allergen}
                </span>
              </label>
            ))}
          </div>
          
          {/* Selected Count */}
          {selectedAllergens.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              <span className="font-semibold">- Avoiding:</span> <span className="font-semibold text-red-600 capitalize">{selectedAllergens.join(', ')}</span>
            </div>
          )}
        </section>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className="w-full py-4 sm:py-5 px-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-400 text-white text-lg sm:text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          <span className="font-semibold text-white">Generate Meal Plan</span>
        </button>
      </div>
    </div>
  );
};

export default SetupPage;