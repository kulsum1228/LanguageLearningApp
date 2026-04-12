import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import API from "../utils/api";

export default function ConversationScreen() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const fetchScenarios = async () => {
    try {
      const response = await API.get("/ai/scenarios");
      setScenarios(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScenarios(false);
    }
  };

  const selectScenario = async (scenario) => {
    setSelectedScenario(scenario);
    setMessages([]);
    setLoading(true);
    try {
      const response = await API.post("/ai/chat", {
        scenario: scenario.id,
        messages: [],
      });
      setMessages([
        {
          role: "assistant",
          content: response.data.reply,
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = { role: "user", content: inputText.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    setLoading(true);

    try {
      const response = await API.post("/ai/chat", {
        scenario: selectedScenario.id,
        messages: updatedMessages,
      });
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: response.data.reply,
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Scenario Selection Screen
  if (!selectedScenario) {
    return (
      <LinearGradient
        colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
        style={styles.gradient}
      >
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Conversation Practice</Text>
            <Text style={styles.subtitle}>
              Choose a scenario to practice your Marathi
            </Text>
          </View>

          {loadingScenarios ? (
            <ActivityIndicator color="#9D4EDD" size="large" />
          ) : (
            scenarios.map((scenario) => (
              <TouchableOpacity
                key={scenario.id}
                style={styles.scenarioCard}
                onPress={() => selectScenario(scenario)}
              >
                <Text style={styles.scenarioEmoji}>{scenario.emoji}</Text>
                <View style={styles.scenarioInfo}>
                  <Text style={styles.scenarioName}>{scenario.name}</Text>
                  <Text style={styles.scenarioHint}>
                    Tap to start practicing
                  </Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    );
  }

  // Chat Screen
  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            onPress={() => setSelectedScenario(null)}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.scenarioEmoji}>{selectedScenario.emoji}</Text>
          <Text style={styles.chatTitle}>{selectedScenario.name}</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                msg.role === "user" ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {msg.role === "assistant" && (
                <Text style={styles.aiLabel}>
                  {selectedScenario.emoji} {selectedScenario.name}
                </Text>
              )}
              <Text
                style={[
                  styles.messageText,
                  msg.role === "user" ? styles.userText : styles.aiText,
                ]}
              >
                {msg.content}
              </Text>
            </View>
          ))}
          {loading && (
            <View style={styles.aiBubble}>
              <ActivityIndicator color="#9D4EDD" size="small" />
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type in English or Marathi..."
            placeholderTextColor="#666"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <LinearGradient
              colors={["#7B2FBE", "#9D4EDD"]}
              style={styles.sendGradient}
            >
              <Text style={styles.sendText}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  container: { flex: 1, padding: 24 },
  header: { marginTop: 60, marginBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
  },
  scenarioCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2D1B69",
    flexDirection: "row",
    alignItems: "center",
  },
  scenarioEmoji: { fontSize: 32, marginRight: 16 },
  scenarioInfo: { flex: 1 },
  scenarioName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  scenarioHint: { fontSize: 13, color: "#888" },
  arrow: { fontSize: 20, color: "#9D4EDD" },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    backgroundColor: "#1A1A2E",
    borderBottomWidth: 1,
    borderBottomColor: "#2D1B69",
    gap: 12,
  },
  backButton: { marginRight: 4 },
  backText: { color: "#9D4EDD", fontSize: 24 },
  chatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: "#2D1B69",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "#1A1A2E",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#2D1B69",
  },
  aiLabel: {
    fontSize: 11,
    color: "#9D4EDD",
    fontWeight: "600",
    marginBottom: 6,
  },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: "#FFFFFF" },
  aiText: { color: "#DDDDDD" },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#1A1A2E",
    borderTopWidth: 1,
    borderTopColor: "#2D1B69",
    gap: 12,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#0D0D1A",
    borderRadius: 12,
    padding: 14,
    color: "#FFFFFF",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#2D1B69",
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  sendDisabled: { opacity: 0.5 },
  sendGradient: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
