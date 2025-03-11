import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";

const SlotsScreen = ({ route, navigation }) => {
  // Handle case where route params are undefined
  if (!route || !route.params || !route.params.expert) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: No expert data found.</Text>
      </View>
    );
  }

  const { expert } = route.params;
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  // API configuration
  const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URI}/api`; // Replace with your actual API URL

  // Fetch slots from the database when component mounts
  useEffect(() => {
    fetchExpertSlots();
  }, []);

  const fetchExpertSlots = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/expert/${route.params.expert}`
      ); // Assuming expert has an _id field
      setAvailableSlots(response.data.data);
    } catch (error) {
      console.error("Error fetching slots:", error);
      Alert.alert("Error", "Failed to load available slots.");
    }
  };

  const handleSlotSelection = (slot) => {
    // Format the slot display string (e.g., "date startTime - endTime")
    const slotString = `${new Date(slot.date).toDateString()} ${
      slot.startTime
    } - ${slot.endTime}`;
    setSelectedSlot(slotString);
  };

  const handleBooking = () => {
    if (!selectedSlot) {
      Alert.alert("Error", "Please select a time slot.");
      return;
    }
    Alert.alert(
      "Success",
      `Consultation booked with ${expert.name} at ${selectedSlot}.`
    );
    // Optionally, you can reset the selection after booking
    // setSelectedSlot(null);
  };

  // Render individual slot item
  const renderSlot = ({ item }) => {
    const slotDisplay = `${new Date(item.date).toDateString()} ${
      item.startTime
    } - ${item.endTime}`;
    return (
      <TouchableOpacity
        style={[
          styles.slotItem,
          selectedSlot === slotDisplay ? styles.selectedSlot : null,
        ]}
        onPress={() => handleSlotSelection(item)}
      >
        <Text style={styles.slotText}>{slotDisplay}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Available Slots for {route.params.expert}
      </Text>
      <FlatList
        data={availableSlots}
        keyExtractor={(item) => item._id} // Use MongoDB _id as key
        renderItem={renderSlot}
        ListEmptyComponent={<Text>No available slots found.</Text>}
      />

      {selectedSlot && (
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>Book Consultation</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  slotItem: {
    backgroundColor: "#C8E6C9",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  selectedSlot: { backgroundColor: "#A5D6A7" },
  slotText: { fontSize: 16, fontWeight: "bold", color: "#1B5E20" },
  bookButton: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  bookButtonText: { fontSize: 16, color: "white", fontWeight: "bold" },
  errorText: { fontSize: 18, color: "red", textAlign: "center", marginTop: 20 },
});

export default SlotsScreen;
