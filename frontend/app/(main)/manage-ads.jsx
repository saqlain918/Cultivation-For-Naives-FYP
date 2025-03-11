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

export default function ManageAds() {
  const [ads, setAds] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingAd, setEditingAd] = useState(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/ads/all`
      );

      if (response.data && response.data.advertisements) {
        const adsWithFixedImageUri = response.data.advertisements.map((ad) => {
          const fixedImageUri = ad.image.replace(/\\/g, "/"); // Convert \ to /
          // console.log("Fixed Image URI:", fixedImageUri); // Log corrected image URI
          return { ...ad, image: fixedImageUri };
        });

        setAds(adsWithFixedImageUri);
      } else {
        setAds([]);
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
        Alert.alert("Image URI", imageUri); // Display the image URI
      } else {
        Alert.alert("No Image Selected", "Please select an image.");
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
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to create/update advertisement"
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to create/update advertisement"
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/ads/${id}`
      );

      setAds((prevAds) => prevAds.filter((ad) => ad._id !== id));

      Alert.alert("Success", "Advertisement deleted successfully");
    } catch (error) {
      console.error("Error deleting ad:", error);
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
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
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick an image</Text>
        </TouchableOpacity>

        {selectedImage && (
          <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {editingAd ? "Update" : "Create"}
          </Text>
        </TouchableOpacity>

        {editingAd && (
          <TouchableOpacity
            style={[styles.submitButton, styles.cancelButton]}
            onPress={() => {
              setEditingAd(null);
              setTitle("");
              setDescription("");
              setSelectedImage(null);
            }}
          >
            <Text style={styles.buttonText}>Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.adsContainer}>
        <Text style={styles.subtitle}>Current Advertisements</Text>

        {ads.length === 0 ? (
          <Text style={styles.noAdsText}>No advertisements available.</Text>
        ) : (
          ads.map((ad) => (
            <View key={ad._id} style={styles.adCard}>
              {ad.image && (
                <Image source={{ uri: ad.image }} style={styles.adImage} />
              )}
              <Text style={styles.adTitle}>{ad.title}</Text>
              <Text style={styles.adDescription}>{ad.description}</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={() => handleEdit(ad)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => handleDelete(ad._id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
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
  cancelButton: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  preview: {
    width: "100%",
    height: 200,
    marginBottom: 15,
    borderRadius: 5,
  },
  adsContainer: {
    marginTop: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  adCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  adImage: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  adDescription: {
    marginBottom: 10,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: "#4a90e2",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
});
