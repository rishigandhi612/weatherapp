import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const schema = {
  location: "Pune",
  current: {
    condition: "Partly Cloudy",
    temperature: "28\u00b0C",
    feels_like: "27\u00b0C",
    humidity: "60%",
    wind_speed: "15 km/h",
    wind_direction: "West",
  },
  forecast: {
    today: { high: "32\u00b0C", low: "22\u00b0C", condition: "Mostly Sunny" },
    tomorrow: { high: "33\u00b0C", low: "23\u00b0C", condition: "Sunny" },
    day_after_tomorrow: {
      high: "34\u00b0C",
      low: "24\u00b0C",
      condition: "Partly Cloudy",
    },
  },
};

const prompt = `what is the weather in dubai today example:${schema}`;

const model = genAI.getGenerativeModel({
  model: "gemini-exp-1206",
  systemInstruction:
    "You're a current weather delivery system. With the place name recieved checkout the current weather their and also forecast the weather.",
  generationConfig: generationConfig,
});

export default defineEventHandler(async (event) => {
  let res = await model.generateContent(prompt);
  return res.response?.text();
});
