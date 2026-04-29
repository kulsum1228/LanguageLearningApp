import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const PRACTICE_WORDS = [
  { marathi: "नमस्कार", romanized: "Namaskar", english: "Hello" },
  { marathi: "धन्यवाद", romanized: "Dhanyavaad", english: "Thank you" },
  { marathi: "हो", romanized: "Ho", english: "Yes" },
  { marathi: "नाही", romanized: "Naahi", english: "No" },
  { marathi: "माफ करा", romanized: "Maaf kara", english: "Sorry" },
  { marathi: "पाणी", romanized: "Paani", english: "Water" },
  { marathi: "जेवण", romanized: "Jevan", english: "Food" },
  { marathi: "घर", romanized: "Ghar", english: "Home" },
];

const scenarioIconMap = {
  rickshaw: "car-outline",
  market: "basket-outline",
  restaurant: "restaurant-outline",
  neighbour: "people-outline",
  doctor: "medical-outline",
  directions: "navigate-outline",
  shopkeeper: "shirt-outline",
  train: "train-outline",
};

// Parse AI response into 3 parts
const parseAIResponse = (text) => {
  if (!text) return { feedback: "", marathi: "", hint: "" };
  const lines = text.split("\n").filter((line) => line.trim());
  let feedback = "";
  let marathi = "";
  let hint = "";

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("✅") ||
      trimmed.startsWith("❌") ||
      trimmed.startsWith("Good") ||
      trimmed.startsWith("Small mistake")
    ) {
      feedback += trimmed + " ";
    } else if (
      trimmed.startsWith("💡") ||
      trimmed.toLowerCase().startsWith("hint:")
    ) {
      hint += trimmed.replace("💡", "").replace(/hint:/i, "").trim();
    } else if (trimmed.length > 0) {
      marathi += trimmed + " ";
    }
  });

  return {
    feedback: feedback.trim(),
    marathi: marathi.trim(),
    hint: hint.trim(),
  };
};

export default function PracticeScreen() {
  const [mode, setMode] = useState(null);

  if (!mode) return <PracticeHub setMode={setMode} />;
  if (mode === "word") return <WordPractice setMode={setMode} />;
  if (mode === "speak_chat") return <SpeakChat setMode={setMode} />;
  if (mode === "text_chat") return <TextChat setMode={setMode} />;
}

