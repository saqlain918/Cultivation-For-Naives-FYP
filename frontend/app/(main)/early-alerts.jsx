import React from "react";
import { View, Text, StyleSheet } from "react-native";

const EarlyAlerts = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Early Alerts</Text>
      <Text style={styles.content}>
        Receive early warnings for potential pests, diseases, or weather
        challenges.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    color: "#555",
  },
});

export default EarlyAlerts;
