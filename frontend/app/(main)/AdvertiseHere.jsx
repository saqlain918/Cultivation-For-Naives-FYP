import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ImageBackground,
} from "react-native";

const AdvertiseHere = () => {
  const adminDetails = {
    name: "John Doe",
    email: "admin@example.com",
    phone: "+1 (555) 123-4567",
    website: "https://example.com/contact",
  };

  const handleEmailPress = () => {
    Linking.openURL(
      `mailto:${adminDetails.email}?subject=Ad Upload Request`
    ).catch((err) => console.error("Failed to open email:", err));
  };

  const handlePhonePress = () => {
    Linking.openURL(`tel:${adminDetails.phone}`).catch((err) =>
      console.error("Failed to open phone:", err)
    );
  };

  const handleWebsitePress = () => {
    Linking.openURL(adminDetails.website).catch((err) =>
      console.error("Failed to open website:", err)
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/icons/adds.png")} // Update this path
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Advertise Here</Text>
        </View>
        <View style={styles.centeredContainer}>
          <View style={styles.adminCard}>
            <Text style={styles.sectionTitle}>Contact Admin</Text>
            <Text style={styles.adminInfo}>Name: {adminDetails.name}</Text>
            <TouchableOpacity onPress={handleEmailPress}>
              <Text style={styles.adminLink}>Email: {adminDetails.email}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePhonePress}>
              <Text style={styles.adminLink}>Phone: {adminDetails.phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleWebsitePress}>
              <Text style={styles.adminLink}>
                Website: {adminDetails.website}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Dark overlay for readability
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  adminCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 50,
    marginHorizontal: 15,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    width: "90%", // Adjust width as needed
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 20,
    textAlign: "center",
  },
  adminInfo: {
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
    fontWeight: "500",
  },
  adminLink: {
    fontSize: 16,
    color: "#1B5E20",
    textDecorationLine: "underline",
    marginBottom: 12,
    fontWeight: "500",
  },
});

export default AdvertiseHere;
