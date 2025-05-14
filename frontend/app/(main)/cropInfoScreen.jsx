import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import LinearGradient from "react-native-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

const CropInfoScreen = () => {
  const [selectedCropInfo, setSelectedCropInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { bestCrop } = useLocalSearchParams();

  const fetchCropInfo = async () => {
    setLoading(true);
    try {
      console.log("Fetching for crop:", bestCrop);
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/crop-details/crop-info`,
        { crop: bestCrop }
      );
      console.log("API Response:", res.data);
      console.log("Growth Timeline:", res.data?.growthTimeline);
      setSelectedCropInfo(res.data);
    } catch (error) {
      console.error("Fetch Error:", error.message, error.response?.data);
      Alert.alert("Error", "Unable to fetch crop details. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log("Component mounted, bestCrop:", bestCrop);
    if (bestCrop) {
      fetchCropInfo();
    } else {
      console.log("No bestCrop provided");
    }
  }, [bestCrop]);

  const openImageModal = (imageUrl) => {
    console.log("Opening modal with image:", imageUrl);
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    console.log("Closing modal");
    setModalVisible(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading crop details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Modal for Image Popup */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.modalErrorText}>No image available</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeImageModal}
              accessibilityRole="button"
              accessibilityLabel="Close image modal"
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <LinearGradient colors={["#4CAF50", "#1B5E20"]} style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="grass" size={40} color="#FFF" />
          <Text style={styles.title}>Crop Guide</Text>
          <Text style={styles.bestCropText}>{bestCrop || "Unknown Crop"}</Text>
        </View>
      </LinearGradient>

      {/* Test Modal Button */}
      <TouchableOpacity
        style={styles.testButton}
        onPress={() => openImageModal("https://via.placeholder.com/300")} // Replace with a known imageUrl
      >
        <Text style={styles.testButtonText}>Test Image Modal</Text>
      </TouchableOpacity>

      {selectedCropInfo ? (
        <>
          {/* Sowing Time */}
          <Animated.View
            style={styles.infoCard}
            entering={FadeInDown.delay(100).duration(500)}
          >
            <LinearGradient
              colors={["#A5D6A7", "#81C784"]}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <MaterialIcons name="spa" size={28} color="#1B5E20" />
                <Text style={styles.cardTitle}>Sowing Time</Text>
              </View>
              <Text style={styles.cardContent}>
                {selectedCropInfo.sowingTime || "Not available"}
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Fertilizer and Watering */}
          <Animated.View
            style={styles.infoCard}
            entering={FadeInDown.delay(200).duration(500)}
          >
            <LinearGradient
              colors={["#C8E6C9", "#A5D6A7"]}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <MaterialIcons name="local-florist" size={28} color="#1B5E20" />
                <Text style={styles.cardTitle}>Fertilizer & Watering</Text>
              </View>
              <View style={styles.dualColumn}>
                <View style={styles.column}>
                  <Text style={styles.columnLabel}>Fertilizer</Text>
                  <Text style={styles.columnContent}>
                    {selectedCropInfo.fertilizer || "Not available"}
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: "70%" }]} />
                  </View>
                </View>
                <View style={styles.column}>
                  <Text style={styles.columnLabel}>Water</Text>
                  <Text style={styles.columnContent}>
                    {selectedCropInfo.waterInfo || "Not available"}
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: "50%" }]} />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Soil Preparation */}
          <Animated.View
            style={styles.infoCard}
            entering={FadeInDown.delay(300).duration(500)}
          >
            <LinearGradient
              colors={["#DCEDC8", "#C5E1A5"]}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <MaterialIcons name="terrain" size={28} color="#1B5E20" />
                <Text style={styles.cardTitle}>Soil Preparation</Text>
              </View>
              <Text style={styles.cardContent}>
                {selectedCropInfo.soilPreparation || "Not available"}
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Vehicle Usage */}
          <Animated.View
            style={styles.infoCard}
            entering={FadeInDown.delay(400).duration(500)}
          >
            <LinearGradient
              colors={["#E8F5E9", "#C8E6C9"]}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <MaterialIcons name="agriculture" size={28} color="#1B5E20" />
                <Text style={styles.cardTitle}>Vehicle Usage</Text>
              </View>
              <Text style={styles.cardContent}>
                {selectedCropInfo.vehicleUsage || "Not available"}
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Growth Timeline Graph */}
          <Animated.View
            style={styles.infoCard}
            entering={FadeInDown.delay(500).duration(500)}
          >
            <Text style={styles.cardTitle}>Growth Timeline</Text>
            {selectedCropInfo.growthTimeline &&
            Array.isArray(selectedCropInfo.growthTimeline) &&
            selectedCropInfo.growthTimeline.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timelineContainer}
              >
                {selectedCropInfo.growthTimeline.map((stage, index) => (
                  <View
                    key={stage.stageName || index}
                    style={styles.timelineNode}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        stage.imageUrl && openImageModal(stage.imageUrl)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`View image for ${stage.stageName}`}
                      disabled={!stage.imageUrl}
                    >
                      <Animated.View
                        style={[
                          styles.nodeCircle,
                          index === 0 && styles.firstNode,
                          index ===
                            selectedCropInfo.growthTimeline.length - 1 &&
                            styles.lastNode,
                          !stage.imageUrl && styles.disabledNode,
                        ]}
                        entering={FadeInDown.delay(100 * index).duration(300)}
                      >
                        <MaterialIcons name="eco" size={20} color="#FFF" />
                      </Animated.View>
                    </TouchableOpacity>
                    <Text style={styles.nodeTitle}>
                      {stage.stageName || "Unknown Stage"}
                    </Text>
                    <Text style={styles.nodeDescription}>
                      {stage.description || "No description"}
                    </Text>
                    {index < selectedCropInfo.growthTimeline.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.cardContent}>No timeline available</Text>
            )}
          </Animated.View>
        </>
      ) : (
        <Text style={styles.errorText}>No crop information available</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  bestCropText: {
    fontSize: 34,
    fontWeight: "700",
    color: "#E8F5E9",
    textAlign: "center",
    textTransform: "capitalize",
  },
  testButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  testButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1B5E20",
  },
  cardContent: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  dualColumn: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  column: {
    flex: 1,
  },
  columnLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  columnContent: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  timelineContainer: {
    marginTop: 12,
    paddingVertical: 12,
  },
  timelineNode: {
    alignItems: "center",
    width: 100,
    position: "relative",
  },
  nodeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  firstNode: {
    backgroundColor: "#388E3C",
  },
  lastNode: {
    backgroundColor: "#2E7D32",
  },
  disabledNode: {
    backgroundColor: "#999",
    borderColor: "#666",
  },
  nodeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 4,
  },
  nodeDescription: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  timelineLine: {
    position: "absolute",
    top: 24,
    left: 50,
    width: 50,
    height: 4,
    backgroundColor: "#81C784",
  },
  errorText: {
    fontSize: 18,
    color: "#D32F2F",
    textAlign: "center",
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#4CAF50",
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalErrorText: {
    fontSize: 16,
    color: "#D32F2F",
    marginBottom: 16,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default CropInfoScreen;
