import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const Dashboard = () => {
  const [cropData, setCropData] = useState(null); // State for crop data
  const [financialData, setFinancialData] = useState(null); // State for financial data
  const [loading, setLoading] = useState(true);

  // Sample crop data
  const sampleCropData = [
    { crop: "Wheat", totalYield: 1500, growthCompletion: 85 },
    { crop: "Rice", totalYield: 2200, growthCompletion: 70 },
    { crop: "Corn", totalYield: 1800, growthCompletion: 90 },
    { crop: "Sugarcan", totalYield: 2200, growthCompletion: 70 },
    { crop: "Cotton", totalYield: 1800, growthCompletion: 90 },
  ];

  const testGrowthData = [50, 70, 80, 90, 60]; // Replace with static data for testing

  // Sample financial data
  const sampleFinancialData = {
    income: 50000,
    expenses: 20000,
  };

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    const fetchDashboardData = () => {
      setLoading(true);
      setTimeout(() => {
        if (isMounted) {
          // Simulating the setting of fetched data
          setCropData(sampleCropData);
          setFinancialData(sampleFinancialData);
          setLoading(false);
        }
      }, 2000); // Simulated delay for fetching
    };

    fetchDashboardData();

    return () => {
      isMounted = false; // Cleanup to prevent state update on unmounted component
    };
  }, []); // Empty dependency array means it runs once after the component mounts

  const preprocessCropData = (data) => {
    if (!Array.isArray(data)) {
      return {
        labels: ["No Data"],
        yields: [0],
        growth: [0],
      };
    }
    return {
      labels: data.map((item) => item.crop),
      yields: data.map((item) => item.totalYield),
      growth: data.map((item) => item.growthCompletion),
    };
  };

  const { labels, yields, growth } = preprocessCropData(cropData);

  const screenWidth = Dimensions.get("window").width;

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Farmer Dashboard</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {/* Crop Yield Chart */}
          <Text style={{ fontSize: 20, marginVertical: 10 }}>
            Crop Yield Production
          </Text>
          <LineChart
            data={{
              labels,
              datasets: [
                {
                  data: yields,
                },
              ],
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={{
              borderRadius: 16,
            }}
          />

          {/* Financial Chart */}
          <Text style={{ fontSize: 20, marginVertical: 10 }}>
            Financial Overview
          </Text>
          {financialData ? (
            <PieChart
              data={[
                {
                  name: "Income",
                  population: financialData.income,
                  color: "rgba(75, 192, 192, 1)",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
                {
                  name: "Expenses",
                  population: financialData.expenses,
                  color: "rgba(255, 99, 132, 1)",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
              ]}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          ) : (
            <Text>No Financial Data Available</Text>
          )}

          {/* Crop Growth Completion Chart */}
          <Text style={{ fontSize: 20, marginVertical: 10 }}>
            Crop Growth Completion
          </Text>
          <BarChart
            data={{
              labels: ["Wheat", "Rice", "Corn", "Sugarcan", "Cotton"],
              datasets: [
                {
                  data: testGrowthData,
                },
              ],
            }}
            width={screenWidth - 40}
            height={280}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={{
              borderRadius: 16,
            }}
          />
        </>
      )}
    </ScrollView>
  );
};

export default Dashboard;
