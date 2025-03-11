import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  LogBox,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
LogBox.ignoreAllLogs();
const Home = () => {
  const router = useRouter();
  const profileData = useLocalSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/ads/all`
        );

        if (response.data && response.data.advertisements) {
          const adsWithFixedImageUri = response.data.advertisements.map(
            (ad) => {
              const fixedImageUri = ad.image.replace(/\\/g, "/"); // Convert \ to /
              // console.log("Fixed Image URI:", fixedImageUri); // Log corrected image URI
              return { ...ad, image: fixedImageUri };
            }
          );

          setAds(adsWithFixedImageUri);
        } else {
          setAds([]);
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
        Alert.alert("Error", "Failed to fetch advertisements");
      }
    };

    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [ads]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.logo}>Cultivation For Naives</Text>
        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={() =>
            router.push({
              pathname: "profile",
              params: profileData,
            })
          }
        >
          <Image
            source={require("../../assets/icons/bell.png")}
            style={styles.notificationImage}
          />
        </TouchableOpacity>
      </View>

      {/* Hero Section - Only show if there are ads */}
      {ads.length > 0 ? (
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: ads[currentImageIndex].image,
              cache: "reload",
            }}
            style={styles.heroImage}
          />
          <Text style={styles.heroText}>{ads[currentImageIndex].title}</Text>
        </View>
      ) : (
        <View style={styles.heroSection}>
          <View style={[styles.heroImage, styles.placeholderContainer]}>
            <Text>No advertisements available</Text>
          </View>
          <Text style={styles.heroText}>
            Empowering Agriculture with Smart Solutions
          </Text>
        </View>
      )}

      {/* Dashboard Section */}
      <View style={styles.dashboardSection}>
        <Text style={styles.sectionTitle}>Dashboard</Text>
        <View style={styles.dashboardGrid}>
          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() => router.push("/monitor-farm")}
          >
            <Image
              source={require("../../assets/icons/Monitor-Farm.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Monitor Farm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() => router.push("/CreateThread")}
          >
            <Image
              source={require("../../assets/icons/community.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Create Thread</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() => router.push("/AdvertiseHere")}
          >
            <Image
              source={require("../../assets/icons/Ads.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Advertise Here</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featuresGrid}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => router.push("/consult-expert")}
          >
            <Image
              source={require("../../assets/icons/expert-consult.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Consult Expert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => router.push("/handle-equipment")}
          >
            <Image
              source={require("../../assets/icons/Handle-Equipment.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Handle Equipment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => router.push("/forecast-yield")}
          >
            <Image
              source={require("../../assets/icons/forecast.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Forecast Yield</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alerts Section */}
      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>Alerts & Insights</Text>
        <View style={styles.alertsGrid}>
          {/* Weather Prediction */}
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => router.push("/weather-prediction")}
          >
            <Image
              source={require("../../assets/icons/weather.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Weather Prediction</Text>
          </TouchableOpacity>

          {/* Early Alerts */}
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => router.push("/early-alerts")}
          >
            <Image
              source={require("../../assets/icons/alerts.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Early Alerts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feedback & Payments Section */}
      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.feedbackGrid}>
          {/* Feedback */}

          {/* Make Payment */}
          <TouchableOpacity
            style={styles.feedbackCard}
            onPress={() => router.push("/TimelineCrops")}
          >
            <Image
              source={require("../../assets/icons/time.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Timeline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#2E7D32",
  },
  logo: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  notificationIcon: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 50,
  },
  notificationImage: {
    width: 30,
    height: 30,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 3,
    padding: 10,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  placeholderContainer: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  heroText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginLeft: 15,
    marginBottom: 10,
  },
  dashboardGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  dashboardCard: {
    backgroundColor: "#fff",
    width: "28%",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  featureCard: {
    backgroundColor: "#fff",
    width: "28%",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  alertsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  alertCard: {
    backgroundColor: "#fff",
    width: "45%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  feedbackGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  feedbackCard: {
    backgroundColor: "#fff",
    width: "45%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
});

export default Home;
