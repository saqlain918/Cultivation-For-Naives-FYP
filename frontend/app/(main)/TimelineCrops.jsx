import React from "react";
import { View, Text, Image, FlatList, StyleSheet } from "react-native";

const cropData = [
  { id: "1", name: "Rice", image: require("../../assets/icons/Rice.png") },
  { id: "2", name: "Maize", image: require("../../assets/icons/Maize.png") },
  {
    id: "3",
    name: "Sugarcane",
    image: require("../../assets/icons/sugarcane.png"),
  },
  { id: "4", name: "Wheat", image: require("../../assets/icons/wheat.png") },
  { id: "5", name: "Cotton", image: require("../../assets/icons/Cotton.png") },
];

const TimelineCrops = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Crop Growth Timeline</Text>
      <FlatList
        data={cropData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.text}>{item.name}</Text>
          </View>
        )}
      />
    </View>
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
});

export default TimelineCrops;
