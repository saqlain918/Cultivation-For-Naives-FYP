import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

const UserProfile = () => {
  const profileData = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(profileData);

  const getUserData = async () => {
    setLoading(true);
    const res = await axios.post(
      `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/auth/get-profile`,
      { email: profileData.email }
    );
    setUserData(res.data.user);
    setLoading(false);
  };

  useEffect(() => {
    getUserData();
  }, []);

  return loading ? (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#4CAF50" />
    </View>
  ) : (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/icons/bell.png")} // Dummy profile picture
          style={styles.avatar}
        />
        <Text style={styles.name}>{userData?.name}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
      </View>
      {/* Info Section */}
      <View style={styles.infoSection}>
        {renderInfoRow("Age", userData?.age)}
        {renderInfoRow("Gender", userData?.gender)}
        {renderInfoRow("CNIC", userData?.cnic)}
        {renderInfoRow("Phone No", userData?.phoneNumber)}
        {renderInfoRow("Address", userData?.address)}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({ pathname: "/update-profile", params: userData })
        }
      >
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push({ pathname: "/login", params: userData })}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Helper function to render each info row
const renderInfoRow = (label, value) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8f5e9", // Light green background
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
  },
  header: {
    alignItems: "center",
    marginVertical: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#4caf50", // Green accent on the left
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#4caf50", // Green border for avatar
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32", // Darker green for text
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  infoSection: {
    marginTop: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#4caf50", // Green accent
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1b5e20", // Green text for labels
  },
  infoValue: {
    fontSize: 16,
    color: "#555",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: { color: "#fff", fontSize: 16 },
});

export default UserProfile;
