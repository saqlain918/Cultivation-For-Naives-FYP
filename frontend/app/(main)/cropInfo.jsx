import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import Picker

const CropInfoScreen = () => {
  const [selectedCropInfo, setSelectedCropInfo] = useState(null); // Store the selected crop information
  const [loading, setLoading] = useState(false); // For loading state
  const [selectedCrop, setSelectedCrop] = useState(""); // Store the dropdown selection

  const { bestCrop } = useLocalSearchParams();

  // Static list of crops for the dropdown
  const cropOptions = [
    { label: "Select a Crop", value: "" },
    { label: "Sugarcane", value: "Sugarcane" },
    { label: "Wheat", value: "Wheat" },
    { label: "Rice", value: "Rice" },
    { label: "Cotton", value: "Cotton" },
    { label: "Maize", value: "Maize" },
  ];

  // Handle fetching crop info based on selected crop
  const fetchCropInfo = async (crop) => {
    if (!crop) {
      setSelectedCropInfo(null); // Clear info if no crop is selected
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/crop-details/crop-info`,
        { crop }
      );
      setSelectedCropInfo(res.data);
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to fetch info for ${crop}: ${error.message}`
      );
      setSelectedCropInfo(null);
    }
    setLoading(false);
  };

  // Set initial crop from bestCrop and fetch its info
  useEffect(() => {
    if (bestCrop && cropOptions.some((option) => option.value === bestCrop)) {
      setSelectedCrop(bestCrop);
      fetchCropInfo(bestCrop);
    }
  }, [bestCrop]);

  // Handle dropdown selection change
  const handleCropChange = (crop) => {
    setSelectedCrop(crop);
    fetchCropInfo(crop);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crop Information</Text>

      {/* Dropdown for Crop Selection */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCrop}
          onValueChange={(itemValue) => handleCropChange(itemValue)}
          style={styles.picker}
        >
          {cropOptions.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>

      {/* Display the Crop Information */}
      {selectedCropInfo ? (
        <>
          <View style={styles.section}>
            <Text style={styles.subtitle}>Soil Preparation</Text>
            <Text style={styles.content}>
              {selectedCropInfo.soilPreparation}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.subtitle}>Use of Vehicles/Equipment</Text>
            <Text style={styles.content}>{selectedCropInfo.vehicleUsage}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.subtitle}>Crop Growth Timeline</Text>
            {selectedCropInfo.growthTimeline.map((stage, index) => (
              <View key={index} style={styles.timelineItem}>
                <Text style={styles.timelineStage}>{stage.stageName}:</Text>
                <Text style={styles.content}>{stage.description}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.subtitle}>
              Fertilizer and Watering Information
            </Text>
            <Text style={styles.content}>
              <Text style={styles.bold}>Fertilizer:</Text>{" "}
              {selectedCropInfo.fertilizer}
            </Text>
            <Text style={styles.content}>
              <Text style={styles.bold}>Water Requirements:</Text>{" "}
              {selectedCropInfo.waterInfo}
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.errorText}>
          {selectedCrop ? "No information available" : "Please select a crop"}
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#E8F5E9",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#388E3C",
    textAlign: "center",
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#388E3C",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    color: "#388E3C",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  timelineItem: {
    marginBottom: 10,
  },
  timelineStage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  bold: {
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default CropInfoScreen;
