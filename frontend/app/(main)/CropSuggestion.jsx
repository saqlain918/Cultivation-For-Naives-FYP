import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";

const CropPrediction = () => {
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [ph, setPh] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getPrediction = async () => {
    // Validate all fields are filled
    if (
      !nitrogen ||
      !phosphorus ||
      !potassium ||
      !temperature ||
      !humidity ||
      !ph ||
      !rainfall
    ) {
      Alert.alert("Missing Data", "Please fill in all fields.");
      return;
    }

    // Validate inputs are numeric
    const data = [
      parseFloat(nitrogen),
      parseFloat(phosphorus),
      parseFloat(potassium),
      parseFloat(temperature),
      parseFloat(humidity),
      parseFloat(ph),
      parseFloat(rainfall),
    ];
    if (data.some(isNaN)) {
      Alert.alert("Invalid Input", "All fields must be numeric.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.18.135:5001/predict", // Replace with your API URL
        { data: data },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Parse the API response
      const predictionData = response.data;
      if (
        predictionData &&
        predictionData["1"] &&
        predictionData["2"] &&
        predictionData["3"]
      ) {
        const parsedPredictions = ["1", "2", "3"].map((key) => {
          // Extract crop and probability from string like "('cotton', 0.9571103434535417)"
          const match = predictionData[key].match(/\('(.+?)',\s*([\d.]+)\)/);
          if (!match) {
            throw new Error(`Invalid response format for key ${key}`);
          }
          const crop = match[1];
          const probability = parseFloat(match[2]) * 100; // Convert to percentage
          return { crop, probability };
        });
        setPrediction(parsedPredictions);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error fetching prediction:", error);
      Alert.alert("Error", "Failed to get prediction. Please try again.");
      setPrediction(null);
    }
    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Crop Suggestions</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nitrogen (N) - نائٹروجن</Text>
          <TextInput
            style={styles.input}
            placeholder="Nitrogen (N)"
            value={nitrogen}
            onChangeText={setNitrogen}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phosphorus (P) - فاسفورس</Text>
          <TextInput
            style={styles.input}
            placeholder="Phosphorus (P)"
            value={phosphorus}
            onChangeText={setPhosphorus}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Potassium (K) - پوٹاشیم</Text>
          <TextInput
            style={styles.input}
            placeholder="Potassium (K)"
            value={potassium}
            onChangeText={setPotassium}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Temperature (°C) - درجہ حرارت</Text>
          <TextInput
            style={styles.input}
            placeholder="Temperature (°C)"
            value={temperature}
            onChangeText={setTemperature}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Humidity (%) - نمی</Text>
          <TextInput
            style={styles.input}
            placeholder="Humidity (%)"
            value={humidity}
            onChangeText={setHumidity}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>pH - پی ایچ</Text>
          <TextInput
            style={styles.input}
            placeholder="pH"
            value={ph}
            onChangeText={setPh}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Rainfall (mm) - بارش</Text>
          <TextInput
            style={styles.input}
            placeholder="Rainfall (mm)"
            value={rainfall}
            onChangeText={setRainfall}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={getPrediction}>
          <Text style={styles.buttonText}>
            {isLoading ? "Fetching Suggestions..." : "Get Suggestions"}
          </Text>
        </TouchableOpacity>

        {prediction && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Suggested Crops :</Text>
            {prediction.map((item, index) => (
              <Text key={index} style={styles.resultText}>
                {item.crop}: {item.probability.toFixed(2)}%
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40, // Extra padding at the bottom for scrollable content
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#2E7D32",
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 18,
    color: "#2E7D32",
    marginBottom: 5,
  },
});

export default CropPrediction;
