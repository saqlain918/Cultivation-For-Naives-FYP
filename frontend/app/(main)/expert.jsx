import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";

const Expert = () => {
  const router = useRouter();
  const profileData = useLocalSearchParams();
  console.log("Profile Data:", profileData); // Debug log to check profileData

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
        fromExpert: "true",
      });
      router.push({
        pathname: "/manage-ads",
        params: {
          imageUri: selectedAd.image,
          adId: selectedAd._id,
          fromExpert: "true", // Changed to fromExpert
        },
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.logo}>Expert Dashboard</Text>
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
      </View>

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
            Empowering Experts with Smart Solutions
          </Text>
        </View>
      )}

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Expert Features</Text>
        <View style={styles.featuresGrid}>
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
            style={styles.featureCard}
            onPress={() =>
              router.push({
                pathname: "/ExpertSlotsScreen",
                params: { id: profileData.id },
              })
            }
          >
            <Image
              source={require("../../assets/icons/expert-consult.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Manage Slots</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() => router.push("/manage-ads")}
          >
            <Image
              source={require("../../assets/icons/Ads.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Manage Ads</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alerts Section */}
      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>Alerts & Insights</Text>
        <View style={styles.alertsGrid}>
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

          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => router.push("/early-alerts")}
          >
            <Image
              source={require("../../assets/icons/alerts.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>View Alerts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feedback Section */}
      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Expert Feedback</Text>
        <View style={styles.feedbackGrid}>
          <TouchableOpacity
            style={styles.feedbackCard}
            onPress={() =>
              router.push({
                pathname: "/ExpertFeedbackView",
                params: { expertId: profileData.id },
              })
            }
          >
            <Image
              source={require("../../assets/icons/feedback.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>View Feedback</Text>
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
    paddingBottom: 20,
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
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 3,
    padding: 10,
  },
  heroImage: {
    width: "100%",
    height: 320,
    borderRadius: 10,
  },
  placeholderContainer: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 320,
    borderRadius: 10,
  },
  heroText: {
    marginTop: 10,
    fontSize: 18,
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
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  dashboardCard: {
    backgroundColor: "#fff",
    width: "30%",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
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
});

export default Expert;
