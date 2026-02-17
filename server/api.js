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

// Parse AI JSON response
const parseAIResponse = (text) => {
  let cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) return null;
  
  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  
  cleaned = cleaned
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/\n/g, ' ')
    .trim();
  
  return JSON.parse(cleaned);
};

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
    const { day, currentMeals, currentMacros, targetMacros, goal, allergens } = req.body;

    console.log('=== Optimization Request ===');
    console.log('Day:', day, '| Goal:', goal);
    const startTime = Date.now();

    // Calculate macro gaps on server
    const carbGap = parseFloat(currentMacros[0].calPercentage) - targetMacros.carb;
    const proteinGap = parseFloat(currentMacros[1].calPercentage) - targetMacros.protein;
    const fatGap = parseFloat(currentMacros[2].calPercentage) - targetMacros.fat;

    // Build needs array
    const needs = [];
    if (Math.abs(carbGap) > 3) needs.push(carbGap > 0
      ? `your carbs are ${carbGap.toFixed(1)}% over target`
      : `your carbs are ${Math.abs(carbGap).toFixed(1)}% under target`);
    if (Math.abs(proteinGap) > 3) needs.push(proteinGap < 0
      ? `your protein is ${Math.abs(proteinGap).toFixed(1)}% under target`
      : `your protein is ${proteinGap.toFixed(1)}% over target`);
    if (Math.abs(fatGap) > 3) needs.push(fatGap > 0
      ? `your fat is ${fatGap.toFixed(1)}% over target`
      : `your fat is ${Math.abs(fatGap).toFixed(1)}% under target`);

    // No meaningful gap - skip AI call entirely
    if (needs.length === 0) {
      return res.json({
        status: 'NO_SUGGESTIONS',
        analysis: `Your ${day} macros are well-balanced for ${goal}. Carbs ${currentMacros[0].calPercentage}% / Protein ${currentMacros[1].calPercentage}% / Fat ${currentMacros[2].calPercentage}% are close to target.`,
        suggestions: []
      });
    }

    const analysis = `Current macros (C:${currentMacros[0].calPercentage}% P:${currentMacros[1].calPercentage}% F:${currentMacros[2].calPercentage}%) vs target (C:${targetMacros.carb}% P:${targetMacros.protein}% F:${targetMacros.fat}%). Need to ${needs.join(' and ')}.`;

    // AI only suggests adjustments
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096 }
    });

    const prompt = `You are a nutrition expert. Give exactly 2 short meal adjustments.

Current: Carbs ${currentMacros[0].calPercentage}% / Protein ${currentMacros[1].calPercentage}% / Fat ${currentMacros[2].calPercentage}%
Target: Carbs ${targetMacros.carb}% / Protein ${targetMacros.protein}% / Fat ${targetMacros.fat}%
Need: ${needs.join(', ')}

Meals:
- Breakfast: ${currentMeals.breakfast.name}
- Lunch: ${currentMeals.lunch.name}
- Dinner: ${currentMeals.dinner.name}
${allergens.length > 0 ? `Avoid: ${allergens.join(', ')}` : ''}

Rules:
- action: max 10 words (e.g. "Reduce banana by half (50g)")
- impact: numbers only (e.g. "-11g carbs, +5g protein")
- mealType: lowercase only

JSON only, no explanation:
{"suggestions":[{"mealType":"breakfast","action":"...","impact":"..."},{"mealType":"lunch","action":"...","impact":"..."}]}`;

    // AI call with retry (max 3 attempts)
    let aiResponse = null;
    let attempts = 0;

    while (!aiResponse && attempts < 3) {
      attempts++;
      let responseText = '';
      try {
        const result = await model.generateContent(prompt);
        responseText = result.response.text().trim();
        aiResponse = parseAIResponse(responseText);
      } catch (e) {
        console.log(`=== Attempt ${attempts} failed ===`);
        console.log('Raw response:');
        console.log(responseText);
        console.log('Error:', e.message);
        if (attempts === 3) throw e;
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`=== Optimization complete (${elapsed}s, ${attempts} attempt(s)) ===`);

    if (!aiResponse || !aiResponse.suggestions || aiResponse.suggestions.length === 0) {
      return res.json({
        status: 'NO_SUGGESTIONS',
        analysis,
        suggestions: []
      });
    }

    // Normalize mealType to lowercase
    aiResponse.suggestions = aiResponse.suggestions.map(s => ({
      ...s,
      mealType: s.mealType.toLowerCase()
    }));

    res.json({
      status: 'SUCCESS',
      analysis,
      suggestions: aiResponse.suggestions
    });

  } catch (error) {
    console.error('=== ERROR ===');
    console.error(error.message);

    if (error.message.includes('429') || error.message.includes('quota')) {
      return res.status(429).json({
        status: 'QUOTA_EXCEEDED',
        error: 'AI optimization service has reached its daily limit. Please try again tomorrow.',
        suggestions: []
      });
    }

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