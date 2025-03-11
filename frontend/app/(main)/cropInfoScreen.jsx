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

const CropInfoScreen = () => {
  const [selectedCropInfo, setSelectedCropInfo] = useState(null); // Store the selected crop information
  const [loading, setLoading] = useState(false); // For loading state

  const { bestCrop } = useLocalSearchParams();

  // Handle fetching crop info based on user input
  const fetchCropInfo = async () => {
    setLoading(true);

    // Check if the crop exists in static data
    try {
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/crop-details/crop-info`,
        {
          crop: bestCrop,
        }
      );

      setSelectedCropInfo(res.data);
    } catch (error) {
      Alert.alert("Error", error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCropInfo();
  }, []);

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

      {/* Input Field to Enter Crop Name */}

      <Text style={styles.bestCropText}>{bestCrop}</Text>

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
        <Text style={styles.errorText}>No information available</Text>
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
  input: {
    height: 50,
    borderColor: "#388E3C",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingLeft: 10,
    fontSize: 16,
    color: "#388E3C",
  },
  button: {
    backgroundColor: "#388E3C",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
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
  },
  bestCropText: {
    fontSize: 30, // Adjust font size
    fontWeight: "bold", // Make the text bold
    color: "green", // Use a green color
    marginVertical: 10, // Add space above and below the text
    textAlign: "center", // Center the text horizontally
  },
});

export default CropInfoScreen;
