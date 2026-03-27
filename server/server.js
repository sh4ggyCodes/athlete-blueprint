const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Now that 'app' exists, we can unlock the doors
app.use(cors()); 
app.use(express.json());

app.use(express.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Example WEEK_PLAN structure for the AI to follow
const WEEK_PLAN_EXAMPLE = {
  "day1": {
    "focus": "Upper Body Strength",
    "exercises": [
      {"name": "Push-ups", "sets": "3", "reps": "10-15"},
      {"name": "Dips", "sets": "3", "reps": "8-12"},
      {"name": "Pull-ups", "sets": "3", "reps": "AMRAP (As Many Reps As Possible)"}
    ]
  },
  "day2": {
    "focus": "Lower Body & Core",
    "exercises": [
      {"name": "Squats", "sets": "3", "reps": "15-20"},
      {"name": "Lunges (each leg)", "sets": "3", "reps": "10-12"},
      {"name": "Plank", "sets": "3", "duration": "60 seconds"}
    ]
  },
  "day3": {
    "focus": "Cardio & Active Recovery",
    "exercises": [
      {"name": "Running", "duration": "45 minutes", "intensity": "Moderate"},
      {"name": "Stretching/Mobility Drills", "duration": "15 minutes"}
    ]
  },
  "day4": {
    "focus": "Full Body Calisthenics",
    "exercises": [
      {"name": "Burpees", "sets": "3", "reps": "10-15"},
      {"name": "Handstand holds", "sets": "3", "duration": "30 seconds"},
      {"name": "Leg Raises", "sets": "3", "reps": "15-20"}
    ]
  },
  "day5": {
    "focus": "Swimming",
    "exercises": [
      {"name": "Freestyle laps", "distance": "1000m", "notes": "Focus on technique"},
      {"name": "Kickboard drills", "distance": "200m"}
    ]
  },
  "day6": {
    "focus": "Outdoor Activity / Long Endurance",
    "exercises": [
      {"name": "Long distance run/hike", "duration": "90 minutes", "notes": "Enjoy nature, maintain steady pace"}
    ]
  },
  "day7": {
    "focus": "Rest Day",
    "exercises": [
      {"name": "Light Stretching", "duration": "10 minutes"},
      {"name": "Foam Rolling", "duration": "10 minutes"}
    ]
  }
};


app.post('/api/generate-plan', async (req, res) => {
  const { height, weight, goals } = req.body;

  if (!height || !weight || !goals) {
    return res.status(400).json({ error: 'Missing height, weight, or goals in request body.' });
  }

  try {
    const prompt = `Act as an elite sports scientist. Generate a comprehensive 7-day workout plan strictly formatted as a JSON object.
The user is ${height} tall, weighs ${weight} lbs, and their goals are: ${goals}.
Your output MUST adhere precisely to the following JSON structure, including all keys and nesting for each of the 7 days:

${JSON.stringify(WEEK_PLAN_EXAMPLE, null, 2)}

Ensure all keys (day1, day2, focus, exercises, name, sets, reps, duration, intensity, distance, notes) are present and correctly typed for each day's plan. Provide specific exercises and appropriate sets/reps/duration based on the user's goals. If a field is not applicable for a specific exercise, you can omit it or use null, but the overall structure for the day must remain.`

    const result = await model.generateContent(prompt);
let rawText = result.response.text();

// THE FIX: Strip out the markdown formatting
rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

const planData = JSON.parse(rawText);
res.json(planData);

    // Attempt to parse the text as JSON. The model is instructed to return JSON.
    let workoutPlan;
    try {
      workoutPlan = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", text);
      return res.status(500).json({ error: "Failed to generate a valid JSON workout plan from AI.", raw_ai_response: text });
    }

    res.json(workoutPlan);

  } catch (error) {
    console.error('Error generating workout plan:', error);
    res.status(500).json({ error: 'Failed to generate workout plan.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
