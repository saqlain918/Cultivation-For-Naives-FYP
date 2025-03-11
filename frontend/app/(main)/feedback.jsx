import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";

const FeedbackScreen = () => {
  const { expertId, expertName } = useLocalSearchParams(); // Get expertId and expertName from navigation
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState("");

  const submitFeedback = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter your feedback.");
      return;
    }
    if (rating && (isNaN(rating) || rating < 1 || rating > 5)) {
      Alert.alert("Error", "Rating must be a number between 1 and 5.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/feedback`,
        {
          expertId,
          userId: "67cce41c98488183a1f55978", // Replace with actual authenticated user ID
          message,
          rating: rating ? parseInt(rating) : null,
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Feedback submitted successfully!");
        setMessage("");
        setRating("");
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to submit feedback."
        );
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    }
  };

  return (
    <LinearGradient
      colors={["#78e08f", "#b8e994"]} // Gradient from green to light green
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Feedback for {expertName} 🌟</Text>
        <Text style={styles.subtitle}>
          Help us improve by sharing your thoughts!
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your feedback here"
          placeholderTextColor="#888"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={styles.ratingInput}
          placeholder="Rating (1-5, optional)"
          placeholderTextColor="#888"
          value={rating}
          onChangeText={setRating}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.submitButton} onPress={submitFeedback}>
          <LinearGradient
            colors={["#ff9f1a", "#ffaf40"]} // Gradient button from orange to light orange
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Submit Feedback</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10, // For Android shadow
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  ratingInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  gradientButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FeedbackScreen;
