<template>
  <v-container>
    <!-- Input Field for City -->
    <v-text-field v-model="formData.city" label="Enter City Name" placeholder="City Name"></v-text-field>
    
    <!-- Button to Fetch Weather -->
    <v-btn @click="fetchWeather()" :loading="loading" block class="mt-2" color="primary">
      Get Weather
    </v-btn>

    <!-- Weather Display Card -->
    <v-card v-if="weatherData && !weatherData.error" class="mt-4">
      <v-card-title>Weather in {{ weatherData.name || "Unknown Location" }}</v-card-title>
      <v-card-text>
        <p><strong>Temperature:</strong> {{ weatherData.main?.temp }}°C</p>
        <p><strong>Feels Like:</strong> {{ weatherData.main?.feels_like }}°C</p>
        <p><strong>Humidity:</strong> {{ weatherData.main?.humidity }}%</p>
        <p><strong>Wind Speed:</strong> {{ weatherData.wind?.speed }} m/s</p>
        <p><strong>Condition:</strong> {{ weatherData.weather?.[0]?.description }}</p>
      </v-card-text>
    </v-card>

    <!-- Loading Alert -->
    <v-alert v-if="loading" type="info" class="mt-2">Fetching weather data...</v-alert>

    <!-- Error Message -->
    <v-alert v-if="weatherData?.error" type="error" class="mt-2">
      {{ weatherData.error }}
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, reactive } from "vue";

const weatherData = ref(null);
const loading = ref(false);

const formData = reactive({
  city: "",
});

const fetchWeather = async () => {
  if (!formData.city.trim()) {
    weatherData.value = { error: "Please enter a city name." };
    return;
  }

  loading.value = true;
  try {
    const response = await fetch("/api/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    console.log("API Response:", result);
    
    if (result.error) {
      weatherData.value = { error: result.error };
    } else {
      weatherData.value = result.weather; // Assign the 'weather' object from API response
    }
  } catch (error) {
    console.error("Error fetching weather:", error);
    weatherData.value = { error: "Failed to fetch weather data. Try again later." };
  } finally {
    loading.value = false;
  }
};
</script>
