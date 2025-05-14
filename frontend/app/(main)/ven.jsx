import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

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
              const fixedImageUri = ad.image.replace(/\\/g, "/");
              return { ...ad, image: fixedImageUri };
            }
          );

          // Top-5 filtering logic
          const now = new Date();
          const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

          const recentAds = adsWithFixedImageUri.filter((ad) =>
            ad.createdAt ? new Date(ad.createdAt) > twentyFourHoursAgo : true
          );
          const olderAds = adsWithFixedImageUri.filter((ad) =>
            ad.createdAt ? new Date(ad.createdAt) <= twentyFourHoursAgo : false
          );

          recentAds.sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt || new Date()) -
              new Date(a.updatedAt || a.createdAt || new Date())
          );
          olderAds.sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt || new Date()) -
              new Date(a.updatedAt || a.createdAt || new Date())
          );

          const topFiveAds = [...recentAds, ...olderAds].slice(0, 5);

          console.log("All ads fetched:", adsWithFixedImageUri);
          console.log(
            "Top 5 ads selected:",
            topFiveAds.map((ad) => ({
              title: ad.title,
              createdAt: ad.createdAt,
              updatedAt: ad.updatedAt,
            }))
          );

          setAds(topFiveAds);
        } else {
          setAds([]);
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
        setAds([]);
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

  const handleAdClick = () => {
    if (ads.length > 0 && ads[currentImageIndex]) {
      const selectedAd = ads[currentImageIndex];
      console.log("Navigating to ManageAds with:", {
        imageUri: selectedAd.image,
        adId: selectedAd._id,
        fromHome: "true",
      });
      router.push({
        pathname: "/manage-ads",
        params: {
          imageUri: selectedAd.image,
          adId: selectedAd._id,
          fromHome: "true",
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Section */}
        <LinearGradient colors={["#2E7D32", "#4CAF50"]} style={styles.header}>
          <Text style={styles.logo}>Cultivation For Naives</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "profile",
                params: profileData,
              })
            }
          >
            <Image
              source={require("../../assets/icons/user.png")}
              style={styles.userAvatar}
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* Hero Section */}
        {ads.length > 0 && ads[currentImageIndex] ? (
          <TouchableOpacity style={styles.heroSection} onPress={handleAdClick}>
            <Image
              source={{
                uri: ads[currentImageIndex].image,
                cache: "reload",
              }}
              style={styles.heroImage}
              onError={(e) =>
                console.log("Image load error:", e.nativeEvent.error)
              }
            />
            <Text style={styles.heroText}>{ads[currentImageIndex].title}</Text>
          </TouchableOpacity>
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

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.grid}>
            <FeatureCard
              icon={require("../../assets/icons/Handle-Equipment.png")}
              title="Handle Equipment"
              onPress={() => router.push("/handle-equipment")}
            />
            <FeatureCard
              icon={require("../../assets/icons/Ads.png")}
              title="Manage Ads"
              onPress={() => router.push("/manage-ads")}
            />
          </View>
        </View>

        {/* Alerts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alerts & Insights</Text>
          <View style={styles.grid}>
            <FeatureCard
              icon={require("../../assets/icons/weather.png")}
              title="Weather Prediction"
              onPress={() => router.push("/weather-prediction")}
            />
            <FeatureCard
              icon={require("../../assets/icons/alerts.png")}
              title="Early Alerts"
              onPress={() => router.push("/early-alerts")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Feature Card Component
const FeatureCard = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={icon} style={styles.cardIcon} />
    <Text style={styles.cardTitle}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    paddingTop: StatusBar.currentHeight + 15,
  },
  logo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#fff",
  },
  heroSection: {
    position: "relative",
    margin: 10,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
  },
  placeholderContainer: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  heroText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});

export default Home;
