import axios from "axios";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";

const WeatherForecastScreen = () => {
  const [cityName, setCityName] = useState(""); // Store the city name entered by the user
  const [weatherData, setWeatherData] = useState(null); // Store the weather data
  const [loading, setLoading] = useState(false); // For loading state

  // Fetch city coordinates first, then weather data
  const fetchWeatherData = async () => {
    if (!cityName) {
      alert("Please enter a city name.");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching coordinates for city:", cityName);

      // Step 1: Fetch latitude and longitude for the city using OpenWeatherMap API
      const cityRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            q: cityName,
            appid: "4c232eb1957cccd4a65fc16d37a6108c", // Replace with your API key
          },
        }
      );

      const { lat, lon } = cityRes.data.coord;
      console.log("Latitude:", lat, "Longitude:", lon);

      // Step 2: Fetch 7-day weather forecast using Open-Meteo API
      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast`,
        {
          params: {
            latitude: lat,
            longitude: lon,
            daily:
              "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
            timezone: "auto",
          },
        }
      );
      setWeatherData(weatherRes.data.daily); // Store daily weather data
    } catch (error) {
      console.error("Error fetching data:", error.message);
      alert("Error fetching weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>7-Day Weather Forecast</Text>

      {/* Input Field to Enter City Name */}
      <TextInput
        style={styles.input}
        placeholder="Enter City Name"
        value={cityName}
        onChangeText={setCityName}
      />

      {/* Button to Fetch Weather Data */}
      <TouchableOpacity style={styles.button} onPress={fetchWeatherData}>
        <Text style={styles.buttonText}>Get Weather</Text>
      </TouchableOpacity>

      {/* Display the Weather Data */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : weatherData ? (
        <View style={styles.weatherContainer}>
          {weatherData.time.map((date, index) => (
            <View key={index} style={styles.weatherCard}>
              <Text style={styles.date}>
                {new Date(date).toLocaleDateString()}
              </Text>
              <Text style={styles.temp}>
                Max: {weatherData.temperature_2m_max[index]}°C | Min:{" "}
                {weatherData.temperature_2m_min[index]}°C
              </Text>
              <Text style={styles.details}>
                Rain: {weatherData.precipitation_sum[index]} mm
              </Text>
              {/* Check if rain is expected */}
              <Text style={styles.details}>
                {weatherData.precipitation_sum[index] > 0
                  ? "Rain expected"
                  : "No rain expected"}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.errorText}>No data available</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#E3F2FD",
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0288D1",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#0288D1",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingLeft: 10,
    fontSize: 16,
    color: "#0288D1",
  },
  button: {
    backgroundColor: "#0288D1",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  weatherContainer: {
    marginTop: 10,
  },
  weatherCard: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    marginBottom: 15,
  },
  date: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0277BD",
    marginBottom: 5,
  },
  temp: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  details: {
    fontSize: 14,
    color: "#555",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});

export default WeatherForecastScreen;
