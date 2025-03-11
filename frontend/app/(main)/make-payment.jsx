import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MakePayment = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Make Payment</Text>
      <Text style={styles.content}>
        Choose your preferred payment method to proceed with transactions.
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

export default MakePayment;
