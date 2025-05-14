import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
  Image,
  TextInput,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/auth/get-expert-users`;
const SLOTS_API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/slot/expert`;
const BOOK_API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/slot/book`;

const tempCurrentUser = {
  id: "f219255",
  email: "f219255@cfd.nu.edu.pk",
};

const expertPhotos = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=50&h=50",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=50&h=50",
  "https://images.unsplash.com/photo-1522529599102-193c0eba30c0?w=50&h=50",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=50&h=50",
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await axios.get(API_URL);
        const fetchedExperts = response.data.users || [];
        setExperts(fetchedExperts);
        console.log("Fetched experts:", fetchedExperts); // Debug: Check data structure
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

  useEffect(() => {
    if (!experts.length || loading) {
      setSuggestions([]); // No suggestions until experts are loaded
      return;
    }

    // Extract unique expertise values
    const uniqueExpertise = [
      ...new Set(experts.map((expert) => expert.expertise || "Unknown")),
    ];
    console.log("Unique expertise:", uniqueExpertise); // Debug: Check available expertise

    if (searchQuery.length > 0) {
      const filteredSuggestions = uniqueExpertise.filter((expertise) =>
        expertise.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log("Filtered suggestions:", filteredSuggestions); // Debug: Check filtering
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, experts, loading]);

  const fetchSlots = async (expertId) => {
    setSlotsLoading(true);
    try {
      const response = await axios.get(`${SLOTS_API_URL}/${expertId}`);
      if (response.data.success) {
        setSlots(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to load slots");
        setSlots([]);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load slots");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleExpertSelection = (expert) => {
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
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to book consultation"
        );
      }
    } catch (error) {
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
    router.push({
      pathname: "/feedback",
      params: { expertId: selectedExpert._id, expertName: selectedExpert.name },
    });
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]); // Hide suggestions after selection
  };

  const filteredExperts = experts.filter((expert) =>
    expert.expertise.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderExpertCard = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.expertCard,
        selectedExpert?._id === item._id && styles.selectedExpertCard,
      ]}
      onPress={() => handleExpertSelection(item)}
    >
      <LinearGradient
        colors={["#4CAF50", "#2E7D32"]}
        style={styles.cardGradient}
      >
        <View style={styles.expertInfo}>
          <View style={styles.expertHeader}>
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri: expertPhotos[index % expertPhotos.length],
                }}
                style={styles.profileImage}
                onError={(e) =>
                  console.log("Image load error:", e.nativeEvent.error)
                }
              />
              {item.expertise.toLowerCase().includes("frontend") && (
                <MaterialIcons
                  name="code"
                  size={20}
                  color="#FFD700"
                  style={styles.overlayIcon}
                />
              )}
            </View>
            <View style={styles.expertTextContainer}>
              <Text style={styles.expertName}>{item.name}</Text>
              <View style={styles.ratingBadge}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
          </View>

          <View style={styles.expertDetails}>
            <View style={styles.detailRow}>
              <MaterialIcons name="phone" size={16} color="#FFF" />
              <Text style={styles.detailText}>{item.phoneNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="work" size={16} color="#FFF" />
              <Text style={styles.detailText}>{item.expertise}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4CAF50", "#388E3C"]}
        style={styles.headerGradient}
      >
        <Text style={styles.title}>Consult an Expert</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <LinearGradient
          colors={["#66BB6A", "#4CAF50"]}
          style={styles.searchGradient}
        >
          <MaterialIcons
            name="search"
            size={28}
            color="#FFF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by expertise (e.g., Frontend)"
            placeholderTextColor="#E0E0E0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <MaterialIcons name="clear" size={28} color="#FFF" />
            </TouchableOpacity>
          )}
        </LinearGradient>
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item}
              style={styles.suggestionsList}
            />
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : filteredExperts.length === 0 ? (
        <Text style={styles.noResultsText}>No experts found</Text>
      ) : (
        <FlatList
          data={filteredExperts}
          renderItem={renderExpertCard}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.expertList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedExpert && (
        <View style={styles.slotsContainer}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          {slotsLoading ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : slots.length === 0 ? (
            <Text style={styles.noSlotsText}>No available slots</Text>
          ) : (
            <FlatList
              data={slots}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => {
                const slotDisplay = `${new Date(item.date).toDateString()} ${
                  item.startTime
                } - ${slot.endTime}`;
                return (
                  <TouchableOpacity
                    style={[
                      styles.slotButton,
                      selectedSlot === slotDisplay && styles.selectedSlotButton,
                    ]}
                    onPress={() => handleSlotSelection(item)}
                  >
                    <Text style={styles.slotText}>{slotDisplay}</Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.slotList}
            />
          )}
        </View>
      )}

      {selectedExpert && (
        <View style={styles.actionButtons}>
          {selectedSlot && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleConsultation}
            >
              <Text style={styles.actionButtonText}>Book Consultation</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/ResidentDirectoryScreen")}
          >
            <Text style={styles.actionButtonText}>Chat with Expert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.feedbackButton]}
            onPress={handleFeedback}
          >
            <Text style={styles.actionButtonText}>Leave Feedback</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  headerGradient: {
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  searchContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  searchGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 18,
    color: "#FFF",
    fontWeight: "500",
    paddingHorizontal: 5,
  },
  clearButton: {
    padding: 5,
  },
  suggestionsContainer: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderRadius: 8,
    maxHeight: 150,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  suggestionsList: {
    padding: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
  expertList: {
    padding: 15,
  },
  expertCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedExpertCard: {
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  cardGradient: {
    padding: 15,
  },
  expertInfo: {
    padding: 5,
  },
  expertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  imageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  overlayIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 2,
  },
  expertTextContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expertName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 16,
    color: "#FFD700",
    fontWeight: "bold",
    marginLeft: 4,
  },
  expertDetails: {
    marginTop: 5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  detailText: {
    fontSize: 16,
    color: "#FFF",
    marginLeft: 8,
  },
  slotsContainer: {
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 15,
    margin: 15,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  slotButton: {
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedSlotButton: {
    backgroundColor: "#A5D6A7",
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  slotText: {
    fontSize: 16,
    color: "#1B5E20",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  feedbackButton: {
    backgroundColor: "#388E3C",
  },
  actionButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
  errorText: {
    color: "#D32F2F",
    textAlign: "center",
    margin: 20,
    fontSize: 16,
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    margin: 20,
  },
  noSlotsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 10,
  },
  loader: {
    marginTop: 50,
  },
});

export default ConsultationApp;
