import { useState, useEffect } from 'react'
import SetupPage from './pages/SetupPage';
import MealPlanPage from './pages/MealPlanPage';

function App() {
  const [meals, setMeals] = useState([]);
  const [currentPage, setCurrentPage] = useState('setup');
  const [userConfig, setUserConfig] = useState(null);

  // Load meal data from JSON
  useEffect(() => {
    fetch('/data/meals.json')
      .then(res => res.json())
      .then(data => setMeals(data.recipes))
      .catch(err => console.error('Failed to load meals:', err));
  }, []);

  const handleGenerate = (config) => {
    // Filter meals by allergens
    const filteredMeals = config.allergens.length > 0
      ? meals.filter(meal => 
          !meal.allergens.some(allergen => config.allergens.includes(allergen))
        )
      : meals;

    setUserConfig({ ...config, filteredMeals });
    setCurrentPage('plan');
  };

  const handleBack = () => {
    setCurrentPage('setup');
  };

  if (meals.length === 0) {
    return <div className="loading">Loading meals...</div>;
  }

  return (
    <div className="app">
      {currentPage === 'setup' && (
        <SetupPage onGenerate={handleGenerate} />
      )}
      
      {currentPage === 'plan' && userConfig && (
        <MealPlanPage
          meals={userConfig.filteredMeals}
          goal={userConfig.goal}
          allergens={userConfig.allergens}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;