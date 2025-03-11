import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams, Redirect } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

// Email regex for validation
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
// Password regex for at least 8 characters, one uppercase letter, and one special character
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
// CNIC regex (example for 13 digits)
const cnicRegex = /^[0-9]{13}$/;
// Phone number regex (example for phone number format)
const phoneRegex = /^[0-9]{10}$/;

const SignUp = () => {
  const { type } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [cnic, setCnic] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [farmSize, setFarmSize] = useState(""); // For farmers
  const [rating, setRating] = useState(""); // For vendors/experts
  const [otp, setOtp] = useState(""); // OTP input
  const [isOtpSent, setIsOtpSent] = useState(false); // Flag to check if OTP is sent
  const [isOtpVerified, setIsOtpVerified] = useState(false); // Flag for OTP verification

  const handleSignUp = async () => {
    // Check if all required fields are filled
    if (
      !name ||
      !email ||
      !password ||
      !age ||
      !gender ||
      !cnic ||
      !phoneNumber ||
      !address
    ) {
      Alert.alert("Error", "Please fill out all required fields.");
      return;
    }

    // Validate Name: Ensure no numeric digits in name
    if (/\d/.test(name)) {
      Alert.alert("Invalid Name", "Name should not contain numeric digits.");
      return;
    }

    // Validate Email
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    // Validate Password (8 characters, 1 uppercase, 1 special character)
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long and contain at least one uppercase letter and one special character."
      );
      return;
    }

    // Validate Age: Ensure no alphabetic characters in age and it is a positive number
    if (/[a-zA-Z]/.test(age) || isNaN(age) || age <= 0) {
      Alert.alert(
        "Invalid Age",
        "Age should be a number and not contain alphabets."
      );
      return;
    }

    // Validate CNIC: Ensure it contains only numeric digits
    if (!cnicRegex.test(cnic)) {
      Alert.alert("Invalid CNIC", "Please enter a valid CNIC (13 digits).");
      return;
    }

    // Validate Phone Number (should be 10 digits)
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return;
    }

    // Validate Farm Size (if type is "farmer", should be a number)
    if (type === "farmer" && (isNaN(farmSize) || farmSize <= 0)) {
      Alert.alert("Invalid Farm Size", "Please enter a valid farm size.");
      return;
    }

    // Validate Rating (if type is "vendor" or "expert", should be a number)
    if (
      (type === "vendor" || type === "expert") &&
      (isNaN(rating) || rating <= 0)
    ) {
      Alert.alert("Invalid Rating", "Please enter a valid rating.");
      return;
    }

    // Step 1: Send OTP to email
    try {
      console.log("ddffgd");
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/email/sendOTPsign`,
        { email }
      );
      if (res.status === 200) {
        setIsOtpSent(true);
        Alert.alert("OTP Sent", "An OTP has been sent to your email.");
      } else {
        ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    }
  };

  const verifyOtpAndSignUp = async () => {
    // Step 2: Verify OTP
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/email/verify-otp`,
        { email, otp }
      );

      if (res.status === 200) {
        setIsOtpVerified(true);
        // Step 3: Proceed to signup if OTP is verified
        const signupRes = await axios.post(
          `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/auth/signup`,
          {
            name,
            age: Number(age),
            gender,
            phoneNumber: Number(phoneNumber),
            farmSize: Number(farmSize),
            address,
            cnic: Number(cnic),
            rating,
            type,
            email,
            password,
          }
        );

        if (signupRes.data) {
          router.push("/login");
          // await AsyncStorage.setItem("token", signupRes.data.token);
        } else {
          ToastAndroid.show(signupRes.data.message, ToastAndroid.SHORT);
        }
      } else {
        Alert.alert("Invalid OTP", "The OTP entered is incorrect.");
      }
    } catch (error) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{type ? `${type} Sign Up` : "Sign Up"}</Text>

      {/* Normal form fields */}
      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        placeholder="Age"
        style={styles.input}
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Gender"
        style={styles.input}
        value={gender}
        onChangeText={setGender}
      />
      <TextInput
        placeholder="CNIC"
        style={styles.input}
        value={cnic}
        onChangeText={setCnic}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Address"
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        placeholder="Phone Number"
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      {/* Additional Fields for Farmer */}
      {type === "farmer" && (
        <TextInput
          placeholder="Farm Size (in acres)"
          style={styles.input}
          value={farmSize}
          onChangeText={setFarmSize}
          keyboardType="numeric"
        />
      )}

      {/* Additional Fields for Vendor */}
      {(type === "vendor" || type === "expert") && (
        <TextInput
          placeholder="Rating"
          style={styles.input}
          value={rating}
          onChangeText={setRating}
          keyboardType="numeric"
        />
      )}

      {/* OTP Input */}
      {isOtpSent && !isOtpVerified && (
        <>
          <TextInput
            placeholder="Enter OTP"
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP and Sign Up" onPress={verifyOtpAndSignUp} />
        </>
      )}

      {/* Button to trigger OTP sending */}
      {!isOtpSent && (
        <Button title="Send OTP" onPress={handleSignUp} color="#6A9E00" />
        /* <Button
          title="Send OTP"
          onPress={() => router.push("/manage-ads")}
          color="#6A9E00"
        />*/
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
});

export default SignUp;
