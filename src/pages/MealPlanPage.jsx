import { useState } from 'react';
import { toast } from "sonner"
import { SERVING_SIZE_MULTIPLIERS, GOAL_MACROS, GOAL_LABELS, MACRO_COLORS } from '../utils/constants';
import MealCard from '../components/MealCard';
import MealDetailModal from '../components/MealDetailModal';
import OptimizationModal from '../components/OptimizationModal';

const DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const MealPlanPage = ({ meals, goal, allergens, onBack }) => {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [optimizingDay, setOptimizingDay] = useState(null);
  const [optimizeStartTime, setOptimizeStartTime] = useState(null);
  
  const [weekPlan, setWeekPlan] = useState(() => {
    return generateWeekPlan(meals);
  });

  const handleOptimize = async (day) => {
    setIsOptimizing(true);
    setOptimizingDay(day);
    setOptimizeStartTime(Date.now());
    
    try {
      const dailyTotal = calculateDailyTotal(weekPlan[day]);
      const currentMacros = calculateMacroPercentages(dailyTotal);
      const targetMacros = GOAL_MACROS[goal];

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/optimize-meal-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day,
          currentMeals: weekPlan[day],
          currentMacros,
          targetMacros,
          goal,
          allergens,
          availableMeals: meals
        })
      });

      const result = await response.json();
      
      // Handle different statuses
      if (result.status === 'QUOTA_EXCEEDED') {
        toast.error('AI optimization limit reached. Please try again tomorrow.')
        return;
      }
      
      if (result.status === 'ERROR') {
        toast.error(result.error)
        return;
      }
      
      if (result.status === 'NO_SUGGESTIONS') {
        toast.success('Your meal plan is already well-balanced! No changes needed.')
        return;
      }
      
      // SUCCESS: Show modal
      if (result.status === 'SUCCESS' && result.suggestions.length > 0) {
        setOptimizationResult({ day, ...result });
      }
      
    } catch (error) {
      console.error('Optimization failed:', error);
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      const elapsed = ((Date.now() - optimizeStartTime) / 1000).toFixed(1);
      setIsOptimizing(false);
      setOptimizingDay(null);
    }
  };

  const calculateDailyTotal = (dayMeals) => {
    const total = {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0
    };

    MEAL_TYPES.forEach(type => {
      const meal = dayMeals[type];
      if (meal) {
        const multiplier = SERVING_SIZE_MULTIPLIERS[goal] || 1.0;
        total.calories += Math.round(meal.baseCalories * multiplier);
        total.carbs += Math.round(meal.baseCarbs * multiplier);
        total.protein += Math.round(meal.baseProtein * multiplier);
        total.fat += Math.round(meal.baseFat * multiplier);
      }
    });

    return total;
  };

  const calculateMacroPercentages = (total) => {
    const carbCal = total.carbs * 4;
    const proteinCal = total.protein * 4;
    const fatCal = total.fat * 9;
    const totalCal = carbCal + proteinCal + fatCal;
    
    return [
      {
        name: 'Carbs',
        value: total.carbs,
        calPercentage: ((carbCal / totalCal) * 100).toFixed(1),
        color: MACRO_COLORS.carbs
      },
      {
        name: 'Protein',
        value: total.protein,
        calPercentage: ((proteinCal / totalCal) * 100).toFixed(1),
        color: MACRO_COLORS.protein
      },
      {
        name: 'Fat',
        value: total.fat,
        calPercentage: ((fatCal / totalCal) * 100).toFixed(1),
        color: MACRO_COLORS.fat
      }
    ];
  };

  function generateWeekPlan(allMeals) {
    if (!allMeals || allMeals.length === 0) {
      console.error('No meals available!');
      return {};
    }

    const plan = {};
    const usedMeals = { breakfast: [], lunch: [], dinner: [] };

    DAYS.forEach(day => {
      plan[day] = {};
      
      MEAL_TYPES.forEach(type => {
        const mealsOfType = allMeals.filter(m => m.category === type);
        
        if (mealsOfType.length === 0) {
          console.error(`No meals found for category: ${type}`);
          return;
        }
        
        const availableMeals = mealsOfType.filter(
          meal => !usedMeals[type].includes(meal.id)
        );
        
        const mealsToChooseFrom = availableMeals.length > 0 
          ? availableMeals 
          : mealsOfType;
        
        const randomMeal = mealsToChooseFrom[
          Math.floor(Math.random() * mealsToChooseFrom.length)
        ];
        
        plan[day][type] = randomMeal;
        usedMeals[type].push(randomMeal.id);
      });
    });

    return plan;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 via-slate-300 to-teal-200">
      {/* Loading Overlay */}
      {isOptimizing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center animate-in slide-in-from-bottom duration-400">
            {/* Spinner */}
            <div className="w-16 h-16 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6"></div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Analyzing Your Meal Plan...
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                <span className="text-2xl">📊</span>
                <span className="text-sm text-gray-700">Calculating macro percentages</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse [animation-delay:300ms]">
                <span className="text-2xl">🤖</span>
                <span className="text-sm text-gray-700">AI analyzing {optimizingDay}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse [animation-delay:600ms]">
                <span className="text-2xl">🔍</span>
                <span className="text-sm text-gray-700">Finding optimal meal swaps</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 italic">Optimizing your nutrition plan... This might take a moment.</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 px-2 py-2 bg-emerald-100 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors font-medium"
            >
              <span>&lt;</span>
              <span className="hidden sm:block">Back</span>
            </button>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Your Weekly Meal Plan
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                <span className="font-semibold">• Goal</span>: <span className="font-semibold text-emerald-600">{GOAL_LABELS[goal]}</span>
                {allergens.length > 0 && (
                  <>
                    {' '} | <span className="font-semibold">• Avoiding</span>: <span className="font-semibold text-red-600 capitalize">{allergens.join(', ')}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {DAYS.map(day => {
            const dailyTotal = calculateDailyTotal(weekPlan[day]);
            const macros = calculateMacroPercentages(dailyTotal);
            const target = GOAL_MACROS[goal];
            
            const carbDiff = Math.abs(parseFloat(macros[0].calPercentage) - target.carb);
            const isOffTarget = carbDiff > 5;
            
            return (
              <div key={day} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                {/* Day Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b-2 border-emerald-500">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{day}</h2>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
                      {dailyTotal.calories}
                    </span>
                    <span className="text-sm text-gray-600 ml-1">kcal</span>
                  </div>
                </div>

                {/* Macro Bar */}
                <div className="mb-4">
                  <div className="flex h-4 rounded-full h-8 overflow-hidden bg-gray-200 shadow-inner">
                    {macros.map((macro, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center text-white font-bold text-xs transition-all hover:brightness-110"
                        style={{
                          width: `${macro.calPercentage}%`,
                          backgroundColor: macro.color
                        }}
                        title={`${macro.name}: ${macro.value}g (${macro.calPercentage}%)`}
                      >
                        {parseFloat(macro.calPercentage) > 10 && (
                          <span>{macro.calPercentage}<span className="text-[9px]">%</span></span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    {macros.map((macro, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: macro.color }}
                        />
                        <span className="font-medium text-gray-700">
                          <span className="font-semibold">{macro.name}</span>: {macro.value}g ({macro.calPercentage}<span className="text-[9px]">%</span>)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {MEAL_TYPES.map(type => (
                    <MealCard
                      key={`${day}-${type}`}
                      meal={weekPlan[day][type]}
                      goal={goal}
                      onClick={setSelectedMeal}
                    />
                  ))}
                </div>

                {/* AI Optimize Button */}
                <div className={`flex flex-wrap items-center justify-between gap-3 p-3 mt-4 sm:p-4 rounded-xl ${
                  isOffTarget 
                    ? 'bg-yellow-50 border border-yellow-200' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <span className="text-sm font-medium text-gray-700">
                    {isOffTarget ? (
                      <>⚠️ Macros differ from target by {carbDiff.toFixed(1)}%</>
                    ) : (
                      <>✨ Fine-tune your meal plan with AI</>
                    )}
                  </span>
                  <button 
                    onClick={() => handleOptimize(day)}
                    disabled={isOptimizing}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isOptimizing && optimizingDay === day ? '🔄 Optimizing...' : '🤖 Optimize with AI'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modals */}
      <OptimizationModal
        optimizationResult={optimizationResult}
        weekPlan={weekPlan}
        onClose={() => setOptimizationResult(null)}
      />

      <MealDetailModal
        meal={selectedMeal}
        goal={goal}
        onClose={() => setSelectedMeal(null)}
      />
    </div>
  );
};

export default MealPlanPage;