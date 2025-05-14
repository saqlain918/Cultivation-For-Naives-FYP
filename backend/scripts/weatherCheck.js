// import axios from "axios";
// import cron from "node-cron";

// const createTestAlert = async () => {
//   try {
//     console.log("Creating test weather alert...");
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     const response = await axios.post(
//       "http://localhost:5000/api/alert/weather",
//       {
//         region: "Pakistan",
//         weatherCondition: "Rain",
//         message: `Rain Expected tomorrow (${tomorrow.toLocaleDateString()}) in chiniot`,
//       }
//     );
//     console.log(" alert created:", response.data);
//   } catch (err) {
//     console.error("Error creating test alert:", err.message);
//   }
// };

// // Run immediately for testing
// createTestAlert();

// // Cron job (disabled for now)
// cron.schedule("0 0 * * *", () => {
//   console.log("Cron job would run here");
// });

import axios from "axios";
import cron from "node-cron";
import mongoose from "mongoose";

const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Date(date).toDateString() === tomorrow.toDateString();
};

const checkWeather = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/cultivation");
    const User = mongoose.model("users");
    const users = await User.find({
      latitude: { $ne: null },
      longitude: { $ne: null },
    });
    console.log("Found users:", users.length);
    if (users.length === 0) {
      console.log("No users with location data, skipping weather check");
      return;
    }

    for (const user of users) {
      console.log(
        `Checking weather for user ${user.email} at lat: ${user.latitude}, lon: ${user.longitude}`
      );
      const response = await axios.get(
        "https://api.open-meteo.com/v1/forecast",
        {
          params: {
            latitude: user.latitude,
            longitude: user.longitude,
            daily: "precipitation_sum",
            timezone: "auto",
          },
        }
      );
      const weatherData = response.data.daily;
      console.log(`Weather data for ${user.email}:`, weatherData);

      weatherData.time.forEach(async (date, index) => {
        if (isTomorrow(date) && weatherData.precipitation_sum[index] > 0) {
          console.log(`Creating weather alert for ${user.email} on ${date}`);
          try {
            await axios.post("http://localhost:5000/api/alert/weather", {
              region: `User Location (${user.latitude}, ${user.longitude})`,
              weatherCondition: "Rain",
              message: `Rain expected tomorrow (${new Date(
                date
              ).toLocaleDateString()})`,
              userId: user._id,
            });
          } catch (postErr) {
            console.error(
              `Error posting alert for ${user.email}:`,
              postErr.message
            );
          }
        }
      });
    }
  } catch (err) {
    console.error("Weather check error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
};

cron.schedule("0 0 * * *", checkWeather);
