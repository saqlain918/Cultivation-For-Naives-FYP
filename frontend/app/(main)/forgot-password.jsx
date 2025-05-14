import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios"; // Import Axios for HTTP requests

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); // OTP field state
  const [newPassword, setNewPassword] = useState(""); // New password field state
  const [step, setStep] = useState(1); // To track the step in the process
  const router = useRouter(); // Replace with your API URL

  // Send OTP to email
  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    try {
      // Send a request to the backend to send OTP to the user's email
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/email/send-otp`,
        {
          email,
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "OTP sent to your email.");
        setStep(2); // Move to OTP verification step
      } else {
        Alert.alert("Error", response.data.message || "Failed to send OTP.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while sending OTP.");
      console.error(error);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }

    try {
      // Send a request to the backend to verify the OTP
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/email/verify-otp`,
        {
          email,
          otp,
        }
      );

      if (response.status === 200) {
        setStep(3); // Move to password reset step
      } else {
        Alert.alert("Error", "Invalid OTP. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while verifying OTP.");
      console.error(error);
    }
  };

  // Reset Password
  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }

    try {
      // Send a request to the backend to reset the password
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/email/reset-password`,
        {
          email,
          newPassword,
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Password reset successfully.");
        router.push("/login"); // Redirect to login screen
      } else {
        Alert.alert("Error", "Failed to reset password.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while resetting the password.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      {step === 1 && (
        <>
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Button title="Send OTP" onPress={handleSendOtp} color="#6A9E00" />
        </>
      )}

      {step === 2 && (
        <>
          <TextInput
            placeholder="Enter OTP"
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button
            title="Verify OTP"
            onPress={handleVerifyOtp}
            color="#6A9E00"
          />
        </>
      )}

      {step === 3 && (
        <>
          <TextInput
            placeholder="Enter New Password"
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            color="#6A9E00"
          />
        </>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Back to Login"
          onPress={() => router.push("/login")}
          color="#535c68"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    marginVertical: 10,
  },
});

export default ForgotPassword;
