import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URI || "http://localhost:3000";

const GroupChat = () => {
  const [message, setMessage] = useState("");
  const [groupChat, setGroupChat] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null); // New state for user role
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupTitle, setGroupTitle] = useState(""); // For creating new thread
  const [groupDescription, setGroupDescription] = useState(""); // For creating new thread
  const [showCreateForm, setShowCreateForm] = useState(false); // Toggle create form

  // Fetch user ID, email, type, and group chats on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const decoded = decodeJWT(token);
          setUserId(decoded.userId);
          console.log("Decoded Token:", decoded);

          // Fetch user type using email from token
          const email = decoded.email;
          const typeResponse = await fetch(`${API_URL}/api/auth/type/${email}`);
          if (!typeResponse.ok) throw new Error("Failed to fetch user type");
          const { type } = await typeResponse.json();
          console.log("Fetched Type:", type);
          setUserRole(type); // Set role from backend
        } else {
          console.log("No token found");
        }

        const response = await fetch(`${API_URL}/api/group-chats`);
        if (!response.ok) throw new Error("Failed to fetch group chats");
        const chats = await response.json();
        setGroupChats(chats);

        if (chats.length > 0) {
          setGroupChat(chats[0]); // Auto-select first chat
        }
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  // Decode JWT
  const decodeJWT = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  // Create a new group chat (for farmers only)
  const handleCreateGroupChat = async () => {
    if (!groupTitle || !groupDescription) {
      Alert.alert("Error", "Please fill in both the title and description.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/group-chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: groupTitle,
          description: groupDescription,
        }),
      });
      if (!response.ok) throw new Error("Failed to create group chat");
      const newGroupChat = await response.json();
      setGroupChats((prev) => [...prev, newGroupChat]); // Add to list
      setGroupChat(newGroupChat); // Select the new chat
      Alert.alert("Success", "Group chat created successfully!");
      setGroupTitle("");
      setGroupDescription("");
      setShowCreateForm(false); // Hide form after creation
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Post a message to the group chat
  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter a message.");
      return;
    }
    if (!groupChat || !userId) {
      Alert.alert("Error", "Group chat or user not initialized!");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/group-chats/${groupChat._id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: message, senderId: userId }),
        }
      );
      if (!response.ok) throw new Error("Failed to send message");
      const updatedGroupChat = await response.json();
      setGroupChat(updatedGroupChat);
      setMessage("");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Select a group chat from the list
  const handleSelectGroupChat = async (chatId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/group-chats/${chatId}`);
      if (!response.ok) throw new Error("Failed to fetch group chat");
      const selectedChat = await response.json();
      setGroupChat(selectedChat);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Render group chat item
  const renderGroupChatItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.groupChatItem,
        groupChat && groupChat._id === item._id && styles.selectedGroupChatItem,
      ]}
      onPress={() => handleSelectGroupChat(item._id)}
    >
      <Text style={styles.groupChatTitle}>{item.title}</Text>
      <Text style={styles.groupChatDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Community Connect</Text>

      {/* Create Thread Button (Farmers Only) */}
      {userRole === "farmer" && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Text style={styles.buttonText}>
            {showCreateForm ? "Cancel" : "Create New Thread"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Create Thread Form (Farmers Only) */}
      {userRole === "farmer" && showCreateForm && (
        <View style={styles.createForm}>
          <Text style={styles.label}>Thread Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a title for your thread"
            value={groupTitle}
            onChangeText={(text) => setGroupTitle(text)}
          />
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the purpose of this thread"
            value={groupDescription}
            onChangeText={(text) => setGroupDescription(text)}
            multiline
            numberOfLines={6}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateGroupChat}
          >
            <Text style={styles.buttonText}>Create Thread</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List of Group Chats */}
      {groupChats.length > 0 && (
        <FlatList
          data={groupChats}
          renderItem={renderGroupChatItem}
          keyExtractor={(item) => item._id}
          style={styles.groupChatList}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}

      {/* Selected Group Chat Display */}
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : groupChat ? (
        <ScrollView style={styles.chatContainer}>
          <Text style={styles.groupTitle}>{groupChat.title}</Text>
          <Text style={styles.groupDescription}>{groupChat.description}</Text>

          {/* Messages Section */}
          <Text style={styles.sectionHeader}>Messages</Text>
          <View style={styles.messagesContainer}>
            {groupChat.messages.length > 0 ? (
              groupChat.messages.map((msg) => (
                <View key={msg._id} style={styles.messageBubble}>
                  <Text style={styles.messageSender}>
                    {msg.sender.name || "Unknown"}
                  </Text>
                  <Text style={styles.messageText}>{msg.text}</Text>
                  <Text style={styles.messageTimestamp}>{msg.timestamp}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noMessages}>
                No messages yet. Start the conversation!
              </Text>
            )}
          </View>

          {/* Message Input */}
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Type your message..."
            value={message}
            onChangeText={(text) => setMessage(text)}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <Text style={styles.noChats}>No group chats available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f7fa",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 25,
    color: "#1a2a44",
    letterSpacing: 0.5,
  },
  createButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createForm: {
    marginBottom: 25,
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#34495e",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e4e9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "#2c3e50",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  button: {
    backgroundColor: "#2ecc71",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  groupChatList: {
    marginBottom: 25,
  },
  groupChatItem: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e0e4e9",
    minWidth: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedGroupChatItem: {
    backgroundColor: "#e8f4fd",
    borderColor: "#2E7D32",
    borderWidth: 2,
  },
  groupChatTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2ecc71",
    marginBottom: 5,
  },
  groupChatDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  groupTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a2a44",
    textAlign: "center",
    marginBottom: 10,
  },
  groupDescription: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    color: "#34495e",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e4e9",
    paddingBottom: 5,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 20,
  },
  messageBubble: {
    backgroundColor: "#f0f3f7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 0,
  },
  messageSender: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#2c3e50",
    lineHeight: 22,
  },
  messageTimestamp: {
    fontSize: 12,
    color: "#95a5a6",
    textAlign: "right",
    marginTop: 4,
  },
  noMessages: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    fontStyle: "italic",
  },
  messageInput: {
    height: 80,
    textAlignVertical: "top",
    backgroundColor: "#f0f3f7",
    borderRadius: 12,
    padding: 12,
  },
  loadingText: {
    fontSize: 18,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  noChats: {
    fontSize: 18,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
});

export default GroupChat;
