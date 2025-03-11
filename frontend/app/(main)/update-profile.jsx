import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
} from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";

const UpdateProfile = () => {
  const profileData = useLocalSearchParams();

  // State for the input fields
  const [name, setName] = useState(profileData.name || "");
  const [cnic, setCnic] = useState(profileData.cnic || "");
  const [age, setAge] = useState(profileData.age || "");
  const [phoneNumber, setPhoneNumber] = useState(profileData.phoneNumber || "");
  const [address, setAddress] = useState(profileData.address || "");

  // Function to handle button press
  const handleUpdate = async () => {
    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/auth/update-profile`,
        {
          email: profileData.email,
          name,
          age,
          cnic,
          phoneNumber,
          address,
        }
      );

      // router.replace({
      //   pathname: profileData.isAdmin
      //     ? "/adhome"
      //     : profileData.ven
      //     ? "/vendor"
      //     : profileData.isExpert
      //     ? "/expert"
      //     : "/home", // Default path for other users
      // });

      router.replace({
        pathname: profileData.isAdmin ? "/adhome" : "/Home",
        params: profileData,
      });
    } catch (error) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Cnic"
        value={cnic}
        onChangeText={setCnic}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default UpdateProfile;
