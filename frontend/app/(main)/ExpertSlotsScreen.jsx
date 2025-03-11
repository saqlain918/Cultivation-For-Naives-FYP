import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";

const ExpertSlotsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // State for slot management
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [freeSlots, setFreeSlots] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null); // Track slot being edited

  // API configuration
  const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URI}/api`;

  // Fetch existing slots on mount
  useEffect(() => {
    fetchFreeSlots();
  }, []);

  const fetchFreeSlots = async () => {
    try {
      const response = await axios.get(`${API_URL}/free-slot`, {
        params: { id: params.id }, // Send expertId as query param
      });
      if (response.data.success) {
        setFreeSlots(response.data.data || []);
      } else {
        alert(response.data.message || "Failed to load slots");
      }
    } catch (error) {
      console.error("Error fetching slots:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to load slots");
    }
  };

  // Handle date change from picker
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  // Format time input (ensures HH:MM format)
  const formatTime = (text) => {
    let cleaned = text.replace(/[^0-9:]/g, "");
    if (cleaned.length === 2 && !cleaned.includes(":")) {
      cleaned += ":";
    }
    return cleaned.slice(0, 5);
  };

  // Add or update slot
  const saveSlot = async () => {
    if (!startTime || !endTime) {
      alert("Please enter both start and end times");
      return;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      alert("Please enter valid times in HH:MM format");
      return;
    }

    const slotData = {
      date: date.toISOString(),
      startTime,
      endTime,
      id: params.id, // expertId
    };

    try {
      let response;
      if (editingSlot) {
        // Update existing slot
        response = await axios.put(
          `${API_URL}/slot/${editingSlot._id}`,
          slotData
        );
        if (response.data.success) {
          setFreeSlots(
            freeSlots.map((slot) =>
              slot._id === editingSlot._id ? response.data.data : slot
            )
          );
          setEditingSlot(null);
          alert(response.data.message || "Slot updated successfully");
        } else {
          alert(response.data.message || "Failed to update slot");
        }
      } else {
        // Add new slot
        response = await axios.post(`${API_URL}/add-slot`, slotData);
        if (response.data.success) {
          setFreeSlots([...freeSlots, response.data.data]);
          alert(response.data.message || "Slot added successfully");
        } else {
          alert(response.data.message || "Failed to add slot");
        }
      }

      // Reset form
      setStartTime("");
      setEndTime("");
      setDate(new Date());
    } catch (error) {
      console.error("Error saving slot:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to save slot");
    }
  };

  // Edit slot handler
  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setDate(new Date(slot.date));
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
  };

  // Delete slot handler
  const handleDeleteSlot = async (slotId) => {
    try {
      const response = await axios.delete(`${API_URL}/slot/${slotId}`);
      if (response.data.success) {
        setFreeSlots(freeSlots.filter((slot) => slot._id !== slotId));
        alert(response.data.message || "Slot deleted successfully");
      } else {
        alert(response.data.message || "Failed to delete slot");
      }
    } catch (error) {
      console.error("Error deleting slot:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to delete slot");
    }
  };

  // Render individual slot item with Edit and Delete buttons
  const renderSlot = ({ item }) => (
    <View style={styles.slotItem}>
      <View style={styles.slotDetails}>
        <Text>{new Date(item.date).toDateString()}</Text>
        <Text>
          {item.startTime} - {item.endTime}
        </Text>
      </View>
      <View style={styles.slotActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditSlot(item)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSlot(item._id)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Free Slots</Text>

      {/* Date Picker */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>Select Date: {date.toDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Inputs */}
      <View style={styles.timeContainer}>
        <TextInput
          style={styles.input}
          placeholder="Start Time (HH:MM)"
          value={startTime}
          onChangeText={(text) => setStartTime(formatTime(text))}
          keyboardType="numeric"
          maxLength={5}
        />
        <TextInput
          style={styles.input}
          placeholder="End Time (HH:MM)"
          value={endTime}
          onChangeText={(text) => setEndTime(formatTime(text))}
          keyboardType="numeric"
          maxLength={5}
        />
      </View>

      {/* Add/Update Slot Button */}
      <TouchableOpacity style={styles.addButton} onPress={saveSlot}>
        <Text style={styles.buttonText}>
          {editingSlot ? "Update Slot" : "Add Slot"}
        </Text>
      </TouchableOpacity>

      {/* List of Free Slots */}
      <View style={styles.slotsList}>
        <Text style={styles.subtitle}>Added Free Slots:</Text>
        <FlatList
          data={freeSlots}
          renderItem={renderSlot}
          keyExtractor={(item) => item._id || item.id} // Use _id from MongoDB
          ListEmptyComponent={<Text>No slots added yet</Text>}
        />
      </View>

      {/* Buttons Container */}
      <View style={styles.buttonContainer}>
        {/* Chat Button */}
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => {
            router.push({
              pathname: "/ResidentDirectoryScreen",
            });
          }}
        >
          <Text style={styles.buttonText}>Chat with Expert</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dateButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginBottom: 15,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
  },
  addButton: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  chatButton: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  slotsList: {
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  slotItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  slotDetails: {
    flex: 1,
  },
  slotActions: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#FFA500",
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    padding: 8,
    borderRadius: 5,
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default ExpertSlotsScreen;
