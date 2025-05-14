import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";

const YieldEstimationScreen = () => {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [areaAcres, setAreaAcres] = useState("");
  const [defaultDensity, setDefaultDensity] = useState("");
  const [defaultYield, setDefaultYield] = useState("");
  const [editableDensity, setEditableDensity] = useState("");
  const [editableYield, setEditableYield] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URI;

  // Fetch crops from backend
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        console.log("Attempting to fetch crops from:", `${BASE_URL}/api/crops`);
        const response = await axios.get(`${BASE_URL}/api/yeild/crops`, {
          timeout: 10000,
        });
        console.log("Crops data fetched:", response.data);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setCrops(response.data);
          console.log("Crops set in state:", response.data);
        } else {
          console.warn("No crops data received or empty array");
          setError("No crops data available from server.");
          Alert.alert("Warning", "No crops data available.");
        }
      } catch (err) {
        console.error("Fetch error details:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          config: err.config?.url,
        });
        setError(
          `Failed to load crops: ${err.message}. Check server or network.`
        );
        Alert.alert("Error", `Failed to load crops: ${err.message}`);
      }
    };
    fetchCrops();
  }, []);

  // Update defaults when crop changes
  useEffect(() => {
    if (selectedCrop) {
      const crop = crops.find((c) => c.name === selectedCrop);
      console.log("Selected crop:", crop);
      if (crop) {
        setDefaultDensity(crop.default_density.toString());
        setDefaultYield(crop.yield_per_plant.toString());
        setEditableDensity(crop.default_density.toString());
        setEditableYield(crop.yield_per_plant.toString());
      } else {
        setDefaultDensity("");
        setDefaultYield("");
        setEditableDensity("");
        setEditableYield("");
      }
    }
  }, [selectedCrop, crops]);

  // Calculate and save yield
  const calculateYield = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    console.log("Inputs:", {
      selectedCrop,
      areaAcres,
      editableDensity,
      editableYield,
    });

    if (!selectedCrop) {
      setError("Please select a crop.");
      Alert.alert("Error", "Please select a crop.");
      setLoading(false);
      return;
    }
    const area = parseFloat(areaAcres);
    if (!areaAcres || isNaN(area) || area <= 0) {
      setError("Please enter a valid area (greater than 0).");
      Alert.alert("Error", "Please enter a valid area (greater than 0).");
      setLoading(false);
      return;
    }
    const density = parseFloat(editableDensity);
    const yieldPerPlant = parseFloat(editableYield);
    if (
      isNaN(density) ||
      density <= 0 ||
      isNaN(yieldPerPlant) ||
      yieldPerPlant <= 0
    ) {
      setError("Please enter valid density and yield values (greater than 0).");
      Alert.alert(
        "Error",
        "Please enter valid density and yield values (greater than 0)."
      );
      setLoading(false);
      return;
    }

    try {
      const areaM2 = area * 4046.86;
      const estimatedYield = areaM2 * density * yieldPerPlant;
      const yieldTons = estimatedYield / 1000;

      const resultData = {
        estimatedYield: Math.round(estimatedYield),
        yieldTons: Math.round(yieldTons * 10) / 10,
        densityUsed: density,
        yieldPerPlantUsed: yieldPerPlant,
        areaAcres: area,
      };

      const payload = {
        cropName: selectedCrop.toLowerCase(),
        areaAcres: area,
        plantDensity: density,
        yieldPerPlant,
        estimatedYield,
      };
      // console.log("Sending payload:", payload);
      // const response = await axios.post(
      //   `${BASE_URL}/api/yield/estimate-yield`,
      //   payload,
      //   {
      //     timeout: 10000,
      //   }
      // );
      // console.log("Backend response:", response.data);

      setResult(resultData);
    } catch (err) {
      console.error(
        "Error:",
        err.message,
        err.response?.data,
        err.response?.status
      );
      const errorMessage = err.response
        ? `Error: ${
            err.response.data?.message || `HTTP ${err.response.status}`
          }`
        : "Failed to save yield. Check network or server.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Yield Estimator</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.labelContainer}>
        <Text style={styles.labelEnglish}>Select Crop</Text>
        <Text style={styles.labelSeparator}> / </Text>
        <Text style={styles.labelUrdu}>فصلوں کا انتخاب کریں</Text>
      </View>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCrop}
          onValueChange={(value) => setSelectedCrop(value)}
          style={styles.picker}
          enabled={crops.length > 0}
        >
          <Picker.Item label="Choose a crop" value="" />
          {crops.map((crop) => (
            <Picker.Item key={crop._id} label={crop?.name} value={crop.name} />
          ))}
        </Picker>
      </View>

      <View style={styles.labelContainer}>
        <Text style={styles.labelEnglish}>Area (acres)</Text>
        <Text style={styles.labelSeparator}> / </Text>
        <Text style={styles.labelUrdu}>علاقہ (ایکڑ میں)</Text>
      </View>
      <TextInput
        style={styles.input}
        value={areaAcres}
        onChangeText={setAreaAcres}
        keyboardType="numeric"
        placeholder="Enter area in acres"
      />

      {selectedCrop && (
        <>
          <View style={styles.labelContainer}>
            <Text style={styles.labelEnglish}>
              Plant Density (plants/m², default: {defaultDensity})
            </Text>
            <Text style={styles.labelSeparator}> / </Text>
            <Text style={styles.labelUrdu}>
              پودوں کی کثافت (پودوں/م²، ڈیفالٹ: {defaultDensity})
            </Text>
          </View>
          <TextInput
            style={styles.input}
            value={editableDensity}
            onChangeText={setEditableDensity}
            keyboardType="numeric"
            placeholder="Enter plant density"
          />
          <View style={styles.labelContainer}>
            <Text style={styles.labelEnglish}>
              Yield per Plant (kg, default: {defaultYield})
            </Text>
            <Text style={styles.labelSeparator}> / </Text>
            <Text style={styles.labelUrdu}>
              فی پلانٹ پیداوار (کلو، ڈیفالٹ: {defaultYield})
            </Text>
          </View>
          <TextInput
            style={styles.input}
            value={editableYield}
            onChangeText={setEditableYield}
            keyboardType="numeric"
            placeholder="Enter yield per plant"
          />
        </>
      )}

      <View style={styles.button}>
        <Button
          title={loading ? "Loading..." : "Estimate"}
          onPress={calculateYield}
          color="#28a745"
          disabled={loading}
        />
      </View>

      {result && (
        <View style={styles.result}>
          <Text style={styles.resultText}>
            🧮 Estimated Yield: {result.estimatedYield.toLocaleString()} kg (
            {result.yieldTons.toFixed(1)} tons)
          </Text>
          <Text style={styles.resultText}>
            ℹ️ Based on {result.densityUsed} plants/m² and{" "}
            {result.yieldPerPlantUsed} kg/plant over {result.areaAcres} acres
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    flexWrap: "wrap",
  },
  labelEnglish: {
    fontSize: 16,
    color: "#555",
    textAlign: "left",
    flex: 1,
  },
  labelUrdu: {
    fontSize: 16,
    color: "#555",
    textAlign: "right",
    flex: 1,
  },
  labelSeparator: {
    fontSize: 16,
    color: "#555",
    marginHorizontal: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginVertical: 10,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  readOnly: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    color: "#555",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 16,
  },
  result: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e8f5e9",
    borderRadius: 5,
  },
  resultText: {
    fontSize: 16,
    marginVertical: 5,
    color: "#2e7d32",
  },
  button: {
    marginVertical: 20,
  },
});

export default YieldEstimationScreen;
