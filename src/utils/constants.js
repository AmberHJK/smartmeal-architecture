export const SERVING_SIZE_MULTIPLIERS = {
  weightLoss: 0.9,
  maintenance: 1.0,
  activeMale: 1.25,
  muscleGain: 1.35
};

export const GOAL_MACROS = {
  weightLoss: { carb: 40, protein: 30, fat: 30 },
  maintenance: { carb: 50, protein: 20, fat: 30 },
  activeMale: { carb: 55, protein: 20, fat: 25 },
  muscleGain: { carb: 50, protein: 25, fat: 25 }
};

export const GOAL_LABELS = {
  weightLoss: 'Weight Loss',
  maintenance: 'General Maintenance',
  activeMale: 'Active Male',
  muscleGain: 'Muscle Gain / High Activity'
};

export const MACRO_COLORS = {
  carbs: '#22c55e',    // green-500
  protein: '#0ea5e9',  // sky-500
  fat: '#f97316'       // orange-500
};

export const GOALS = [
  { 
    value: 'weightLoss', 
    label: 'Weight Loss', 
    calories: '1800 kcal',
    macros: { carb: 40, protein: 30, fat: 30 }
  },
  { 
    value: 'maintenance', 
    label: 'General Maintenance', 
    calories: '2000 kcal',
    macros: { carb: 50, protein: 20, fat: 30 }
  },
  { 
    value: 'activeMale', 
    label: 'Active Male', 
    calories: '2500 kcal',
    macros: { carb: 55, protein: 20, fat: 25 }
  },
  { 
    value: 'muscleGain', 
    label: 'Muscle Gain / High Activity', 
    calories: '2700 kcal',
    macros: { carb: 50, protein: 25, fat: 25 }
  }
];

export const ALLERGENS = ['dairy', 'eggs', 'fish', 'gluten', 'nuts', 'shellfish', 'soy'];