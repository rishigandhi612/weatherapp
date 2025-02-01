import { GoogleGenerativeAI } from "@google/generative-ai";

// Function definitions for the AI model
const functionDefinitions = [
  {
    name: "getWeatherData",
    description: "Get weather data for a specified city",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "Name of the city"
        }
      },
      required: ["city"]
    }
  },
  {
    name: "convertINRtoUSD",
    description: "Convert amount from INR to USD",
    parameters: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "Amount in INR to convert"
        }
      },
      required: ["amount"]
    }
  }
];

// Weather API helper function
async function getWeather(city) {
  const owapiKey = process.env.OW_API_KEY;
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${owapiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      city: data.name,
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      windspeed: data.wind.speed
    };
  } catch (error) {
    console.error("Weather API error:", error);
    throw new Error("Failed to fetch weather data");
  }
}

// Currency conversion helper function
async function convertINRtoUSD(amount) {
  try {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
    
    if (!response.ok) {
      throw new Error(`Exchange rate API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    const exchangeRate = data?.rates?.USD;
    
    if (!exchangeRate) {
      throw new Error("Failed to get exchange rate");
    }
    
    return {
      amount: (amount * exchangeRate).toFixed(2),
      exchangeRate: exchangeRate
    };
  } catch (error) {
    console.error("Currency conversion error:", error);
    throw new Error("Failed to convert currency");
  }
}

// Initialize Google AI with proper error handling
function initializeAI() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Google API key not configured");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: "You're AI ASSISTANT",
  });
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { city } = body;
    
    if (!city) {
      return { error: "City parameter is required" };
    }

    const model = initializeAI();
    
    // Start chat with function declarations
    const chat = await model.startChat({
      tools: [{
        functionDeclarations: functionDefinitions,
      }]
    });

    const result = await chat.sendMessage(city);
    
    // Check if result has content before accessing
    if (!result || !result.response || !result.response.candidates || !result.response.candidates[0]) {
      throw new Error("Invalid response from AI model");
    }

    const candidate = result.response.candidates[0];
    
    // Check if we have a function call
    if (candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].functionCall) {
      const functionCall = candidate.content.parts[0].functionCall;
      
      switch (functionCall.name) {
        case "getWeatherData": {
          const weatherData = await getWeather(functionCall.args.city);
          // Create a text prompt for the AI with the weather data
          const weatherPrompt = `Weather data for ${functionCall.args.city}: ${JSON.stringify(weatherData)}`;
          const aiResponse = await model.generateContent([weatherPrompt]);
          console.log('AI Response:', aiResponse.response.text());
          return{type: 'weather',
            data:aiResponse.response.text()
          } 
        }
        
        case "convertINRtoUSD": {
          const { amount } = functionCall.args;
          
          let amountData = await convertINRtoUSD(amount);
          const currencyPrompt = `Currency data for ${functionCall.args.amount}: ${JSON.stringify(amountData)}`;
          const aiResponse = await model.generateContent([currencyPrompt]);
          console.log('AI Response:', aiResponse.response.text());
          return{type: 'currency',
            data:aiResponse.response.text()
          } 

        }
        
        default:
          throw new Error(`Unknown function call: ${functionCall.name}`);
      }
    }

    // If no function call, return the text response
    return {
      response: candidate.content?.parts[0]?.text || "No response generated"
    };
    
  } catch (error) {
    console.error("Request processing error:", error);
    return {
      error: error.message,
      status: 500
    };
  }
});