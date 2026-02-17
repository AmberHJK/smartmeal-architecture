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
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
    });

    const prompt = `Give 2 meal adjustments as JSON.
Current: Carbs ${currentMacros[0].calPercentage}% / Protein ${currentMacros[1].calPercentage}% / Fat ${currentMacros[2].calPercentage}%
Target: Carbs ${targetMacros.carb}% / Protein ${targetMacros.protein}% / Fat ${targetMacros.fat}%
Need: ${needs.join(', ')}
B: ${currentMeals.breakfast.name}
L: ${currentMeals.lunch.name}
D: ${currentMeals.dinner.name}
${allergens.length > 0 ? `Avoid: ${allergens.join(', ')}` : ''}
{"suggestions":[{"mealType":"breakfast/lunch/dinner","action":"...","impact":"..."}]}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`=== Optimization complete (${elapsed}s) ===`);

    // Parse JSON
    let cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '');
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('No valid JSON found in response');
      return res.status(500).json({
        status: 'ERROR',
        error: 'Unable to process AI optimization. Please try again.',
        suggestions: []
      });
    }

    cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    const aiResponse = JSON.parse(cleanedResponse);

    // Normalize mealType to lowercase
    if (aiResponse.suggestions) {
      aiResponse.suggestions = aiResponse.suggestions.map(s => ({
        ...s,
        mealType: s.mealType.toLowerCase()
      }));
    }

    if (!aiResponse.suggestions || aiResponse.suggestions.length === 0) {
      return res.json({
        status: 'NO_SUGGESTIONS',
        analysis,
        suggestions: []
      });
    }

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