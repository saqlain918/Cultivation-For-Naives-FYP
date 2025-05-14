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
  const [userRole, setUserRole] = useState(null);
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const decoded = decodeJWT(token);
          setUserId(decoded.userId);

          const email = decoded.email;
          const typeResponse = await fetch(`${API_URL}/api/auth/type/${email}`);
          if (!typeResponse.ok) throw new Error("Failed to fetch user type");
          const { type } = await typeResponse.json();
          setUserRole(type);
        }

        const response = await fetch(`${API_URL}/api/group-chats`);
        if (!response.ok) throw new Error("Failed to fetch group chats");
        const chats = await response.json();

        // Ensure messages have sender data
        const sanitizedChats = chats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((msg) => ({
            ...msg,
            sender: msg.sender || { name: "Anonymous" },
          })),
        }));

        setGroupChats(sanitizedChats);
        if (sanitizedChats.length > 0) {
          setGroupChat(sanitizedChats[0]);
        }
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

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
      setGroupChats((prev) => [...prev, newGroupChat]);
      setGroupChat(newGroupChat);
      Alert.alert("Success", "Group chat created successfully!");
      setGroupTitle("");
      setGroupDescription("");
      setShowCreateForm(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

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
          body: JSON.stringify({
            text: message,
            senderId: userId,
            sender: {
              id: userId,
              name: (await AsyncStorage.getItem("userName")) || "Anonymous",
            },
          }),
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

  const handleSelectGroupChat = async (chatId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/group-chats/${chatId}`);
      if (!response.ok) throw new Error("Failed to fetch group chat");
      const selectedChat = await response.json();
      setGroupChat({
        ...selectedChat,
        messages: selectedChat.messages.map((msg) => ({
          ...msg,
          sender: msg.sender || { name: "Anonymous" },
        })),
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

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

      {userRole === "farmer" && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Text style={styles.buttonText}>
            {showCreateForm ? "Close" : "Start a Thread"}
          </Text>
        </TouchableOpacity>
      )}

      {userRole === "farmer" && showCreateForm && (
        <View style={styles.createForm}>
          <Text style={styles.label}>Thread Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Give it a catchy title!"
            placeholderTextColor="#a3bffa"
            value={groupTitle}
            onChangeText={(text) => setGroupTitle(text)}
          />
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What’s this thread about?"
            placeholderTextColor="#a3bffa"
            value={groupDescription}
            onChangeText={(text) => setGroupDescription(text)}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateGroupChat}
          >
            <Text style={styles.buttonText}>Launch Thread</Text>
          </TouchableOpacity>
        </View>
      )}

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

      {loading ? (
        <Text style={styles.loadingText}>Loading the vibe...</Text>
      ) : groupChat ? (
        <ScrollView style={styles.chatContainer}>
          <Text style={styles.groupTitle}>{groupChat.title}</Text>
          <Text style={styles.groupDescription}>{groupChat.description}</Text>

          <Text style={styles.sectionHeader}>Chat Zone</Text>
          <View style={styles.messagesContainer}>
            {groupChat.messages.length > 0 ? (
              groupChat.messages.map((msg) => (
                <View key={msg._id} style={styles.messageBubble}>
                  <Text style={styles.messageSender}>
                    {msg.sender?.name || "Anonymous User"}
                  </Text>
                  <Text style={styles.messageText}>{msg.text}</Text>
                  <Text style={styles.messageTimestamp}>
                    {new Date(msg.timestamp).toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noMessages}>
                Quiet here... Drop a message!
              </Text>
            )}
          </View>

          <View style={styles.messageInputContainer}>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Say something awesome..."
              placeholderTextColor="#a3bffa"
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
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.noChats}>No threads yet—create one!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2ecc71",
    paddingVertical: 25,
    paddingHorizontal: 15,
  },
  header: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 1.5,
    textShadowColor: "#2E7D32",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  createButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignSelf: "center",
    marginBottom: 25,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  createForm: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 25,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(11, 83, 32, 0.3)",
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#2E7D32",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#fff",
    marginBottom: 20,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  textArea: {
    height: 110,
    textAlignVertical: "top",
    paddingTop: 15,
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  groupChatList: {
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  groupChatItem: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 15,
    marginRight: 15,
    minWidth: 250,
    maxWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(13, 107, 18, 0.2)",
  },
  selectedGroupChatItem: {
    backgroundColor: "#e0e7ff",
    borderColor: "#2E7D32",
    borderWidth: 2,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  groupChatTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  groupChatDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    numberOfLines: 2,
    ellipsizeMode: "tail",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  groupTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 1,
  },
  groupDescription: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 25,
    textAlign: "center",
    lineHeight: 24,
    fontStyle: "italic",
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 25,
  },
  messageBubble: {
    backgroundColor: "#e0e7ff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  messageSender: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 6,
  },
  messageText: {
    fontSize: 16,
    color: "#1e293b",
    lineHeight: 24,
  },
  messageTimestamp: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "right",
    marginTop: 6,
    fontStyle: "italic",
  },
  noMessages: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginVertical: 25,
    fontStyle: "italic",
  },
  messageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  messageInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: "#fff",
    borderColor: "#2E7D32",
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingText: {
    fontSize: 18,
    color: "#2E7D32",
    textAlign: "center",
    marginTop: 30,
    fontStyle: "italic",
  },
  noChats: {
    fontSize: 18,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 30,
    fontStyle: "italic",
  },
});

export default GroupChat;
