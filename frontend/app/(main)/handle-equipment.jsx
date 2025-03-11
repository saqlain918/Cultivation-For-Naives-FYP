// ManageEquipment.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

export default function ManageEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [listingType, setListingType] = useState("sell");
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [paymentOptionsVisible, setPaymentOptionsVisible] = useState({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({});

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/equipment/all`
      );

      if (response.data && response.data.equipment) {
        const equipmentWithFixedImageUri = response.data.equipment.map(
          (item) => {
            const fixedImageUri = item.image.replace(/\\/g, "/");
            console.log("Equipment item:", item); // Debug: Log each item
            return { ...item, image: fixedImageUri };
          }
        );
        setEquipment(equipmentWithFixedImageUri);
      } else {
        setEquipment([]);
        console.log("No equipment found in response");
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
      } else {
        Alert.alert("No Image Selected", "Please select an image.");
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
      formData.append("listingType", listingType);
      formData.append("vendorId", "670f5b3e9d8c1b2a3c4d5e6f"); // Replace with valid vendorId

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

      console.log("Submitting form data with listingType:", listingType); // Debug: Log form data

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
        fetchEquipment();
        Alert.alert(
          "Success",
          editingEquipment
            ? "Equipment updated successfully"
            : "Equipment created successfully"
        );
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to create/update equipment"
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

  const togglePaymentOptions = (id) => {
    setPaymentOptionsVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setSelectedPaymentMethod((prev) => ({
      ...prev,
      [id]: prev[id] || "",
    }));
  };

  const handlePayment = (item) => {
    const payment = selectedPaymentMethod[item._id];
    if (!payment) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    const action = item.listingType === "rent" ? "rent" : "buy";
    Alert.alert(
      "Payment Confirmation",
      `You are about to ${action} "${item.name}" for $${item.price} using ${payment}. Proceed?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            Alert.alert(
              "Success",
              `Payment successful! Equipment ${
                action === "rent" ? "rented" : "purchased"
              }.`
            );
            togglePaymentOptions(item._id);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
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
          <Text style={styles.buttonText}>Pick an image</Text>
        </TouchableOpacity>
        {selectedImage && (
          <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
        )}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {editingEquipment ? "Update" : "Create"}
          </Text>
        </TouchableOpacity>
        {editingEquipment && (
          <TouchableOpacity
            style={[styles.submitButton, styles.cancelButton]}
            onPress={() => {
              setEditingEquipment(null);
              setName("");
              setDescription("");
              setPrice("");
              setListingType("sell");
              setSelectedImage(null);
            }}
          >
            <Text style={styles.buttonText}>Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.equipmentContainer}>
        <Text style={styles.subtitle}>Current Equipment</Text>
        {equipment.length === 0 ? (
          <Text style={styles.noAdsText}>No equipment available.</Text>
        ) : (
          equipment.map((item) => (
            <View key={item._id} style={styles.equipmentCard}>
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={styles.equipmentImage}
                />
              )}
              <Text style={styles.equipmentTitle}>{item.name}</Text>
              <Text style={styles.equipmentDescription}>
                {item.description}
              </Text>
              <Text style={styles.equipmentPrice}>Price: ${item.price}</Text>
              <Text style={styles.listingText}>
                {item.listingType === "rent" ? "For Rent" : "For Sale"}
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => handleDelete(item._id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.actionButton]}
                  onPress={() => togglePaymentOptions(item._id)}
                >
                  <Text style={styles.buttonText}>
                    {item.listingType === "rent" ? "Rent Now" : "Buy Now"}
                  </Text>
                </TouchableOpacity>
              </View>

              {paymentOptionsVisible[item._id] && (
                <View style={styles.paymentContainer}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedPaymentMethod[item._id]}
                      onValueChange={(value) =>
                        setSelectedPaymentMethod((prev) => ({
                          ...prev,
                          [item._id]: value,
                        }))
                      }
                      style={styles.picker}
                    >
                      <Picker.Item label="Select Payment Method" value="" />
                      <Picker.Item label="Credit Card" value="Credit Card" />
                      <Picker.Item label="PayPal" value="PayPal" />
                      <Picker.Item
                        label="Cash on Delivery"
                        value="Cash on Delivery"
                      />
                    </Picker>
                  </View>
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => handlePayment(item)}
                  >
                    <Text style={styles.buttonText}>Confirm Payment</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  formContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: { height: 50, width: "100%" },
  imageButton: {
    backgroundColor: "#666",
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: "#6A9E00",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  cancelButton: { backgroundColor: "#999" },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  preview: { width: "100%", height: 200, marginBottom: 15, borderRadius: 5 },
  equipmentContainer: { marginTop: 20 },
  subtitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  equipmentCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  equipmentImage: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  equipmentTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  equipmentDescription: { marginBottom: 10, color: "#666" },
  equipmentPrice: { marginBottom: 10 },
  listingText: { marginBottom: 10, fontWeight: "bold" },
  noAdsText: { color: "#666" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  editButton: { backgroundColor: "#4a90e2" },
  deleteButton: { backgroundColor: "#e74c3c" },
  actionButton: { backgroundColor: "#f39c12" },
  paymentContainer: { marginTop: 10 },
  payButton: { backgroundColor: "#2ecc71", padding: 10, borderRadius: 5 },
});
