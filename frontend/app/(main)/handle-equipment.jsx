import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Dimensions,
  Modal,
  Linking,
  BackHandler,
} from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2;

// Replace with your Stripe publishable key
const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51RH3YkQD6syXeGAjuG3LgCkbHpTshVyOXfLQy3g1OCaaR4MBrKmBudmlVrcbEszld8s0jJ1zHDyjfsuCwpE0zYtK00HXoh6NEa";

export default function ManageEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [listingType, setListingType] = useState("sell");
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullImageUri, setFullImageUri] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const navigation = useNavigation();

  useEffect(() => {
    fetchEquipment();

    // Handle deep links for Stripe (e.g., 3D Secure)
    const handleDeepLink = ({ url }) => {
      console.log("Received deep link:", url);
      if (url.includes("/success")) {
        Alert.alert("Success", "Payment completed successfully!");
      } else if (url.includes("/cancel")) {
        Alert.alert("Cancelled", "Payment was cancelled.");
      }
    };

    // Subscribe to Linking events
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle initial URL (e.g., opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Handle hardware back button (Android)
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        console.log("Back button pressed, navigating to Home");
        navigation.navigate("Home");
        return true; // Prevent default back action
      }
    );

    // Cleanup
    return () => {
      subscription.remove(); // Correctly remove Linking listener
      backHandler.remove(); // Remove back handler
    };
  }, [navigation]);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/equipment/all`
      );

      if (response.data && response.data.equipment) {
        const equipmentWithFixedImageUri = response.data.equipment.map(
          (item) => {
            const fixedImageUri = item.image.replace(/\\/g, "/");
            return { ...item, image: fixedImageUri };
          }
        );
        setEquipment(equipmentWithFixedImageUri);
        setFilteredEquipment(equipmentWithFixedImageUri);
      } else {
        setEquipment([]);
        setFilteredEquipment([]);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
      Alert.alert("Error", "Failed to fetch equipment");
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
      if (!name || !description || !price) {
        Alert.alert("Error", "Name, description, and price are required");
        return;
      }

      if (!selectedImage && !editingEquipment) {
        Alert.alert("Error", "Please select an image");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("availableForRent", listingType == "sell" ? false : true);
      formData.append("vendorId", "670f5b3e9d8c1b2a3c4d5e6f");

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

      const url = editingEquipment
        ? `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/equipment/update/${editingEquipment._id}`
        : `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/equipment/create`;

      const method = editingEquipment ? "put" : "post";

      const response = await axios[method](url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      if (response.data.success) {
        setName("");
        setDescription("");
        setPrice("");
        setListingType("sell");
        setSelectedImage(null);
        setEditingEquipment(null);
        await fetchEquipment();
        Alert.alert(
          "Success",
          editingEquipment
            ? "Equipment updated successfully"
            : "Equipment created successfully"
        );
      }
    } catch (error) {
      console.error("Submission error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to create/update equipment"
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/equipment/${id}`
      );
      setEquipment((prevEquipment) =>
        prevEquipment.filter((item) => item._id !== id)
      );
      setFilteredEquipment((prevEquipment) =>
        prevEquipment.filter((item) => item._id !== id)
      );
      Alert.alert("Success", "Equipment deleted successfully");
    } catch (error) {
      console.error("Error deleting equipment:", error);
      Alert.alert("Error", "Failed to delete equipment");
    }
  };

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setListingType(item.listingType);
    setSelectedImage({
      uri: `${process.env.EXPO_PUBLIC_BACKEND_URI}/${item.image}`,
    });
  };

  const handlePayment = async (item) => {
    try {
      console.log(
        "Initiating payment for item:",
        item.name,
        "Amount:",
        item.price
      );

      // Create Payment Intent on the backend
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/payment/create-payment-intent`,
        {
          amount: item.price,
          itemName: item.name,
        }
      );
      const { clientSecret } = response.data;
      console.log("Received client secret:", clientSecret);

      // Initialize the Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Your App Name",
        paymentIntentClientSecret: clientSecret,
        googlePay: {
          testEnv: true,
          merchantCountryCode: "US",
          currencyCode: "USD",
        },
      });

      if (initError) {
        console.error("Error initializing Payment Sheet:", initError);
        Alert.alert("Payment Error", initError.message);
        return;
      }

      // Present the Payment Sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error("Error presenting Payment Sheet:", presentError);
        Alert.alert("Payment Error", presentError.message);
        return;
      }

      await handleDelete(item._id);

      Alert.alert("Success", "Payment completed successfully!");
    } catch (error) {
      console.error("Error initiating payment:", error);
      Alert.alert(
        "Payment Error",
        error.response?.data?.error ||
          error.message ||
          "Failed to initiate payment"
      );
    }
  };

  const showFullImage = (imageUri) => {
    setFullImageUri(imageUri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setFullImageUri("");
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredEquipment(equipment);
    } else {
      const filtered = equipment.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredEquipment(filtered);
    }
  };

  const renderHeader = () => (
    <View>
      <View style={styles.formCard}>
        <Text style={styles.title}>
          {editingEquipment ? "Edit Equipment" : "Create Equipment"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={listingType}
            onValueChange={(itemValue) => setListingType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Sell" value="sell" />
            <Picker.Item label="Rent" value="rent" />
          </Picker>
        </View>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick an Image</Text>
        </TouchableOpacity>
        {selectedImage && (
          <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
        )}
        <View style={styles.formButtonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.buttonText}>
              {editingEquipment ? "Update" : "Create"}
            </Text>
          </TouchableOpacity>
          {editingEquipment && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setEditingEquipment(null);
                setName("");
                setDescription("");
                setPrice("");
                setListingType("sell");
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
          placeholder="Search equipment by name..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleSearch("")}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitle}>Current Equipment</Text>
    </View>
  );

  const renderEquipmentCard = ({ item }) => (
    <View style={styles.equipmentCard}>
      {item.image && (
        <TouchableOpacity onPress={() => showFullImage(item.image)}>
          <Image
            source={{ uri: item.image }}
            style={styles.equipmentImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.equipmentTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.equipmentDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.equipmentPrice}>${item.price}</Text>
        <Text style={styles.listingText}>
          {item.availableForRent ? "For Rent" : "For Sale"}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item._id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handlePayment(item)}
        >
          <Text style={styles.buttonText}>
            {item.availableForRent ? "Rent Now" : "Buy Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <FlatList
        data={filteredEquipment}
        renderItem={renderEquipmentCard}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.equipmentContainer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={styles.noEquipmentText}>
            {searchQuery.length > 0
              ? "No equipment found matching your search"
              : "No equipment available"}
          </Text>
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
    </StripeProvider>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  imageButton: {
    backgroundColor: "#666",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#6A9E00",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#999",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  formButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  preview: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 10,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
  },
  clearButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginLeft: 5,
    marginTop: 5,
  },
  equipmentContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  equipmentCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 5,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  equipmentImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 10,
  },
  equipmentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  equipmentDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
    lineHeight: 16,
  },
  equipmentPrice: {
    fontSize: 12,
    color: "#333",
    marginBottom: 5,
  },
  listingText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#6A9E00",
    padding: 6,
    borderRadius: 6,
    alignItems: "center",
    marginRight: 2.5,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#e74c3c",
    padding: 6,
    borderRadius: 6,
    alignItems: "center",
    marginLeft: 2.5,
  },
  actionButton: {
    backgroundColor: "#6A9E00",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  noEquipmentText: {
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
    backgroundColor: "#6A9E00",
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    width: "50%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
