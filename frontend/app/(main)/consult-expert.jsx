import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/auth/get-expert-users`;
const SLOTS_API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/slot/expert`;
const BOOK_API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/slot/book`;

const tempCurrentUser = {
  id: "temp-user-123",
  email: "user@example.com", // Replace with your test email
};

const ConsultationApp = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [consultationBooked, setConsultationBooked] = useState(false);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        console.log("Fetching experts from API:", API_URL);
        const response = await axios.get(API_URL);
        const fetchedExperts = response.data.users || [];
        console.log("Fetched experts:", fetchedExperts);
        setExperts(fetchedExperts);
      } catch (error) {
        setError("Failed to load experts.");
        console.error("Error fetching experts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperts();
  }, []);

  useEffect(() => {
    if (selectedExpert) {
      fetchSlots(selectedExpert._id);
    }
  }, [selectedExpert]);

  const fetchSlots = async (expertId) => {
    setSlotsLoading(true);
    try {
      console.log("Fetching slots for expert:", expertId);
      const response = await axios.get(`${SLOTS_API_URL}/${expertId}`);
      if (response.data.success) {
        const newSlots = response.data.data || [];
        console.log("Fetched slots:", newSlots);
        setSlots(newSlots);
      } else {
        setError(response.data.message || "Failed to load slots");
        setSlots([]);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load slots");
      setSlots([]);
      console.error("Error fetching slots:", error);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleExpertSelection = (expert) => {
    console.log("Selected expert:", expert);
    setSelectedExpert(expert);
    setSelectedSlot(null);
    setSelectedSlotId(null);
    setConsultationBooked(false);
    setSlots([]);
  };

  const handleSlotSelection = (slot) => {
    const slotString = `${new Date(slot.date).toDateString()} ${
      slot.startTime
    } - ${slot.endTime}`;
    setSelectedSlot(slotString);
    setSelectedSlotId(slot._id);
    console.log("Selected slot:", slot);
  };

  const handleConsultation = async () => {
    if (!selectedExpert || !selectedSlot || !selectedSlotId) {
      Alert.alert("Error", "Please select an expert and a time slot.");
      return;
    }

    try {
      const response = await axios.post(BOOK_API_URL, {
        slotId: selectedSlotId,
        userId: tempCurrentUser.id,
        expertId: selectedExpert._id,
        userEmail: tempCurrentUser.email,
        expertEmail: selectedExpert.email || "expert@example.com",
        slotTime: selectedSlot,
      });

      if (response.data.success) {
        setConsultationBooked(true);
        Alert.alert("Success", response.data.message);
        setSelectedSlot(null);
        setSelectedSlotId(null);
        await fetchSlots(selectedExpert._id);
        console.log("Slots refreshed after booking");
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to book consultation"
        );
      }
    } catch (error) {
      console.error(
        "Error booking consultation:",
        error.response?.data || error
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to book consultation"
      );
    }
  };

  const handleFeedback = () => {
    if (!selectedExpert) {
      Alert.alert("Error", "Please select an expert first");
      return;
    }
    console.log("Navigating to feedback for expert:", selectedExpert._id);
    router.push({
      pathname: "/feedback",
      params: { expertId: selectedExpert._id, expertName: selectedExpert.name },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consult an Expert</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <Text style={styles.subTitle}>Select an Expert:</Text>
          <FlatList
            data={experts}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  selectedExpert?._id === item._id
                    ? styles.selectedOption
                    : null,
                ]}
                onPress={() => handleExpertSelection(item)}
              >
                <View style={styles.expertContainer}>
                  <Text style={styles.expertName}>{item.name}</Text>
                  <Text style={styles.expertPhone}>{item.phoneNumber}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.expertRating}>{item.rating}</Text>
                    <Text style={styles.star}>★</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {selectedExpert && (
        <>
          <Text style={styles.subTitle}>Available Slots:</Text>
          {slotsLoading ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : slots.length === 0 ? (
            <Text style={styles.noSlotsText}>No available slots.</Text>
          ) : (
            <FlatList
              data={slots}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => {
                const slotDisplay = `${new Date(item.date).toDateString()} ${
                  item.startTime
                } - ${item.endTime}`;
                return (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      selectedSlot === slotDisplay
                        ? styles.selectedOption
                        : null,
                    ]}
                    onPress={() => handleSlotSelection(item)}
                  >
                    <Text style={styles.optionText}>{slotDisplay}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </>
      )}

      {selectedExpert && selectedSlot && (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleConsultation}
        >
          <Text style={styles.bookButtonText}>
            Book Consultation with {selectedExpert.name}
          </Text>
        </TouchableOpacity>
      )}

      {selectedExpert && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => {
              if (!selectedExpert) {
                Alert.alert("Error", "Please select an expert first");
                return;
              }
              router.push({
                pathname: "/ResidentDirectoryScreen",
              });
            }}
          >
            <Text style={styles.bookButtonText}>Chat with Expert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bookButton, styles.feedbackButton]}
            onPress={handleFeedback}
          >
            <Text style={styles.bookButtonText}>Feedback</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#388E3C",
    marginBottom: 10,
  },
  option: {
    backgroundColor: "#C8E6C9",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedOption: {
    backgroundColor: "#A5D6A7",
    borderWidth: 2,
    borderColor: "#388E3C",
  },
  expertContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expertName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  expertPhone: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  expertRating: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B5E20",
    marginRight: 4,
  },
  star: {
    fontSize: 16,
    color: "#FFF",
  },
  optionText: {
    fontSize: 16,
    color: "#1B5E20",
    fontWeight: "bold",
    textAlign: "center",
  },
  bookButton: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  feedbackButton: {
    backgroundColor: "#2E7D32", // Same green as "Chat with Expert"
  },
  bookButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  noSlotsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
});

export default ConsultationApp;
