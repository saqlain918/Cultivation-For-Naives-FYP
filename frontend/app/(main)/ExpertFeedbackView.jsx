import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const ExpertFeedbackView = () => {
  const { expertId } = useLocalSearchParams();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      console.log("Fetching feedback for expertId:", expertId);
      if (!expertId || expertId === "undefined") {
        console.log("Invalid expertId");
        setError("No expert ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/feedback/expert/${expertId}`
        );
        console.log("Response:", response.data);

        if (response.data.success && Array.isArray(response.data.data)) {
          setFeedbackList(response.data.data);
        } else {
          setError(response.data.message || "No feedback data found");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load feedback"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [expertId]);

  const renderFeedback = ({ item }) => (
    <View style={styles.feedbackCard}>
      <LinearGradient
        colors={["rgba(240, 236, 236, 0.95)", "rgba(113, 116, 119, 0.95)"]}
        style={styles.gradientContainer}
      >
        <View style={styles.headerRow}>
          <View style={styles.ratingBubble}>
            <Text style={styles.ratingText}>{item.rating || "N/A"}</Text>
            {item.rating && <Text style={styles.star}>★</Text>}
          </View>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.messageText}>{item.message}</Text>
      </LinearGradient>
    </View>
  );

  return (
    <ImageBackground
      source={require("../../assets/icons/fview.png")} // Add your image path here
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Expert Feedback</Text>
          <Text style={styles.subtitle}>
            {feedbackList.length}{" "}
            {feedbackList.length === 1 ? "Review" : "Reviews"}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#ffffff"
            style={styles.loader}
          />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                setError(null);
                fetchFeedback();
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : feedbackList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No feedback yet</Text>
            <Text style={styles.emptySubtext}>
              Your great work will soon be recognized!
            </Text>
          </View>
        ) : (
          <FlatList
            data={feedbackList}
            keyExtractor={(item) =>
              item._id?.toString() || Math.random().toString()
            }
            renderItem={renderFeedback}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent overlay for readability
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#ffffff",
    marginTop: 5,
  },
  feedbackCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  gradientContainer: {
    padding: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B5E20",
    marginRight: 4,
  },
  star: {
    fontSize: 16,
    color: "#ffffff",
  },
  dateText: {
    fontSize: 12,
    color: "#666",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  loader: {
    marginTop: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#ffffff",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
});

export default ExpertFeedbackView;
