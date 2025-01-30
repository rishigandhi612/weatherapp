<template>
    <v-container>
      <v-btn @click="fetchWeather()">get dubai weather</v-btn>
      <v-card v-if="weatherData" class="mt-2">
        <v-card-title>
          Fetched Forecast for: {{ weatherData?.location || "Unknown Location" }}
        </v-card-title>
        <v-card-text>
          <p v-if="weatherData.current">Current- </p>
          <p v-if="weatherData.current.condition">Condition: {{ weatherData.current.condition }}</p>
          <p v-if="weatherData.current.temperature">Temperature: {{ weatherData.current.temperature }}</p>
          <p v-if="weatherData.current.humidity">Humidity: {{ weatherData.current.humidity }}</p>
          <p v-if="weatherData.current.wind_speed">Wind Speed: {{ weatherData.current.wind_speed }}</p>
          <p v-if="weatherData.forecast">Tomorrow-</p>
          <p v-if="weatherData.forecast.tomorrow.condition">Tomorrow Condition: {{ weatherData.forecast.tomorrow.condition }}</p>
          <p v-if="weatherData.forecast.tomorrow.temperature">Tomorrow temperature: {{ weatherData.forecast.tomorrow.temperature }}°C</p>
          <p v-if="weatherData.forecast.tomorrow.humidity">Tomorrow humidity: {{ weatherData.forecast.tomorrow.humidity }}</p>
          <p v-if="weatherData.forecast.tomorrow.wind_speed">Tomorrow wind_speed: {{ weatherData.forecast.tomorrow.wind_speed }}</p>
          
        </v-card-text>
      </v-card>
  
      <v-alert v-if="loading" type="info" class="mt-2">Fetching weather data...</v-alert>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const weatherData = ref(null)
  let loading = ref(false)
  
  const fetchWeather = async () => {
    loading.value = true
    try {
      const response = await fetch(`/api/weather`)
      const result = await response.json()
      console.log('API Response:', result)
      weatherData.value = result
    } catch (error) {
      console.error('Error fetching weather:', error)
      weatherData.value = { error: "Failed to fetch weather data" }
    } finally {
      loading.value=false
    }
  }
  
  </script>
  