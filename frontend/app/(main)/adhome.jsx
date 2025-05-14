import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";

const AdHome = () => {
  const router = useRouter();
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
      router.push({
        pathname: "/manage-ads",
        params: {
          imageUri: selectedAd.image,
          adId: selectedAd._id,
          fromAdHome: "true",
        },
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Cultivation For Naives</Text>
        <TouchableOpacity style={styles.notificationIcon}>
          <Image
            source={require("../../assets/icons/bell.png")}
            style={styles.notificationImage}
          />
        </TouchableOpacity>
      </View>

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

      <View style={styles.dashboardSection}>
        <Text style={styles.sectionTitle}>Dashboard</Text>
        <View style={styles.dashboardGrid}>
          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() => router.push("/manage-profile")}
          >
            <Image
              source={require("../../assets/icons/Manage-Profile.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Manage Profile</Text>
          </TouchableOpacity>

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
            onPress={() => router.push("/alerts")}
          >
            <Image
              source={require("../../assets/icons/Addalert.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Add Alerts</Text>
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

      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Timeline & Thread</Text>
        <View style={styles.feedbackGrid}>
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
            onPress={() => router.push("/AdminReportsPage")}
          >
            <Image
              source={require("../../assets/icons/Report.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Report Ads</Text>
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
  },
  placeholderContainer: {
    width: "100%",
    height: 200,
    borderRadius: 10,
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
  dashboardSection: {
    marginBottom: 15,
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
    width: "30%",
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
  featuresSection: {
    marginBottom: 15,
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
  alertsSection: {
    marginBottom: 15,
  },
  alertsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  alertCard: {
    backgroundColor: "#fff",
    width: "30%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  feedbackSection: {
    marginBottom: 15,
  },
  feedbackGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  feedbackCard: {
    backgroundColor: "#fff",
    width: "27%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
});

export default AdHome;
