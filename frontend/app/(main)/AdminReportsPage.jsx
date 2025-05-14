import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      const apiUrl = `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/ads/reports`;
      console.log("Fetching reports from:", apiUrl);
      console.log("Using token:", token);

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      console.log("API response status:", response.status);
      console.log("API response data:", JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        const fetchedReports = response.data.reports || [];
        console.log("Fetched reports count:", fetchedReports.length);
        setReports(fetchedReports);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch reports from server."
        );
      }
    } catch (error) {
      console.error("Error fetching reports:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });

      let errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch reports";
      if (error.response?.status === 502) {
        errorMsg =
          "Server is currently unavailable (502 Bad Gateway). Please check if the backend is running and try again.";
      }
      setErrorMessage(errorMsg);
      Alert.alert("Error", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, status) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/ads/reports/${reportId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Update status response:",
        JSON.stringify(response.data, null, 2)
      );

      if (response.data.success) {
        setReports((prevReports) =>
          prevReports.map((report) =>
            report._id === reportId ? { ...report, status } : report
          )
        );
        setStatusModalVisible(false);
        Alert.alert("Success", `Report status updated to ${status}!`);
      } else {
        throw new Error(
          response.data.message || "Failed to update report status."
        );
      }
    } catch (error) {
      console.error("Error updating status:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update status";
      Alert.alert("Error", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAd = async (adId, reportId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this advertisement?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
              const token = await AsyncStorage.getItem("token");
              if (!token) {
                throw new Error("No token found. Please log in.");
              }

              const response = await axios.delete(
                `${process.env.EXPO_PUBLIC_BACKEND_URI}/api/ads/${adId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              console.log(
                "Delete ad response:",
                JSON.stringify(response.data, null, 2)
              );

              if (response.data.success) {
                setReports((prevReports) =>
                  prevReports.map((report) =>
                    report._id === reportId
                      ? { ...report, status: "resolved" }
                      : report
                  )
                );
                Alert.alert("Success", "Advertisement deleted successfully!");
              } else {
                throw new Error(
                  response.data.message || "Failed to delete advertisement."
                );
              }
            } catch (error) {
              console.error("Error deleting ad:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
              });
              const errorMsg =
                error.response?.data?.message ||
                error.message ||
                "Failed to delete ad";
              Alert.alert("Error", errorMsg);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const openStatusModal = (report) => {
    setSelectedReport(report);
    setStatusModalVisible(true);
  };

  const openViewModal = (report) => {
    setSelectedReport(report);
    setViewModalVisible(true);
  };

  const renderReportItem = ({ item }) => (
    <View style={styles.reportCard}>
      <Text style={styles.reportTitle}>
        Ad: {item.adId?.title || "Unknown Ad"}
      </Text>
      <Text style={styles.reportText}>Reason: {item.reason || "N/A"}</Text>
      {item.additionalInfo && (
        <Text style={styles.reportText}>Details: {item.additionalInfo}</Text>
      )}
      <Text style={styles.reportText}>
        Reported At: {new Date(item.reportedAt).toLocaleString() || "N/A"}
      </Text>
      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
        Status: {item.status || "pending"}
      </Text>
      {item.status !== "resolved" && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => openViewModal(item)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>View Ad</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              handleDeleteAd(item.adId?._id || item.adId, item._id)
            }
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Delete Ad</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ff9f1a";
      case "reviewed":
        return "#2b6cb0";
      case "resolved":
        return "#2E7D32";
      default:
        return "#666";
    }
  };

  return (
    <LinearGradient colors={["#78e08f", "#b8e994"]} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Reported Advertisements 🌟</Text>
        <Text style={styles.subtitle}>
          Review and manage reported ads here!
        </Text>

        <TouchableOpacity
          style={[styles.refreshButton, isLoading && styles.disabledButton]}
          onPress={fetchReports}
          disabled={isLoading}
        >
          <LinearGradient
            colors={["#ff9f1a", "#ffaf40"]}
            style={styles.gradientButton}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Refresh Reports</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {isLoading && reports.length === 0 ? (
          <ActivityIndicator
            size="large"
            color="#2E7D32"
            style={styles.loader}
          />
        ) : reports.length === 0 ? (
          <Text style={styles.noReportsText}>No reports found</Text>
        ) : (
          <FlatList
            data={reports}
            renderItem={renderReportItem}
            keyExtractor={(item) => item._id.toString()}
            ListEmptyComponent={
              <Text style={styles.noReportsText}>No reports available</Text>
            }
            contentContainerStyle={styles.listContainer}
          />
        )}

        {/* Status Update Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={statusModalVisible}
          onRequestClose={() => setStatusModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Report Status</Text>
              {selectedReport && (
                <ScrollView>
                  <TouchableOpacity
                    style={styles.statusButton}
                    onPress={() =>
                      handleStatusUpdate(selectedReport._id, "pending")
                    }
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>Mark as Pending</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.statusButton}
                    onPress={() =>
                      handleStatusUpdate(selectedReport._id, "reviewed")
                    }
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>Mark as Reviewed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.statusButton}
                    onPress={() =>
                      handleStatusUpdate(selectedReport._id, "resolved")
                    }
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>Mark as Resolved</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setStatusModalVisible(false)}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* View Ad Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={viewModalVisible}
          onRequestClose={() => setViewModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Advertisement Details</Text>
              {selectedReport ? (
                <ScrollView>
                  {selectedReport.adId ? (
                    <>
                      <Text style={styles.modalText}>
                        Title: {selectedReport.adId.title || "Not Available"}
                      </Text>
                      <Text style={styles.modalText}>
                        Description:{" "}
                        {selectedReport.adId.description || "Not Available"}
                      </Text>
                      {selectedReport.adId.image ? (
                        <Image
                          source={{
                            uri: `${process.env.EXPO_PUBLIC_BACKEND_URI}/${selectedReport.adId.image}`,
                          }}
                          style={styles.adImage}
                          resizeMode="contain"
                          onError={(e) =>
                            console.log(
                              "Image load error:",
                              e.nativeEvent.error
                            )
                          }
                        />
                      ) : (
                        <Text style={styles.modalText}>
                          Image: Not Available
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text style={styles.modalText}>
                      This advertisement is no longer available.
                    </Text>
                  )}
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => {
                      setViewModalVisible(false);
                      openStatusModal(selectedReport);
                    }}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>Update Status</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setViewModalVisible(false)}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </ScrollView>
              ) : (
                <Text style={styles.modalText}>No report selected.</Text>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    marginVertical: 20,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#2E7D32",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 25,
    fontStyle: "italic",
  },
  refreshButton: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  gradientButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  disabledButton: {
    opacity: 0.7,
  },
  reportCard: {
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  reportText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewButton: {
    backgroundColor: "#2b6cb0",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
    flex: 1,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
    flex: 1,
    marginLeft: 5,
  },
  noReportsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    padding: 10,
    marginBottom: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  adImage: {
    width: "100%",
    height: 200,
    marginBottom: 15,
    borderRadius: 8,
  },
  statusButton: {
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
  },
  updateButton: {
    backgroundColor: "#2b6cb0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: "#718096",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
  },
});

export default AdminReportsPage;
