const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');

// @route   POST /api/ai/diet-plan
// @desc    Generate AI diet plan based on diagnosis
// @access  Private
router.post('/diet-plan', protect, async (req, res) => {
  try {
    const { diagnosis, patientAge, patientGender } = req.body;

    if (!diagnosis || diagnosis.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Diagnosis is required to generate diet plan'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured'
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert Ayurvedic and general medical dietitian. Based on the following diagnosis, generate a concise diet plan for the patient.

Diagnosis: ${diagnosis}
${patientAge ? `Patient Age: ${patientAge} years` : ''}
${patientGender ? `Patient Gender: ${patientGender}` : ''}

Provide a brief, practical diet plan in the following format:
- Foods to Eat (4-5 items)
- Foods to Avoid (4-5 items)
- General Diet Tips (2-3 tips)

Keep it concise and practical. Use simple language that patients can understand. Response should be in plain text, not markdown. Keep total response under 200 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const dietPlan = response.text();

    res.json({
      success: true,
      data: { dietPlan }
    });
  } catch (error) {
    console.error('AI Diet Plan Error:', error.message || error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate diet plan. Please try again.'
    });
  }
});

module.exports = router;
