import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ToastAndroid,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

// Regex patterns
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const cnicRegex = /^[0-9]{13}$/;
const phoneRegex = /^[0-9]{11}$/;

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
  const [farmSize, setFarmSize] = useState("");
  const [rating, setRating] = useState("");
  const [expertise, setExpertise] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const handleSignUp = async () => {
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
    if (/\d/.test(name)) {
      Alert.alert("Invalid Name", "Name should not contain numeric digits.");
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
    if (/[a-zA-Z]/.test(age) || isNaN(age) || age <= 0) {
      Alert.alert(
        "Invalid Age",
        "Age should be a number and not contain alphabets."
      );
      return;
    }
    if (!cnicRegex.test(cnic)) {
      Alert.alert("Invalid CNIC", "Please enter a valid CNIC (13 digits).");
      return;
    }
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return;
    }
    if (type === "farmer" && (isNaN(farmSize) || farmSize <= 0)) {
      Alert.alert("Invalid Farm Size", "Please enter a valid farm size.");
      return;
    }
    if ((type === "vendor" || type === "expert") && !rating) {
      Alert.alert("Invalid Rating", "Please select a rating.");
      return;
    }
    if (type === "expert" && expertise === "") {
      Alert.alert("Invalid Expertise", "Please enter an expertise.");
      return;
    }

    try {
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
            rating: Number(rating),
            expertise,
            type,
            email,
            password,
          }
        );
        if (signupRes.data) {
          router.push("/login");
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
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {type
            ? `${type.charAt(0).toUpperCase() + type.slice(1)} Sign Up`
            : "Sign Up"}
        </Text>

        <View style={styles.formContainer}>
          <TextInput
            placeholder="Enter your name"
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="Enter your password"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="Enter your age"
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="Select Gender" value="" enabled={false} />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
          <TextInput
            placeholder="1234567890123 (13 digits)"
            style={styles.input}
            value={cnic}
            onChangeText={setCnic}
            keyboardType="numeric"
            maxLength={13}
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="03001234567 (11 digits)"
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={11}
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="Enter your address"
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#888"
          />

          {type === "farmer" && (
            <TextInput
              placeholder="Enter farm size (in acres)"
              style={styles.input}
              value={farmSize}
              onChangeText={setFarmSize}
              keyboardType="numeric"
              placeholderTextColor="#888"
            />
          )}

          {(type === "vendor" || type === "expert") && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={rating}
                onValueChange={(itemValue) => setRating(itemValue)}
                style={styles.picker}
                mode="dropdown"
              >
                <Picker.Item label="Select Rating" value="" enabled={false} />
                <Picker.Item label="1" value="1" />
                <Picker.Item label="2" value="2" />
                <Picker.Item label="3" value="3" />
                <Picker.Item label="4" value="4" />
                <Picker.Item label="5" value="5" />
              </Picker>
            </View>
          )}

          {type === "expert" && (
            <TextInput
              placeholder="Enter your expertise"
              style={styles.input}
              value={expertise}
              onChangeText={setExpertise}
              placeholderTextColor="#888"
            />
          )}

          {isOtpSent && !isOtpVerified && (
            <>
              <TextInput
                placeholder="Enter OTP"
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
              <Button
                title="Verify OTP and Sign Up"
                onPress={verifyOtpAndSignUp}
                color="#4CAF50"
              />
            </>
          )}

          {!isOtpSent && (
            <Button title="Send OTP" onPress={handleSignUp} color="#4CAF50" />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: "#F5F7FA",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 30,
    textTransform: "capitalize",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    marginBottom: 15,
    height: 55,
    justifyContent: "center",
  },
  picker: {
    height: 55,
    color: "#333",
  },
});

export default SignUp;
