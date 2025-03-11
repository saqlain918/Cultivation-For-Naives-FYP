import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import { router } from "expo-router";
import RNPickerSelect from "react-native-picker-select";

const CropSuggestion = () => {
  const [province, setProvince] = useState("");
  const [season, setSeason] = useState("");
  const [bestCrop, setBestCrop] = useState();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to get the best crop suggestion
  const getBestCrop = async () => {
    if (!province || !season) {
      Alert.alert("Missing Data", "Please enter both province and season.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/crops/get-best-crop`,
        {
          params: { province, season },
        }
      );

      if (response.data.bestCrop) {
        setBestCrop(response.data.bestCrop);
      } else {
        Alert.alert("No Crop Found", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching crop:", error);
      Alert.alert("Error", "Failed to fetch crop suggestion.");
    }
    setIsLoading(false);
  };

  // Function to save the suggestion
  const saveSuggestion = async () => {
    if (!province || !season || !bestCrop) {
      Alert.alert("Missing Data", "Please complete all fields.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/crops/cropSuggestions`,
        {
          province,
          season,
          bestCrop: bestCrop[0].crop,
        }
      );

      if (response.data.message) {
        Alert.alert("Success", response.data.message);
        setSubmitted(true);
        router.push({
          pathname: "/cropInfoScreen",
          params: {
            bestCrop: bestCrop[0].crop,
          },
        });
      }
    } catch (error) {
      console.error("Error saving crop:", error);
      Alert.alert("Error", "Failed to save crop suggestion.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crop Suggestion</Text>
      <RNPickerSelect
        onValueChange={(value) => setProvince(value)}
        items={[
          { label: "Punjab", value: "Punjab" },
          { label: "Sindh", value: "Sindh" },
          { label: "KPK", value: "KPK" },
          { label: "Balochistan", value: "Balochistan" },
        ]}
        style={{
          inputIOS: styles.input,
          inputAndroid: styles.input,
        }}
        placeholder={{
          label: "Choose a province...",
          value: null,
          color: "#9EA0A4",
        }}
      />
      <RNPickerSelect
        onValueChange={(value) => setSeason(value)}
        items={[
          { label: "Summer", value: "Summer" },
          { label: "Winter", value: "Winter" },
        ]}
        style={{
          inputIOS: styles.input,
          inputAndroid: styles.input,
        }}
        placeholder={{
          label: "Choose a season...",
          value: null,
          color: "#9EA0A4",
        }}
      />
      <TouchableOpacity style={styles.button} onPress={getBestCrop}>
        <Text style={styles.buttonText}>
          {isLoading ? "Loading..." : "Get Crops"}
        </Text>
      </TouchableOpacity>
      {/* {bestCrop && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Best Crop: {bestCrop}</Text>
        </View>
      )} */}
      {bestCrop?.map((item, index) => {
        return (
          <View style={styles.resultContainer} key={index}>
            <Text style={styles.resultText}>
              Crop {index + 1}: {item.crop}
            </Text>
          </View>
        );
      })}
      {/* {!submitted && (
        <TouchableOpacity style={styles.saveButton} onPress={saveSuggestion}>
          <Text style={styles.buttonText}>Save Suggestion</Text>
        </TouchableOpacity>
      )}
      {submitted && <Text style={styles.successText}>Suggestion Saved!</Text>} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#E8F5E9" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#8BC34A",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16 },
  resultContainer: { marginBottom: 20 },
  resultText: { fontSize: 18, fontWeight: "bold", color: "#2E7D32" },
  successText: { fontSize: 18, color: "green", textAlign: "center" },
});

export default CropSuggestion;
