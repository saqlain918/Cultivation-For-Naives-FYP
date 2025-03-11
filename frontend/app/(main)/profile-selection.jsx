import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

const ProfileSelection = () => {
  const router = useRouter();

  const handleProfileSelect = (profileType) => {
    router.push(`/signup?type=${profileType}`); // Passing query parameter 'type'
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Profile</Text>
      <Text style={styles.subtitle}>Who are you?</Text>

      {/* Farmer Option */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleProfileSelect("farmer")}
      >
        <Image
          source={require("../../assets/icons/farmer.png")}
          style={styles.icon}
        />
        <Text style={styles.cardText}>Farmer</Text>
      </TouchableOpacity>

      {/* Vendor Option */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleProfileSelect("vendor")}
      >
        <Image
          source={require("../../assets/icons/vendor.png")}
          style={styles.icon}
        />
        <Text style={styles.cardText}>Vendor</Text>
      </TouchableOpacity>

      {/* Expert Option */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleProfileSelect("expert")}
      >
        <Image
          source={require("../../assets/icons/expert.png")}
          style={styles.icon}
        />
        <Text style={styles.cardText}>Expert</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#E8F5E9", // Light green background
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32", // Dark green for the title
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#388E3C", // Medium green for the subtitle
    marginBottom: 30,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "90%",
    padding: 20,
    marginBottom: 15,
    backgroundColor: "#FFFFFF", // White card background
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 15,
    //tintColor: "#43A047", // Green tint for icons
  },
  cardText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32", // Dark green for card text
  },
});

export default ProfileSelection;
