import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ToastAndroid,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Email regex for validation
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
// Password regex for at least 8 characters, one uppercase letter, and one special character
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

const Login = () => {
  const [email, setEmail] = useState(""); // To hold the email input value
  const [password, setPassword] = useState(""); // To hold the password input value
  const [loading, setLoading] = useState(false); // For loading state

  // Handle Login button press
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both email and password.");
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long and contain at least one uppercase letter and one special character."
      );
      return;
    }

    try {
      setLoading(true);
      //console.log("sdhdfd");
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/auth/login`,
        {
          email,
          password,
        }
      );

      //console.log("working");

      if (!res.data.success) {
        ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
        return;
      }

      // Store token in AsyncStorage
      await AsyncStorage.setItem("token", res.data.token);

      // Check if user is admin and navigate accordingly
      if (res.data.user.isAdmin) {
        router.replace("/adhome"); // Navigate to Admin Home page
      } else {
        router.replace({
          pathname:
            res.data.user.type === "vendor"
              ? "/ven"
              : res.data.user.type === "expert"
              ? "/expert"
              : "/Home",
          params: {
            id: res.data.user._id,
            name: res.data.user.name,
            email: res.data.user.email,
            age: res.data.user.age,
            gender: res.data.user.gender,
            cnic: res.data.user.cnic,
            phoneNumber: res.data.user.phoneNumber,
            address: res.data.user.address,
          },
        }); // Navigate to regular Home page
      }
    } catch (error) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo at the Top */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/icons/cultii1.png")} // Replace with your logo path
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>Login</Text>

      {/* Email Input */}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
      />
      {/* Password Input */}
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        style={styles.input}
        secureTextEntry
      />
      {/* Login Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Logging in..." : "Login"}
          onPress={handleLogin}
          color="#6A9E00" // Green button color
          disabled={loading} // Disable the button when loading
        />
      </View>
      {/* Forgot Password Link */}
      <TouchableOpacity
        onPress={() => router.push("/forgot-password")}
        style={styles.forgotPasswordContainer}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
      {/* Sign Up Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Sign Up"
          onPress={() => router.push("/profile-selection")}
          color="#6A9E00" // Green button color
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f9f9f9",
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  logo: {
    width: 200, // Adjust width to fit your design
    height: 200, // Adjust height to fit your design
    resizeMode: "contain", // Ensures the image scales proportionally
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    width: "100%",
  },
  buttonContainer: {
    marginVertical: 10,
    width: "100%",
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  forgotPasswordText: {
    color: "#007BFF", // Blue color
    textDecorationLine: "underline",
    fontSize: 16,
    marginBottom: 15,
  },
});

export default Login;
