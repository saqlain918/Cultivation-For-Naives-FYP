import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  LogBox,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

LogBox.ignoreAllLogs();

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2; // Two-column layout

export default function ManageAds() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [ads, setAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingAd, setEditingAd] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [fullImageUri, setFullImageUri] = useState("");
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedAdToReport, setSelectedAdToReport] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const reportOptions = [
    "Inappropriate content",
    "Spam or misleading",
    "Violence or harmful behavior",
    "Copyright violation",
    "Harassment or bullying",
    "Other",
  ];

  useEffect(() => {
    console.log("Screen width:", width); // Log the screen width
    console.log("CARD_WIDTH:", CARD_WIDTH); // Log the calculated CARD_WIDTH
    console.log("ManageAds params:", params);
    if (params.imageUri) {
      setFullImageUri(params.imageUri);
      setModalVisible(true);
    }
    fetchAds();
  }, [params.imageUri]);

  const fetchAds = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/ads/all`
      );

      if (response.data && response.data.advertisements) {
        const adsWithFixedImageUri = response.data.advertisements.map((ad) => {
          const fixedImageUri = ad.image.replace(/\\/g, "/");
          return { ...ad, image: fixedImageUri };
        });
        setAds(adsWithFixedImageUri);
        setFilteredAds(adsWithFixedImageUri);
      } else {
        setAds([]);
        setFilteredAds([]);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      Alert.alert("Error", "Failed to fetch advertisements");
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to allow access to your gallery."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage({ uri: imageUri });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick an image");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!title || !description) {
        Alert.alert("Error", "Title and description are required");
        return;
      }

      if (!selectedImage && !editingAd) {
        Alert.alert("Error", "Please select an image");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (!editingAd) {
        formData.append("createdAt", new Date().toISOString());
      }

      if (selectedImage) {
        const imageUri = selectedImage.uri;
        const filename = imageUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("image", {
          uri: imageUri,
          name: filename,
          type,
        });
      }

      const url = editingAd
        ? `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/ads/update/${editingAd._id}`
        : `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/ads/create`;

      const method = editingAd ? "put" : "post";

      const response = await axios[method](url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      if (response.data.success) {
        setTitle("");
        setDescription("");
        setSelectedImage(null);
        setEditingAd(null);
        fetchAds();
        Alert.alert(
          "Success",
          editingAd
            ? "Ad updated successfully"
            : "Advertisement created successfully"
        );
      }
    } catch (error) {
      console.error(
        "Error submitting ad:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create/update advertisement"
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/ads/${id}`
      );
      setAds((prevAds) => prevAds.filter((ad) => ad._id !== id));
      setFilteredAds((prevAds) => prevAds.filter((ad) => ad._id !== id));
      Alert.alert("Success", "Advertisement deleted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to delete advertisement");
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setDescription(ad.description);
    setSelectedImage({
      uri: `${process.env.EXPO_PUBLIC_BACKEND_URI}/${ad.image}`,
    });
  };

  const handleReport = (ad) => {
    setSelectedAdToReport(ad);
    setReportModalVisible(true);
  };

  const handleReportSubmit = async () => {
    try {
      if (!reportReason) {
        Alert.alert("Error", "Please select a reason for reporting");
        return;
      }

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/ads/report`,
        {
          adId: selectedAdToReport._id,
          reason: reportReason,
          additionalInfo: additionalInfo,
          reportedAt: new Date().toISOString(),
        }
      );

      if (response.data.success) {
        setReportModalVisible(false);
        setReportReason("");
        setAdditionalInfo("");
        setSelectedAdToReport(null);
        Alert.alert(
          "Success",
          "Thank you for your report. We'll review it soon."
        );
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    }
  };

  const handleSearchInput = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredAds(ads);
    } else {
      const filtered = ads.filter((ad) =>
        ad.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAds(filtered);
    }
  };

  const handleSearchButton = () => {
    handleSearchInput(searchQuery);
  };

  const showFullImage = (imageUri) => {
    setFullImageUri(imageUri);
    setModalVisible(true);
  };

  const closeModal = () => {
    console.log("Closing modal, params:", params);
    setModalVisible(false);
    setFullImageUri("");
    if (
      params.fromAdHome === "true" ||
      params.fromVen === "true" ||
      params.fromExpert === "true" ||
      params.fromHome === "true"
    ) {
      try {
        router.back();
        console.log("Navigated back to originating page");
      } catch (error) {
        console.error("Navigation error:", error);
        Alert.alert("Navigation Error", "Failed to go back");
      }
    }
  };

  const renderAdCard = ({ item }) => (
    <View style={styles.adCard}>
      <TouchableOpacity onPress={() => showFullImage(item.image)}>
        <Image
          source={{ uri: item.image }}
          style={styles.adImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <View style={styles.adContent}>
        <Text style={styles.adTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.adDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item._id)}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => handleReport(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.title}>
          {editingAd ? "Edit Advertisement" : "Create Advertisement"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
        />

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick an Image</Text>
        </TouchableOpacity>

        {selectedImage && (
          <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
        )}

        <View style={styles.formButtonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.buttonText}>
              {editingAd ? "Update" : "Create"}
            </Text>
          </TouchableOpacity>

          {editingAd && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setEditingAd(null);
                setTitle("");
                setDescription("");
                setSelectedImage(null);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title..."
          value={searchQuery}
          onChangeText={handleSearchInput}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchButton}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Current Advertisements</Text>
      <FlatList
        data={filteredAds}
        renderItem={renderAdCard}
        keyExtractor={(item) => item._id}
        numColumns={2} // Keep two-column layout
        scrollEnabled={true}
        contentContainerStyle={styles.adsContainer}
        ListEmptyComponent={
          <Text style={styles.noAdsText}>No advertisements found</Text>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <Image
            source={{ uri: fullImageUri }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.reportModalContent}>
            <Text style={styles.reportModalTitle}>Report Advertisement</Text>
            <Text style={styles.reportModalSubtitle}>
              Please select a problem to continue
            </Text>
            <ScrollView style={styles.reportOptionsContainer}>
              {reportOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.reportOption,
                    reportReason === option && styles.reportOptionSelected,
                  ]}
                  onPress={() => setReportReason(option)}
                >
                  <Text
                    style={[
                      styles.reportOptionText,
                      reportReason === option &&
                        styles.reportOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {reportReason && (
              <TextInput
                style={styles.reportInput}
                placeholder="Additional information (optional)"
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                multiline
                numberOfLines={3}
              />
            )}
            <View style={styles.reportButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.submitReportButton,
                  !reportReason && styles.disabledButton,
                ]}
                onPress={handleReportSubmit}
                disabled={!reportReason}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelReportButton}
                onPress={() => {
                  setReportModalVisible(false);
                  setReportReason("");
                  setAdditionalInfo("");
                  setSelectedAdToReport(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f2f5",
  },
  formCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  textArea: {
    height: 60,
    textAlignVertical: "top",
  },
  imageButton: {
    backgroundColor: "#4a5568",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
  },
  submitButton: {
    backgroundColor: "#2f855a",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: "#718096",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
    elevation: 2,
  },
  formButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 10, // Reduced font size to fit better
    lineHeight: 12, // Adjusted line height
    textAlign: "center",
    flexShrink: 1,
  },
  preview: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  searchInput: {
    flex: 3,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    marginRight: 10,
    elevation: 2,
  },
  searchButton: {
    flex: 1,
    backgroundColor: "#2f855a",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginLeft: 5,
  },
  adsContainer: {
    paddingBottom: 20,
  },
  adCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  adImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  adContent: {
    padding: 10,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  adDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 2, // Reduced gap to save space
    flexWrap: "nowrap", // Force buttons to stay on one line
  },
  editButton: {
    flex: 1,
    backgroundColor: "#2b6cb0",
    paddingVertical: 6, // Reduced padding to make buttons smaller
    paddingHorizontal: 4, // Reduced padding to make buttons narrower
    borderRadius: 4, // Reduced border radius
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#c53030",
    paddingVertical: 6, // Reduced padding to make buttons smaller
    paddingHorizontal: 4, // Reduced padding to make buttons narrower
    borderRadius: 4, // Reduced border radius
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  reportButton: {
    flex: 1,
    backgroundColor: "#ed8936",
    paddingVertical: 6, // Reduced padding to make buttons smaller
    paddingHorizontal: 4, // Reduced padding to make buttons narrower
    borderRadius: 4, // Reduced border radius
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  noAdsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: width,
    height: "80%",
  },
  closeButton: {
    backgroundColor: "#2f855a",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "50%",
    alignItems: "center",
    elevation: 2,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  reportModalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    maxHeight: "80%",
  },
  reportModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  reportModalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  reportOptionsContainer: {
    marginBottom: 15,
  },
  reportOption: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: "#f7fafc",
  },
  reportOptionSelected: {
    backgroundColor: "#bee3f8",
    borderWidth: 1,
    borderColor: "#4299e1",
  },
  reportOptionText: {
    fontSize: 16,
    color: "#4a5568",
  },
  reportOptionTextSelected: {
    color: "#2b6cb0",
    fontWeight: "600",
  },
  reportInput: {
    width: "100%",
    height: 80,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  reportButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  submitReportButton: {
    flex: 1,
    backgroundColor: "#2b6cb0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
  },
  cancelReportButton: {
    flex: 1,
    backgroundColor: "#718096",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#a0aec0",
    opacity: 0.7,
  },
});
