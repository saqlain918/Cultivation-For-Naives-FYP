import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";

const FeedbackScreen = () => {
  const { expertId, expertName, userId } = useLocalSearchParams(); // Assume userId from navigation or auth
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0); // Rating from 0 (none) to 5
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter your feedback.");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User ID is missing. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/feedback`,
        {
          expertId,
          userId,
          message,
          rating: rating || null,
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Feedback submitted successfully!");
        setMessage("");
        setRating(0);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to submit feedback."
        );
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarPress = (starValue) => {
    setRating(starValue);
  };

  return (
    <LinearGradient colors={["#78e08f", "#b8e994"]} style={styles.container}>
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
          textAlignVertical="top"
        />

        <View style={styles.starContainer}>
          <Text style={styles.ratingLabel}>Rate this expert:</Text>
          <View style={styles.starsWrapper}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleStarPress(star)}
                style={styles.starButton}
              >
                <Text style={styles.star}>{star <= rating ? "★" : "☆"}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={submitFeedback}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={["#ff9f1a", "#ffaf40"]}
            style={styles.gradientButton}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit Feedback</Text>
            )}
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
    backgroundColor: "#f0f0f0",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#2E7D32",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 25,
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#fafafa",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  ratingLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  starsWrapper: {
    flexDirection: "row",
    marginLeft: 10,
  },
  starButton: {
    padding: 5, // Reduced padding for tighter spacing
  },
  star: {
    fontSize: 28, // Slightly smaller stars for balance
    color: "#ff9f1a",
  },
  submitButton: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default FeedbackScreen;