// ─────────────────────────────────────────
// PRACTICE HUB
// ─────────────────────────────────────────
function PracticeHub({ setMode }) {
  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
      style={styles.gradient}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Practice</Text>
          <Text style={styles.subtitle}>Choose how you want to practice</Text>
        </View>

        <TouchableOpacity
          style={styles.modeCard}
          onPress={() => setMode("word")}
        >
          <View style={[styles.modeIconBox, { backgroundColor: "#1A3A2A" }]}>
            <Ionicons name="volume-high" size={32} color="#4CAF50" />
          </View>
          <View style={styles.modeInfo}>
            <Text style={styles.modeName}>Word Practice</Text>
            <Text style={styles.modeDesc}>
              Pronounce individual words and get instant pronunciation feedback
            </Text>
            <View style={styles.modeBadge}>
              <Text style={styles.modeBadgeText}>Beginner Friendly</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9D4EDD" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modeCard}
          onPress={() => setMode("speak_chat")}
        >
          <View style={[styles.modeIconBox, { backgroundColor: "#2D1B69" }]}>
            <Ionicons name="mic" size={32} color="#9D4EDD" />
          </View>
          <View style={styles.modeInfo}>
            <Text style={styles.modeName}>Speak & Chat</Text>
            <Text style={styles.modeDesc}>
              Have real voice conversations with AI in different scenarios
            </Text>
            <View style={[styles.modeBadge, { backgroundColor: "#2D1B44" }]}>
              <Text style={[styles.modeBadgeText, { color: "#9D4EDD" }]}>
                Recommended
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9D4EDD" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modeCard}
          onPress={() => setMode("text_chat")}
        >
          <View style={[styles.modeIconBox, { backgroundColor: "#1A2A3A" }]}>
            <Ionicons name="chatbubbles" size={32} color="#2196F3" />
          </View>
          <View style={styles.modeInfo}>
            <Text style={styles.modeName}>Text Chat</Text>
            <Text style={styles.modeDesc}>
              Practice Marathi conversations by typing with AI scenarios
            </Text>
            <View style={[styles.modeBadge, { backgroundColor: "#1A2A3A" }]}>
              <Text style={[styles.modeBadgeText, { color: "#2196F3" }]}>
                Type to Practice
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9D4EDD" />
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────
// WORD PRACTICE
// ─────────────────────────────────────────
function WordPractice({ setMode }) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const status = await AudioModule.requestRecordingPermissionsAsync();
    setPermissionGranted(status.granted);
  };

  const currentWord = PRACTICE_WORDS[currentIndex];

  const startRecording = async () => {
    if (!permissionGranted) {
      await requestPermission();
      return;
    }
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      Alert.alert("Error", "Failed to start recording.");
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) {
        Alert.alert("Error", "No recording found.");
        return;
      }
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });
      const transcribeRes = await API.post("/ai/transcribe", {
        audio_base64: base64Audio,
        filename: "recording.m4a",
      });
      const evalRes = await API.post("/ai/evaluate-pronunciation", {
        transcribed_text: transcribeRes.data.text,
        expected_text: currentWord.marathi,
        language: "marathi",
      });
      setResult({ transcribed: transcribeRes.data.text, ...evalRes.data });
    } catch (err) {
      Alert.alert("Error", "Could not process recording.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getScoreColor = (score) =>
    score >= 80 ? "#4CAF50" : score >= 50 ? "#FF9800" : "#F44336";
  const getScoreIcon = (score) =>
    score >= 80
      ? "checkmark-circle"
      : score >= 50
        ? "alert-circle"
        : "close-circle";

  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
      style={styles.gradient}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
      >
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => setMode(null)}>
            <Ionicons name="arrow-back" size={24} color="#9D4EDD" />
          </TouchableOpacity>
          <Text style={styles.topNavTitle}>Word Practice</Text>
          <Text style={styles.topNavCount}>
            {currentIndex + 1}/{PRACTICE_WORDS.length}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentIndex + 1) / PRACTICE_WORDS.length) * 100}%`,
              },
            ]}
          />
        </View>

        <View style={styles.wordCard}>
          <Text style={styles.englishWord}>{currentWord.english}</Text>
          <Text style={styles.marathiWord}>{currentWord.marathi}</Text>
          <Text style={styles.romanized}>{currentWord.romanized}</Text>
          <TouchableOpacity
            style={styles.listenButton}
            onPress={() =>
              Speech.speak(currentWord.marathi, {
                language: "mr-IN",
                rate: 0.7,
              })
            }
          >
            <Ionicons name="volume-high" size={20} color="#9D4EDD" />
            <Text style={styles.listenText}>Hear pronunciation</Text>
          </TouchableOpacity>
        </View>

        {!result && !isProcessing && (
          <View style={styles.instructionBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#9D4EDD"
            />
            <Text style={styles.instructionText}>
              {isRecording
                ? "Speak now... tap stop when done"
                : "Tap microphone and pronounce the word"}
            </Text>
          </View>
        )}

        {!isProcessing && !result && (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <LinearGradient
              colors={
                isRecording ? ["#F44336", "#FF6B6B"] : ["#7B2FBE", "#9D4EDD"]
              }
              style={styles.recordGradient}
            >
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={40}
                color="#fff"
              />
              <Text style={styles.recordText}>
                {isRecording ? "Stop Recording" : "Start Speaking"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {isProcessing && (
          <View style={styles.processingBox}>
            <ActivityIndicator color="#9D4EDD" size="large" />
            <Text style={styles.processingText}>
              Analyzing pronunciation...
            </Text>
          </View>
        )}

        {result && (
          <View style={styles.resultContainer}>
            <View
              style={[
                styles.scoreCard,
                { borderColor: getScoreColor(result.score) },
              ]}
            >
              <Ionicons
                name={getScoreIcon(result.score)}
                size={48}
                color={getScoreColor(result.score)}
              />
              <Text
                style={[
                  styles.scoreNumber,
                  { color: getScoreColor(result.score) },
                ]}
              >
                {result.score}%
              </Text>
              <Text style={styles.scoreLabel}>Pronunciation Score</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>You said:</Text>
              <Text style={styles.infoText}>
                {result.transcribed || "Could not detect speech"}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Feedback:</Text>
              <Text style={styles.infoText}>{result.feedback}</Text>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.pronunciationRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Correct pronunciation:</Text>
                  <Text style={styles.infoText}>
                    {result.correct_pronunciation}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.speakIconButton}
                  onPress={() =>
                    Speech.speak(currentWord.marathi, {
                      language: "mr-IN",
                      rate: 0.7,
                    })
                  }
                >
                  <Ionicons name="volume-high" size={24} color="#9D4EDD" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.encouragement}>{result.encouragement}</Text>

            <View style={styles.resultButtons}>
              <TouchableOpacity
                style={styles.tryAgainButton}
                onPress={() => setResult(null)}
              >
                <Ionicons name="refresh" size={18} color="#9D4EDD" />
                <Text style={styles.tryAgainText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => {
                  setResult(null);
                  setCurrentIndex((currentIndex + 1) % PRACTICE_WORDS.length);
                }}
              >
                <LinearGradient
                  colors={["#7B2FBE", "#9D4EDD"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextGradient}
                >
                  <Text style={styles.nextText}>Next Word</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────
// SPEAK & CHAT
// ─────────────────────────────────────────
function SpeakChat({ setMode }) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchScenarios();
    requestPermission();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const fetchScenarios = async () => {
    try {
      const res = await API.get("/ai/scenarios");
      setScenarios(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const requestPermission = async () => {
    const status = await AudioModule.requestRecordingPermissionsAsync();
    setPermissionGranted(status.granted);
  };

  const selectScenario = async (scenario) => {
    setSelectedScenario(scenario);
    setMessages([]);
    setIsProcessing(true);
    try {
      const res = await API.post("/ai/chat", {
        scenario: scenario.id,
        messages: [],
      });
      const reply = res.data.reply;
      const parsed = parseAIResponse(reply);
      setMessages([{ role: "assistant", content: reply, parsed }]);
      if (parsed.marathi)
        Speech.speak(parsed.marathi, { language: "mr-IN", rate: 0.8 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    if (!permissionGranted) {
      await requestPermission();
      return;
    }
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (err) {
      Alert.alert("Error", "Failed to start recording.");
    }
  };

  const stopAndSend = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) return;

      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });
      const transcribeRes = await API.post("/ai/transcribe", {
        audio_base64: base64Audio,
        filename: "recording.m4a",
      });
      const transcribedText = transcribeRes.data.text;

      if (!transcribedText?.trim()) {
        Alert.alert("No speech detected", "Please try speaking again.");
        return;
      }

      const userMessage = { role: "user", content: transcribedText };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      const chatRes = await API.post("/ai/chat", {
        scenario: selectedScenario.id,
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const reply = chatRes.data.reply;
      const parsed = parseAIResponse(reply);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: reply, parsed },
      ]);
      if (parsed.marathi)
        Speech.speak(parsed.marathi, { language: "mr-IN", rate: 0.8 });
    } catch (err) {
      Alert.alert("Error", "Could not process your speech.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedScenario) {
    return (
      <LinearGradient
        colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
        >
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => setMode(null)}>
              <Ionicons name="arrow-back" size={24} color="#9D4EDD" />
            </TouchableOpacity>
            <Text style={styles.topNavTitle}>Speak & Chat</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.sectionLabel}>Choose a scenario to practice</Text>

          {scenarios.map((scenario) => (
            <TouchableOpacity
              key={scenario.id}
              style={styles.scenarioCard}
              onPress={() => selectScenario(scenario)}
            >
              <View style={styles.scenarioIconBox}>
                <Ionicons
                  name={scenarioIconMap[scenario.id] || "chatbubble-outline"}
                  size={28}
                  color="#9D4EDD"
                />
              </View>
              <View style={styles.scenarioInfo}>
                <Text style={styles.scenarioName}>{scenario.name}</Text>
                <Text style={styles.scenarioHint}>Speak in Marathi</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9D4EDD" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
      style={styles.gradient}
    >
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedScenario(null)}>
            <Ionicons name="arrow-back" size={24} color="#9D4EDD" />
          </TouchableOpacity>
          <View style={styles.chatIconBox}>
            <Ionicons
              name={
                scenarioIconMap[selectedScenario.id] || "chatbubble-outline"
              }
              size={22}
              color="#9D4EDD"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chatTitle}>{selectedScenario.name}</Text>
            <Text style={styles.chatSubtitle}>Voice conversation</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => (
            <View key={index} style={styles.messageWrapper}>
              {msg.role === "user" ? (
                <View style={styles.userBubble}>
                  <Text style={styles.userLabel}>You said</Text>
                  <Text style={styles.userText}>{msg.content}</Text>
                </View>
              ) : (
                <View style={styles.aiBubbleContainer}>
                  {/* Feedback box */}
                  {msg.parsed?.feedback ? (
                    <View
                      style={[
                        styles.feedbackBubble,
                        msg.parsed.feedback.includes("✅")
                          ? styles.feedbackGood
                          : styles.feedbackCorrect,
                      ]}
                    >
                      <Text style={styles.feedbackBubbleText}>
                        {msg.parsed.feedback}
                      </Text>
                    </View>
                  ) : null}

                  {/* Marathi response */}
                  <View style={styles.aiBubble}>
                    <View style={styles.aiMessageHeader}>
                      <Text style={styles.aiLabel}>
                        {selectedScenario.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const text = msg.parsed?.marathi || msg.content;
                          Speech.speak(text, { language: "mr-IN", rate: 0.8 });
                        }}
                      >
                        <Ionicons
                          name="volume-high-outline"
                          size={16}
                          color="#9D4EDD"
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.marathiResponseText}>
                      {msg.parsed?.marathi || msg.content}
                    </Text>
                  </View>

                  {/* Hint box */}
                  {msg.parsed?.hint ? (
                    <View style={styles.hintBubble}>
                      <Ionicons name="bulb-outline" size={14} color="#FFD700" />
                      <Text style={styles.hintBubbleText}>
                        {msg.parsed.hint}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          ))}
          {isProcessing && (
            <View style={styles.aiBubble}>
              <ActivityIndicator color="#9D4EDD" size="small" />
            </View>
          )}
        </ScrollView>

        <View style={styles.voiceInputContainer}>
          <Text style={styles.voiceHint}>
            {isRecording
              ? "Listening... tap to send"
              : "Tap to speak in Marathi"}
          </Text>
          <TouchableOpacity
            style={[
              styles.voiceButton,
              isRecording && styles.voiceButtonActive,
            ]}
            onPress={isRecording ? stopAndSend : startRecording}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={
                isRecording ? ["#F44336", "#FF6B6B"] : ["#7B2FBE", "#9D4EDD"]
              }
              style={styles.voiceButtonGradient}
            >
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={32}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>
          {isProcessing && (
            <Text style={styles.processingHint}>Processing...</Text>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────
// TEXT CHAT
// ─────────────────────────────────────────
function TextChat({ setMode }) {
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
      const res = await API.get("/ai/scenarios");
      setScenarios(res.data);
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
      const res = await API.post("/ai/chat", {
        scenario: scenario.id,
        messages: [],
      });
      const reply = res.data.reply;
      const parsed = parseAIResponse(reply);
      setMessages([{ role: "assistant", content: reply, parsed }]);
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
      const res = await API.post("/ai/chat", {
        scenario: selectedScenario.id,
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });
      const reply = res.data.reply;
      const parsed = parseAIResponse(reply);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: reply, parsed },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedScenario) {
    return (
      <LinearGradient
        colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
        >
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => setMode(null)}>
              <Ionicons name="arrow-back" size={24} color="#9D4EDD" />
            </TouchableOpacity>
            <Text style={styles.topNavTitle}>Text Chat</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.sectionLabel}>Choose a scenario to practice</Text>

          {loadingScenarios ? (
            <ActivityIndicator color="#9D4EDD" size="large" />
          ) : (
            scenarios.map((scenario) => (
              <TouchableOpacity
                key={scenario.id}
                style={styles.scenarioCard}
                onPress={() => selectScenario(scenario)}
              >
                <View style={styles.scenarioIconBox}>
                  <Ionicons
                    name={scenarioIconMap[scenario.id] || "chatbubble-outline"}
                    size={28}
                    color="#9D4EDD"
                  />
                </View>
                <View style={styles.scenarioInfo}>
                  <Text style={styles.scenarioName}>{scenario.name}</Text>
                  <Text style={styles.scenarioHint}>
                    Type in English or Marathi
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9D4EDD" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedScenario(null)}>
            <Ionicons name="arrow-back" size={24} color="#9D4EDD" />
          </TouchableOpacity>
          <View style={styles.chatIconBox}>
            <Ionicons
              name={
                scenarioIconMap[selectedScenario.id] || "chatbubble-outline"
              }
              size={22}
              color="#9D4EDD"
            />
          </View>
          <Text style={styles.chatTitle}>{selectedScenario.name}</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => (
            <View key={index} style={styles.messageWrapper}>
              {msg.role === "user" ? (
                <View style={styles.userBubble}>
                  <Text style={styles.userLabel}>You said</Text>
                  <Text style={styles.userText}>{msg.content}</Text>
                </View>
              ) : (
                <View style={styles.aiBubbleContainer}>
                  {/* Feedback box */}
                  {msg.parsed?.feedback ? (
                    <View
                      style={[
                        styles.feedbackBubble,
                        msg.parsed.feedback.includes("✅")
                          ? styles.feedbackGood
                          : styles.feedbackCorrect,
                      ]}
                    >
                      <Text style={styles.feedbackBubbleText}>
                        {msg.parsed.feedback}
                      </Text>
                    </View>
                  ) : null}

                  {/* Marathi response */}
                  <View style={styles.aiBubble}>
                    <Text style={styles.aiLabel}>{selectedScenario.name}</Text>
                    <Text style={styles.marathiResponseText}>
                      {msg.parsed?.marathi || msg.content}
                    </Text>
                  </View>

                  {/* Hint box */}
                  {msg.parsed?.hint ? (
                    <View style={styles.hintBubble}>
                      <Ionicons name="bulb-outline" size={14} color="#FFD700" />
                      <Text style={styles.hintBubbleText}>
                        {msg.parsed.hint}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          ))}
          {loading && (
            <View style={styles.aiBubble}>
              <ActivityIndicator color="#9D4EDD" size="small" />
            </View>
          )}
        </ScrollView>

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
              <Ionicons name="send" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollView: { flex: 1 },
  container: { padding: 24, paddingBottom: 100 },
  header: { marginTop: 60, marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF" },
  subtitle: { fontSize: 14, color: "#888", marginTop: 4 },

  modeCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2D1B69",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  modeIconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  modeInfo: { flex: 1, gap: 6 },
  modeName: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },
  modeDesc: { fontSize: 13, color: "#888", lineHeight: 18 },
  modeBadge: {
    backgroundColor: "#1A3A2A",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  modeBadgeText: { fontSize: 11, color: "#4CAF50", fontWeight: "600" },

  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 60,
    marginBottom: 24,
  },
  topNavTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },
  topNavCount: { fontSize: 14, color: "#9D4EDD" },
  sectionLabel: { fontSize: 16, color: "#888", marginBottom: 16 },

  progressBar: {
    height: 6,
    backgroundColor: "#2D1B69",
    borderRadius: 3,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#9D4EDD", borderRadius: 3 },

  wordCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D1B69",
    marginBottom: 24,
    gap: 8,
  },
  englishWord: { fontSize: 18, color: "#888" },
  marathiWord: { fontSize: 52, fontWeight: "bold", color: "#FFFFFF" },
  romanized: { fontSize: 20, color: "#9D4EDD", fontWeight: "500" },
  listenButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    backgroundColor: "#2D1B69",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listenText: { color: "#9D4EDD", fontSize: 14 },

  instructionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2D1B69",
  },
  instructionText: { color: "#CCC", fontSize: 14, flex: 1 },

  recordButton: { borderRadius: 20, overflow: "hidden", marginBottom: 24 },
  recordGradient: { padding: 24, alignItems: "center", gap: 12 },
  recordText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  processingBox: { alignItems: "center", padding: 32, gap: 16 },
  processingText: { color: "#888", fontSize: 16 },

  resultContainer: { gap: 16 },
  scoreCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    gap: 8,
  },
  scoreNumber: { fontSize: 48, fontWeight: "bold" },
  scoreLabel: { color: "#888", fontSize: 14 },
  infoBox: {
    backgroundColor: "#1A1A2E",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2D1B69",
    gap: 6,
  },
  infoLabel: { color: "#9D4EDD", fontSize: 12, fontWeight: "600" },
  infoText: { color: "#FFFFFF", fontSize: 15, lineHeight: 22 },
  pronunciationRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  speakIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2D1B69",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9D4EDD",
  },
  encouragement: {
    color: "#9D4EDD",
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  resultButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  tryAgainButton: {
    flex: 1,
    backgroundColor: "#1A1A2E",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D1B69",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  tryAgainText: { color: "#9D4EDD", fontSize: 15, fontWeight: "600" },
  nextButton: { flex: 2, borderRadius: 14, overflow: "hidden" },
  nextGradient: {
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  nextText: { color: "#fff", fontSize: 15, fontWeight: "bold" },

  scenarioCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2D1B69",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scenarioIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#2D1B69",
    justifyContent: "center",
    alignItems: "center",
  },
  scenarioInfo: { flex: 1 },
  scenarioName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  scenarioHint: { fontSize: 13, color: "#888" },

  chatContainer: { flex: 1 },
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
  chatIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#2D1B69",
    justifyContent: "center",
    alignItems: "center",
  },
  chatTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF", flex: 1 },
  chatSubtitle: { fontSize: 12, color: "#888" },
  messagesContainer: { flex: 1, padding: 16 },

  messageWrapper: { marginBottom: 16 },
  aiBubbleContainer: { gap: 6, maxWidth: "90%" },

  feedbackBubble: { borderRadius: 12, padding: 10, borderWidth: 1 },
  feedbackGood: { backgroundColor: "#1A3A1A", borderColor: "#4CAF50" },
  feedbackCorrect: { backgroundColor: "#3A2A1A", borderColor: "#FF9800" },
  feedbackBubbleText: { color: "#FFFFFF", fontSize: 13, lineHeight: 18 },

  aiBubble: {
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2D1B69",
    borderBottomLeftRadius: 4,
  },
  aiMessageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  aiLabel: {
    fontSize: 11,
    color: "#9D4EDD",
    fontWeight: "600",
    marginBottom: 4,
  },
  marathiResponseText: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 26,
    fontWeight: "500",
  },

  hintBubble: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#2A2A1A",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  hintBubbleText: { color: "#FFD700", fontSize: 13, flex: 1, lineHeight: 18 },

  userBubble: {
    backgroundColor: "#2D1B69",
    borderRadius: 16,
    padding: 14,
    alignSelf: "flex-end",
    maxWidth: "85%",
    borderBottomRightRadius: 4,
  },
  userLabel: {
    fontSize: 11,
    color: "#9D4EDD",
    marginBottom: 4,
    fontWeight: "600",
  },
  userText: { color: "#FFFFFF", fontSize: 15, lineHeight: 22 },

  voiceInputContainer: {
    padding: 20,
    backgroundColor: "#1A1A2E",
    borderTopWidth: 1,
    borderTopColor: "#2D1B69",
    alignItems: "center",
    gap: 12,
  },
  voiceHint: { color: "#888", fontSize: 14 },
  voiceButton: { borderRadius: 40, overflow: "hidden" },
  voiceButtonActive: {
    shadowColor: "#F44336",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  voiceButtonGradient: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  processingHint: { color: "#9D4EDD", fontSize: 13 },

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
  sendButton: { borderRadius: 12, overflow: "hidden" },
  sendDisabled: { opacity: 0.5 },
  sendGradient: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  messageBubble: {
    maxWidth: "85%",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  messageText: { fontSize: 15, lineHeight: 22 },
  aiText: { color: "#DDDDDD" },
});
