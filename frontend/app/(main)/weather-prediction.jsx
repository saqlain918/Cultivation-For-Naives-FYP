import axios from "axios";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import { LineChart } from "react-native-chart-kit";

const WeatherForecastScreen = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  const getLocation = async () => {
    console.log("Requesting location permission...");
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Location permission is required to fetch weather data."
      );
      return;
    }
    console.log("Fetching location...");
    let loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;
    console.log("Location fetched:", latitude, longitude);
    setLocation({ latitude, longitude });
  };

  useEffect(() => {
    console.log("Initializing location fetch...");
    getLocation();
  }, []);

  const fetchWeatherData = async () => {
    if (!location) {
      Alert.alert(
        "Location Unavailable",
        "Please wait while we fetch your location or try again."
      );
      return;
    }

    try {
      setLoading(true);
      console.log(
        "Fetching weather for:",
        location.latitude,
        location.longitude
      );
      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            daily:
              "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
            timezone: "auto",
          },
        }
      );
      console.log("Weather response:", weatherRes.data);
      setWeatherData(weatherRes.data.daily);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      Alert.alert("Error", "Error fetching weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(2, 136, 209, ${opacity})`, // Matches theme
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#0288D1",
    },
  };

  const screenWidth = Dimensions.get("window").width - 40; // Adjust for padding

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>7-Day Weather Forecast</Text>
      <TouchableOpacity style={styles.button} onPress={fetchWeatherData}>
        <Text style={styles.buttonText}>Get Weather for Your Location</Text>
      </TouchableOpacity>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : weatherData ? (
        <View style={styles.weatherContainer}>
          {/* Temperature Chart */}
          <Text style={styles.chartTitle}>Temperature Forecast (°C)</Text>
          <LineChart
            data={{
              labels: weatherData.time.map((date) =>
                new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              ),
              datasets: [
                {
                  data: weatherData.temperature_2m_max,
                  color: (opacity = 1) => `rgba(239, 83, 80, ${opacity})`, // Red for max temp
                  strokeWidth: 2,
                },
                {
                  data: weatherData.temperature_2m_min,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`, // Blue for min temp
                  strokeWidth: 2,
                },
              ],
              legend: ["Max Temp", "Min Temp"],
            }}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          {/* Precipitation Chart */}
          <Text style={styles.chartTitle}>Precipitation Forecast (mm)</Text>
          <LineChart
            data={{
              labels: weatherData.time.map((date) =>
                new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              ),
              datasets: [
                {
                  data: weatherData.precipitation_sum,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green for precipitation
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          {/* Weather Cards */}
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
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0288D1",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default WeatherForecastScreen;
