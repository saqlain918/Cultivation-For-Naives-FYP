import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";

const AlertsScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        console.log(
          "Fetching alerts from:",
          `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/alert`
        );
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/alert`
        );
        console.log("API response:", response.data);
        setAlerts(response.data);
        setError("");
      } catch (err) {
        const errorMsg = `Failed to load alerts: ${err.message}`;
        console.error("Fetch error:", err);
        setError(errorMsg);
      }
    };
    fetchAlerts();
  }, [retry]);

  const renderAlert = ({ item }) => (
    <TouchableOpacity activeOpacity={0.8}>
      <View style={styles.alertCard}>
        <Text style={styles.alertTitle}>
          {item.type === "weather"
            ? `Weather Alert: ${item.weatherCondition}`
            : `${item.crop || "Unknown Crop"} - ${
                item.disease || "Unknown Disease"
              }`}
        </Text>
        <Text style={styles.alertText}>Region: {item.region}</Text>
        <Text style={styles.alertText}>{item.message}</Text>
        <Text style={styles.alertDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No Alerts Available</Text>
      <Text style={styles.emptySubText}>
        Check back later for crop disease or weather updates!
      </Text>
    </View>
  );

  const handleRetry = () => {
    setRetry(!retry);
    setError("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Alerts</Text>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <FlatList
        data={alerts}
        keyExtractor={(item) => item._id}
        renderItem={renderAlert}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#e6f0ea",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a3c34",
    textAlign: "center",
    marginBottom: 20,
  },
  errorContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  error: {
    color: "#d32f2f",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  alertCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a3c34",
    marginBottom: 8,
  },
  alertText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  alertDate: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#888",
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
});

export default AlertsScreen;
