const API_URL = process.env.EXPO_PUBLIC_API_URL;

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });
    // ... rest of your login logic
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

const register = async (userData) => {
  try {
    const response = await axios.post(
      "http://10.54.26.7:8081/api/auth/register",
      userData
    );
    // ... rest of your register logic
  } catch (error) {
    console.error("Register Error:", error);
    throw error;
  }
};
