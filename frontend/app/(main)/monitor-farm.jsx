import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

const MonitorFarm = () => {
  const router = useRouter(); // Initialize the router for navigation

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitor Farm</Text>

      {/* Options Section */}
      <View style={styles.optionsContainer}>
        {/* Cultivation Suggestion */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => router.push("/CropSuggestion")}
        >
          <Image
            source={require("../../assets/icons/cultivation.png")} // Replace with your actual icon
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>Cultivation Suggestion</Text>
        </TouchableOpacity>

        {/* Update Fertilizer */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => router.push("/cropInfo")} // Correct route
        >
          <Image
            source={require("../../assets/icons/fertilizer.png")} // Replace with your actual icon
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>Crop Info Screen</Text>
        </TouchableOpacity>

        {/* Farm Dashboard */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => router.push("/FarmDashboard")} // Correct the route
        >
          <Image
            source={require("../../assets/icons/dashboard.png")} // Replace with your actual icon
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>Farm Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E8F5E9", // Light green background
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 30,
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 20,
  },
  optionCard: {
    backgroundColor: "#fff",
    width: "45%", // Adjust width for better layout
    padding: 15,
    borderRadius: 15, // Rounded corners
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionIcon: {
    width: 70, // Increased size for better visibility
    height: 70,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32", // Match the green theme
    textAlign: "center",
  },
});

export default MonitorFarm;
