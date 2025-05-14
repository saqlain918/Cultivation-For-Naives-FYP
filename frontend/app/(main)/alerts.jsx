// cultivation-app/app/admin/alerts.jsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";

const AdminAlertScreen = () => {
  const [crop, setCrop] = useState("Sugarcane");
  const [disease, setDisease] = useState("");
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submitAlert = async () => {
    try {
      if (!disease || !region || !message) {
        setError("All fields are required");
        return;
      }
      await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/alert/disease`,
        {
          crop,
          disease,
          region,
          message,
        }
      );
      setError("");
      setDisease("");
      setRegion("");
      setMessage("");
      alert("Alert added successfully!");
    } catch (err) {
      setError("Failed to add alert");
      console.error("Submit error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Disease Alert</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Picker
        selectedValue={crop}
        onValueChange={(value) => setCrop(value)}
        style={styles.picker}
      >
        <Picker.Item label="Sugarcane" value="Sugarcane" />
        <Picker.Item label="Wheat" value="Wheat" />
        <Picker.Item label="Cotton" value="Cotton" />
        <Picker.Item label="Rice" value="Rice" />
        <Picker.Item label="Maize" value="Maize" />
      </Picker>
      <TextInput
        placeholder="Disease (e.g., Red Rot)"
        value={disease}
        onChangeText={setDisease}
        style={styles.input}
      />
      <TextInput
        placeholder="Region (e.g., Nairobi)"
        value={region}
        onChangeText={setRegion}
        style={styles.input}
      />
      <TextInput
        placeholder="Message (e.g., Apply fungicide within 48 hours)"
        value={message}
        onChangeText={setMessage}
        style={[styles.input, { height: 100 }]}
        multiline
      />
      <Button title="Add Alert" onPress={submitAlert} color="#28a745" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  picker: {
    height: 50,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});

export default AdminAlertScreen;
