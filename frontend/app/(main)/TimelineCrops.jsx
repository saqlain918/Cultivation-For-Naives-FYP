import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";

const cropData = [
  { id: "1", name: "Rice", image: require("../../assets/icons/rice1.png") },
  { id: "2", name: "Maize", image: require("../../assets/icons/maize1.png") },
  {
    id: "3",
    name: "Sugarcane",
    image: require("../../assets/icons/sugarcane1.png"),
  },
  { id: "4", name: "Wheat", image: require("../../assets/icons/wheat1.png") },
  { id: "5", name: "Cotton", image: require("../../assets/icons/cotton1.png") },
];

const TimelineCrops = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);

  const openModal = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedImage(null);
      pinchScale.setValue(1);
      baseScale.setValue(1);
      lastScale.current = 1;
    });
  };

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      let newScale = lastScale.current * event.nativeEvent.scale;
      newScale = Math.max(1, Math.min(newScale, 5)); // Zoom range: 1x to 5x
      lastScale.current = newScale;
      baseScale.setValue(newScale);
      pinchScale.setValue(1);
    }
  };

  const combinedScale = Animated.multiply(baseScale, pinchScale);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>Crop Growth Timeline</Text>
        <FlatList
          data={cropData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => openModal(item.image)}
            >
              <Image source={item.image} style={styles.image} />
              <Text style={styles.text}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={closeModal}
          >
            <Animated.View
              style={[
                styles.modalContent,
                { transform: [{ scale: scaleValue }] },
              ]}
            >
              <PinchGestureHandler
                onGestureEvent={onPinchGestureEvent}
                onHandlerStateChange={onPinchHandlerStateChange}
              >
                <Animated.Image
                  source={selectedImage}
                  style={[
                    styles.fullImage,
                    { transform: [{ scale: combinedScale }] },
                  ]}
                  resizeMode="contain"
                />
              </PinchGestureHandler>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </View>
    </GestureHandlerRootView>
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
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  image: {
    width: 250,
    height: 180,
    resizeMode: "contain",
    borderRadius: 10,
  },
  text: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    bottom: 50, // Positioned at the bottom with padding
    left: "50%", // Centers horizontally
    transform: [{ translateX: -20 }], // Offsets by half the button width (40/2 = 20)
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 10, // Ensures it stays above the image
  },
  closeButtonText: {
    fontSize: 30,
    color: "#333",
    fontWeight: "bold",
    lineHeight: 30,
  },
});

export default TimelineCrops;
