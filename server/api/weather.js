import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;
const owapiKey = process.env.OW_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 256,
  responseMimeType: "application/json",
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig,
});

const latlongschema=  { "latitude": "19.0760", "longitude": "72.8777" }

const getCoordinatesFromGemini = async (city) => {
  try {
    const prompt = `Get the latitude and longitude of ${city} in JSON format like this:${latlongschema}`;
    
    const response = await model.generateContent(prompt);
    const textResponse = response.response?.text();

    const jsonResponse = JSON.parse(textResponse);
    if (jsonResponse.latitude && jsonResponse.longitude) {
      return {
        lat: jsonResponse.latitude,
        lon: jsonResponse.longitude,
      };
    } else {
      throw new Error("error");
    }
  } catch (error) {
    console.error("error", error);
    return null;
  }
};

const getWeather = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${owapiKey}&units=metric`
    );
    const data = await response.json(); 
    // console.log(data);    
    return data;
  } catch (error) {
    console.error("error", error);
    return null;
  }
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { city } = body;

  const geoData = await getCoordinatesFromGemini(city);

  const weatherData = await getWeather(geoData.lat, geoData.lon);

  return {
    city,
    weather: weatherData,
  };
});
