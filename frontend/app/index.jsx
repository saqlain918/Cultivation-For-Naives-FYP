import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ImageBackground, Image } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SplashScreen = () => {
  const [token, setToken] = useState(null);

  const getToken = async () => {
    setToken(await AsyncStorage.getItem("token"));
  };

  useEffect(() => {
    // Navigate to Login Screen after 3 seconds
    getToken();

    setTimeout(() => {
      router.replace(token ? "/Home" : "/login");
    }, 3000);
  }, []);

  return (
    <ImageBackground
      source={require("../assets/images/background-pattern.png")} // Replace this with your custom background image
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Logo */}
        {/* <Image
          source={require("../assets/images/logo.png")} // Replace with your project logo
          style={styles.logo}
        /> */}
        {/* Project Name */}
        <Text style={styles.title}>Cultivation for Naives</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Slight overlay effect
  },
  logo: {
    width: 120, // Adjust based on your logo size
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
});

export default SplashScreen;
