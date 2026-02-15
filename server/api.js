import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    console.log('Testing API key...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    res.json({ success: true, message: response.text() });
  } catch (error) {
    console.error('Test failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/optimize-meal-plan', async (req, res) => {
  try {
    const { day, currentMeals, currentMacros, targetMacros, goal, allergens, availableMeals } = req.body;
    
    console.log('=== Optimization Request ===');
    console.log('Day:', day, '| Goal:', goal);
    const startTime = Date.now();
    
    // Filter by category
    const breakfastOptions = availableMeals
      .filter(m => m.category === 'breakfast' && !m.allergens.some(a => allergens.includes(a)))
      .slice(0, 5);
    
    const lunchOptions = availableMeals
      .filter(m => m.category === 'lunch' && !m.allergens.some(a => allergens.includes(a)))
      .slice(0, 5);
    
    const dinnerOptions = availableMeals
      .filter(m => m.category === 'dinner' && !m.allergens.some(a => allergens.includes(a)))
      .slice(0, 5);

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
      }
    });

    const prompt = `You are a nutrition expert. Analyze ${day} meal plan for ${goal}:

CRITICAL: Respond ONLY with valid JSON. No markdown, no extra text.

Current Macros (calorie %):
- Carbs: ${currentMacros[0].calPercentage}% (target: ${targetMacros.carb}%)
- Protein: ${currentMacros[1].calPercentage}% (target: ${targetMacros.protein}%)
- Fat: ${currentMacros[2].calPercentage}% (target: ${targetMacros.fat}%)

Current Meals:
- Breakfast: ${currentMeals.breakfast.name} (${currentMeals.breakfast.baseCalories} kcal)
- Lunch: ${currentMeals.lunch.name} (${currentMeals.lunch.baseCalories} kcal)
- Dinner: ${currentMeals.dinner.name} (${currentMeals.dinner.baseCalories} kcal)

Available Options:
Breakfast: ${JSON.stringify(breakfastOptions.map(m => ({id: m.id, name: m.name, cal: m.baseCalories, c: m.baseCarbs, p: m.baseProtein, f: m.baseFat})))}

Lunch: ${JSON.stringify(lunchOptions.map(m => ({id: m.id, name: m.name, cal: m.baseCalories, c: m.baseCarbs, p: m.baseProtein, f: m.baseFat})))}

Dinner: ${JSON.stringify(dinnerOptions.map(m => ({id: m.id, name: m.name, cal: m.baseCalories, c: m.baseCarbs, p: m.baseProtein, f: m.baseFat})))}

RULES:
1. Only suggest swaps within ±150 kcal of current meal
2. Ensure replacementMealName matches the actual meal name from options
3. For ${goal}: improve macro ratios without increasing total calories
4. If no good swap exists, return empty suggestions array []

REQUIRED JSON FORMAT:
{
  "analysis": "Brief explanation",
  "suggestions": [
    {
      "mealType": "breakfast",
      "currentMealId": "${currentMeals.breakfast.id}",
      "replacementMealId": "EXACT_ID_FROM_OPTIONS",
      "replacementMealName": "EXACT_NAME_FROM_OPTIONS",
      "reason": "Short explanation"
    }
  ]
}`;
  
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`=== AI Response (${elapsed}s) ===`);
    console.log(responseText);
    
    // Parse JSON
    let cleanedResponse = responseText.trim();
    cleanedResponse = cleanedResponse.replace(/```json\n?|\n?```/g, '');
    
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    }
    
    console.log('=== Cleaned JSON ===');
    console.log(cleanedResponse);
    
    const aiResponse = JSON.parse(cleanedResponse);
    
    // Check if no suggestions (normal case)
    if (!aiResponse.suggestions || aiResponse.suggestions.length === 0) {
      return res.json({
        status: 'NO_SUGGESTIONS',
        analysis: aiResponse.analysis || "Your current meal plan is already well-balanced for your goal. No changes needed!",
        suggestions: []
      });
    }
    
    // Success response
    res.json({
      status: 'SUCCESS',
      ...aiResponse
    });

  } catch (error) {
    console.error('=== ERROR ===');
    console.error(error.message);
    
    // Quota exceeded (429)
    if (error.message.includes('429') || error.message.includes('quota')) {
      return res.status(429).json({
        status: 'QUOTA_EXCEEDED',
        error: 'AI optimization service has reached its daily limit. Please try again tomorrow.',
        suggestions: []
      });
    }
    
    // Other errors
    return res.status(500).json({
      status: 'ERROR',
      error: 'Unable to process AI optimization. Please try again.',
      suggestions: []
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Using Gemini 2.5 Flash');
  console.log('Visit http://localhost:3001/api/test to test your API key');
});