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
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../utils/api";
import { theme } from "../utils/theme";

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

const parseAIResponse = (reply) => {
  // Backend now returns a JSON object directly
  if (typeof reply === "object" && reply !== null) {
    return {
      feedback: reply.feedback || "",
      marathi: reply.marathi || "",
      hint: reply.hint || "",
      translation: reply.translation || "",
    };
  }
  // Fallback for plain string
  return {
    feedback: "",
    marathi: typeof reply === "string" ? reply : "",
    hint: "",
    translation: "",
  };
};

// ─────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────
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
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Practice</Text>
          <Text style={styles.subtitle}>Choose how you want to practice</Text>
        </View>

        <TouchableOpacity
          style={styles.modeCard}
          onPress={() => setMode("word")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.modeIconBox,
              { backgroundColor: theme.successLight },
            ]}
          >
            <Ionicons name="volume-high" size={32} color={theme.success} />
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
          <Ionicons name="chevron-forward" size={20} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modeCard}
          onPress={() => setMode("speak_chat")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.modeIconBox,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Ionicons name="mic" size={32} color={theme.primary} />
          </View>
          <View style={styles.modeInfo}>
            <Text style={styles.modeName}>Speak & Chat</Text>
            <Text style={styles.modeDesc}>
              Have real voice conversations with AI in different scenarios
            </Text>
            <View
              style={[
                styles.modeBadge,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <Text style={[styles.modeBadgeText, { color: theme.primary }]}>
                Recommended
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modeCard}
          onPress={() => setMode("text_chat")}
          activeOpacity={0.7}
        >
          <View style={[styles.modeIconBox, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="chatbubbles" size={32} color="#2196F3" />
          </View>
          <View style={styles.modeInfo}>
            <Text style={styles.modeName}>Text Chat</Text>
            <Text style={styles.modeDesc}>
              Practice Marathi conversations by typing with AI scenarios
            </Text>
            <View style={[styles.modeBadge, { backgroundColor: "#E3F2FD" }]}>
              <Text style={[styles.modeBadgeText, { color: "#2196F3" }]}>
                Type to Practice
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.primary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    score >= 80 ? theme.success : score >= 50 ? theme.warning : theme.error;
  const getScoreIcon = (score) =>
    score >= 80
      ? "checkmark-circle"
      : score >= 50
        ? "alert-circle"
        : "close-circle";

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => setMode(null)}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
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
            onPress={() => {
              Speech.stop();
              Speech.speak(currentWord.marathi, {
                language: "mr-IN",
                rate: 0.7,
              });
            }}
          >
            <Ionicons name="volume-high" size={20} color={theme.primary} />
            <Text style={styles.listenText}>Hear pronunciation</Text>
          </TouchableOpacity>
        </View>

        {!result && !isProcessing && (
          <View style={styles.instructionBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.primary}
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
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isRecording ? [theme.error, "#FF6B6B"] : theme.primaryGradient
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
            <ActivityIndicator color={theme.primary} size="large" />
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
                  onPress={() => {
                    Speech.stop();
                    Speech.speak(currentWord.marathi, {
                      language: "mr-IN",
                      rate: 0.7,
                    });
                  }}
                >
                  <Ionicons
                    name="volume-high"
                    size={24}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.encouragement}>{result.encouragement}</Text>

            <View style={styles.resultButtons}>
              <TouchableOpacity
                style={styles.tryAgainButton}
                onPress={() => setResult(null)}
              >
                <Ionicons name="refresh" size={18} color={theme.primary} />
                <Text style={styles.tryAgainText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => {
                  setResult(null);
                  setCurrentIndex((currentIndex + 1) % PRACTICE_WORDS.length);
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={theme.primaryGradient}
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
    </View>
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
  const [showSummary, setShowSummary] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchScenarios();
    requestPermission();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // const fetchScenarios = async () => {
  //   try {
  //     const res = await API.get("/ai/scenarios");
  //     setScenarios(res.data);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  const fetchScenarios = async () => {
    try {
      const res = await API.get("/ai/scenarios");
      setScenarios(res.data);
    } catch (err) {
      Alert.alert(
        "Debug",
        err.message + "\n" + JSON.stringify(err.response?.data),
      );
    }
  };

  const requestPermission = async () => {
    const status = await AudioModule.requestRecordingPermissionsAsync();
    setPermissionGranted(status.granted);
  };

  const selectScenario = async (scenario) => {
    setSelectedScenario(scenario);
    setMessages([]);
    setShowSummary(false);
    setIsProcessing(true);
    try {
      const res = await API.post("/ai/chat", {
        scenario: scenario.id,
        messages: [],
      });
      const parsed = parseAIResponse(res.data.reply);
      setMessages([{ role: "assistant", content: res.data.reply, parsed }]);
      if (parsed.marathi) {
        Speech.stop();
        Speech.speak(String(parsed.marathi), { language: "mr-IN", rate: 0.8 });
      }
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
      Speech.stop();
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      await audioRecorder.prepareToRecordAsync(); // This resets it for new recording
      audioRecorder.record();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      Alert.alert("Error", "Failed to start recording.");
    }
  };

  const stopAndSend = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (!uri) {
        setIsProcessing(false);
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
      const transcribedText = transcribeRes.data.text;

      if (!transcribedText?.trim()) {
        setIsProcessing(false);
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
          content:
            typeof m.content === "object"
              ? m.content.marathi || JSON.stringify(m.content)
              : m.content,
        })),
      });

      const parsed = parseAIResponse(chatRes.data.reply);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: chatRes.data.reply, parsed },
      ]);
      if (parsed.marathi) {
        Speech.stop();
        Speech.speak(String(parsed.marathi), { language: "mr-IN", rate: 0.8 });
      }
    } catch (err) {
      console.error("Full error:", err.message);
      console.error("Response:", err.response?.data);
      Alert.alert(
        "Error",
        err.response?.data?.error ||
          err.message ||
          "Could not process your speech.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Session Summary
  if (showSummary) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
        <LinearGradient
          colors={theme.primaryGradient}
          style={styles.summaryHeader}
        >
          <Text style={styles.summaryHeaderTitle}>Session Summary</Text>
          <Text style={styles.summaryHeaderSubtitle}>
            {selectedScenario?.name}
          </Text>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.summaryContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatNumber}>
                {messages.filter((m) => m.role === "user").length}
              </Text>
              <Text style={styles.summaryStatLabel}>Responses</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatNumber}>
                {
                  messages.filter(
                    (m) =>
                      m.role === "assistant" &&
                      m.parsed?.feedback?.includes("✅"),
                  ).length
                }
              </Text>
              <Text style={styles.summaryStatLabel}>Correct</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatNumber}>
                {
                  messages.filter(
                    (m) =>
                      m.role === "assistant" &&
                      m.parsed?.feedback?.includes("❌"),
                  ).length
                }
              </Text>
              <Text style={styles.summaryStatLabel}>Corrections</Text>
            </View>
          </View>

          <Text style={styles.summarySection}>Conversation Review</Text>

          {messages.map((msg, index) => (
            <View key={index} style={styles.summaryMessage}>
              {msg.role === "user" ? (
                <View style={styles.summaryUserMsg}>
                  <Text style={styles.summaryMsgLabel}>You said:</Text>
                  <Text style={styles.summaryMsgText}>{msg.content}</Text>
                </View>
              ) : (
                <View style={styles.summaryAiMsg}>
                  {msg.parsed?.feedback ? (
                    <View
                      style={[
                        styles.summaryFeedback,
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
                  <Text style={styles.summaryMarathi}>
                    {msg.parsed?.marathi || msg.content}
                  </Text>
                  {msg.parsed?.hint ? (
                    <View style={styles.summaryHint}>
                      <Ionicons name="bulb-outline" size={14} color="#8B6914" />
                      <Text style={styles.hintBubbleText}>
                        {msg.parsed.hint}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.summaryDoneButton}
            onPress={() => {
              Speech.stop();
              setShowSummary(false);
              setSelectedScenario(null);
              setMessages([]);
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={theme.primaryGradient}
              style={styles.summaryDoneGradient}
            >
              <Text style={styles.summaryDoneText}>Back to Scenarios</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Scenario Selection
  if (!selectedScenario) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => setMode(null)}>
              <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
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
              activeOpacity={0.7}
            >
              <View style={styles.scenarioIconBox}>
                <Ionicons
                  name={scenarioIconMap[scenario.id] || "chatbubble-outline"}
                  size={28}
                  color={theme.primary}
                />
              </View>
              <View style={styles.scenarioInfo}>
                <Text style={styles.scenarioName}>{scenario.name}</Text>
                <Text style={styles.scenarioHint}>Speak in Marathi</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.primary}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Voice Chat
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.card} />
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <TouchableOpacity
            onPress={() => {
              Speech.stop();
              setSelectedScenario(null);
            }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={styles.chatIconBox}>
            <Ionicons
              name={
                scenarioIconMap[selectedScenario.id] || "chatbubble-outline"
              }
              size={22}
              color={theme.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chatTitle}>{selectedScenario.name}</Text>
            <Text style={styles.chatSubtitle}>Voice conversation</Text>
          </View>
          <TouchableOpacity
            style={styles.endButton}
            onPress={() => {
              Speech.stop();
              setShowSummary(true);
            }}
          >
            <Text style={styles.endButtonText}>End</Text>
          </TouchableOpacity>
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

                  <View style={styles.aiBubble}>
                    <View style={styles.aiMessageHeader}>
                      <Text style={styles.aiLabel}>
                        {selectedScenario.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const text = msg.parsed?.marathi || "";
                          if (text) {
                            Speech.stop();
                            Speech.speak(String(text), {
                              language: "mr-IN",
                              rate: 0.8,
                            });
                          }
                        }}
                      >
                        <Ionicons
                          name="volume-high-outline"
                          size={16}
                          color={theme.primary}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.marathiResponseText}>
                      {msg.parsed?.marathi || ""}
                    </Text>
                    {msg.parsed?.translation ? (
                      <Text style={styles.translationText}>
                        {msg.parsed.translation}
                      </Text>
                    ) : null}
                  </View>

                  {msg.parsed?.hint ? (
                    <View style={styles.hintBubble}>
                      <Ionicons name="bulb-outline" size={14} color="#8B6914" />
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
              <ActivityIndicator color={theme.primary} size="small" />
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
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isRecording ? [theme.error, "#FF6B6B"] : theme.primaryGradient
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
    </View>
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

  // const fetchScenarios = async () => {
  //   try {
  //     const res = await API.get("/ai/scenarios");
  //     setScenarios(res.data);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoadingScenarios(false);
  //   }
  // };
  const fetchScenarios = async () => {
    try {
      const res = await API.get("/ai/scenarios");
      setScenarios(res.data);
    } catch (err) {
      Alert.alert(
        "Debug",
        err.message + "\n" + JSON.stringify(err.response?.data),
      );
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
      const parsed = parseAIResponse(res.data.reply);
      setMessages([{ role: "assistant", content: res.data.reply, parsed }]);
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
          content:
            typeof m.content === "object"
              ? m.content.marathi || JSON.stringify(m.content)
              : m.content,
        })),
      });
      const reply = res.data.reply;
      const parsed = parseAIResponse(res.data.reply);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: res.data.reply, parsed },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedScenario) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => setMode(null)}>
              <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.topNavTitle}>Text Chat</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.sectionLabel}>Choose a scenario to practice</Text>

          {loadingScenarios ? (
            <ActivityIndicator color={theme.primary} size="large" />
          ) : (
            scenarios.map((scenario) => (
              <TouchableOpacity
                key={scenario.id}
                style={styles.scenarioCard}
                onPress={() => selectScenario(scenario)}
                activeOpacity={0.7}
              >
                <View style={styles.scenarioIconBox}>
                  <Ionicons
                    name={scenarioIconMap[scenario.id] || "chatbubble-outline"}
                    size={28}
                    color={theme.primary}
                  />
                </View>
                <View style={styles.scenarioInfo}>
                  <Text style={styles.scenarioName}>{scenario.name}</Text>
                  <Text style={styles.scenarioHint}>
                    Type in English or Marathi
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.primary}
                />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.card} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedScenario(null)}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={styles.chatIconBox}>
            <Ionicons
              name={
                scenarioIconMap[selectedScenario.id] || "chatbubble-outline"
              }
              size={22}
              color={theme.primary}
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
                  <Text style={styles.userText}>
                    {typeof msg.content === "string"
                      ? msg.content
                      : msg.content?.marathi || ""}
                  </Text>
                </View>
              ) : (
                <View style={styles.aiBubbleContainer}>
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

                  <View style={styles.aiBubble}>
                    <Text style={styles.aiLabel}>{selectedScenario.name}</Text>
                    <Text style={styles.marathiResponseText}>
                      {msg.parsed?.marathi || ""}
                    </Text>
                    {msg.parsed?.translation ? (
                      <Text style={styles.translationText}>
                        {msg.parsed.translation}
                      </Text>
                    ) : null}
                  </View>

                  {msg.parsed?.hint ? (
                    <View style={styles.hintBubble}>
                      <Ionicons name="bulb-outline" size={14} color="#8B6914" />
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
              <ActivityIndicator color={theme.primary} size="small" />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type in English or Marathi..."
            placeholderTextColor={theme.textLight}
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
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={theme.primaryGradient}
              style={styles.sendGradient}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  scrollView: { flex: 1 },
  container: { padding: 20, paddingBottom: 100 },

  header: { marginTop: 60, marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "bold", color: theme.textPrimary },
  subtitle: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },

  modeCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    ...theme.shadow,
  },
  modeIconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  modeInfo: { flex: 1, gap: 6 },
  modeName: { fontSize: 17, fontWeight: "bold", color: theme.textPrimary },
  modeDesc: { fontSize: 13, color: theme.textSecondary, lineHeight: 18 },
  modeBadge: {
    backgroundColor: theme.successLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  modeBadgeText: { fontSize: 11, color: theme.success, fontWeight: "600" },

  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 60,
    marginBottom: 24,
  },
  topNavTitle: { fontSize: 18, fontWeight: "bold", color: theme.textPrimary },
  topNavCount: { fontSize: 14, color: theme.primary },
  sectionLabel: { fontSize: 15, color: theme.textSecondary, marginBottom: 16 },

  progressBar: {
    height: 6,
    backgroundColor: theme.cardBorder,
    borderRadius: 3,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.primary,
    borderRadius: 3,
  },

  wordCard: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.cardBorder,
    marginBottom: 24,
    gap: 8,
    ...theme.shadow,
  },
  englishWord: { fontSize: 16, color: theme.textSecondary },
  marathiWord: { fontSize: 52, fontWeight: "bold", color: theme.textPrimary },
  romanized: { fontSize: 20, color: theme.primary, fontWeight: "600" },
  listenButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    backgroundColor: theme.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  listenText: { color: theme.primary, fontSize: 14, fontWeight: "600" },

  instructionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    ...theme.shadow,
  },
  instructionText: { color: theme.textSecondary, fontSize: 14, flex: 1 },

  recordButton: { borderRadius: 20, overflow: "hidden", marginBottom: 24 },
  recordGradient: { padding: 24, alignItems: "center", gap: 12 },
  recordText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  processingBox: { alignItems: "center", padding: 32, gap: 16 },
  processingText: { color: theme.textSecondary, fontSize: 16 },

  resultContainer: { gap: 16 },
  scoreCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    gap: 8,
    ...theme.shadow,
  },
  scoreNumber: { fontSize: 48, fontWeight: "bold" },
  scoreLabel: { color: theme.textSecondary, fontSize: 14 },
  infoBox: {
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    gap: 6,
    ...theme.shadow,
  },
  infoLabel: { color: theme.primary, fontSize: 12, fontWeight: "600" },
  infoText: { color: theme.textPrimary, fontSize: 15, lineHeight: 22 },
  pronunciationRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  speakIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.primary,
  },
  encouragement: {
    color: theme.primary,
    fontSize: 15,
    textAlign: "center",
    fontStyle: "italic",
  },
  resultButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  tryAgainButton: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.cardBorder,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    ...theme.shadow,
  },
  tryAgainText: { color: theme.primary, fontSize: 15, fontWeight: "600" },
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
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...theme.shadow,
  },
  scenarioIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  scenarioInfo: { flex: 1 },
  scenarioName: {
    fontSize: 17,
    fontWeight: "bold",
    color: theme.textPrimary,
    marginBottom: 4,
  },
  scenarioHint: { fontSize: 13, color: theme.textSecondary },

  chatContainer: { flex: 1, backgroundColor: theme.background },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 56,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
    gap: 12,
  },
  chatIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  chatTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: theme.textPrimary,
    flex: 1,
  },
  chatSubtitle: { fontSize: 12, color: theme.textSecondary },
  endButton: {
    backgroundColor: theme.errorLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.error,
  },
  endButtonText: { color: theme.error, fontSize: 13, fontWeight: "600" },
  messagesContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.background,
  },

  messageWrapper: { marginBottom: 16 },
  aiBubbleContainer: { gap: 6, maxWidth: "90%" },

  feedbackBubble: { borderRadius: 12, padding: 10, borderWidth: 1 },
  feedbackGood: {
    backgroundColor: theme.successLight,
    borderColor: theme.success,
  },
  feedbackCorrect: { backgroundColor: "#FFF3E0", borderColor: theme.warning },
  feedbackBubbleText: {
    color: theme.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },

  aiBubble: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderBottomLeftRadius: 4,
    ...theme.shadow,
  },
  aiMessageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  aiLabel: {
    fontSize: 11,
    color: theme.primary,
    fontWeight: "700",
    marginBottom: 4,
  },
  marathiResponseText: {
    color: theme.textPrimary,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: "500",
  },

  hintBubble: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: theme.warningLight,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.warning,
  },
  hintBubbleText: { color: "#8B6914", fontSize: 13, flex: 1, lineHeight: 18 },

  userBubble: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    padding: 14,
    alignSelf: "flex-end",
    maxWidth: "85%",
    borderBottomRightRadius: 4,
  },
  userLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
    fontWeight: "600",
  },
  userText: { color: "#FFFFFF", fontSize: 15, lineHeight: 22 },

  voiceInputContainer: {
    padding: 20,
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.cardBorder,
    alignItems: "center",
    gap: 12,
  },
  voiceHint: { color: theme.textSecondary, fontSize: 14 },
  voiceButton: { borderRadius: 40, overflow: "hidden" },
  voiceButtonActive: {
    shadowColor: theme.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  voiceButtonGradient: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  processingHint: { color: theme.primary, fontSize: 13 },

  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.cardBorder,
    gap: 12,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: theme.inputBg,
    borderRadius: 12,
    padding: 14,
    color: theme.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.cardBorder,
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
  aiText: { color: theme.textPrimary },

  // Session Summary
  summaryHeader: {
    paddingTop: 70,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 8,
  },
  summaryHeaderTitle: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF" },
  summaryHeaderSubtitle: { fontSize: 15, color: "rgba(255,255,255,0.85)" },
  summaryContainer: { padding: 20, paddingBottom: 60 },
  summaryStats: {
    flexDirection: "row",
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...theme.shadow,
  },
  summaryStat: { flex: 1, alignItems: "center", gap: 4 },
  summaryStatNumber: { fontSize: 28, fontWeight: "bold", color: theme.primary },
  summaryStatLabel: { fontSize: 12, color: theme.textSecondary },
  summarySection: {
    fontSize: 17,
    fontWeight: "bold",
    color: theme.textPrimary,
    marginBottom: 16,
  },
  summaryMessage: { marginBottom: 12 },
  summaryUserMsg: {
    backgroundColor: theme.primaryLight,
    borderRadius: 12,
    padding: 12,
    alignSelf: "flex-end",
    maxWidth: "85%",
    borderWidth: 1,
    borderColor: theme.primary,
  },
  summaryAiMsg: { gap: 6, maxWidth: "90%" },
  summaryMsgLabel: {
    fontSize: 11,
    color: theme.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryMsgText: { color: theme.textPrimary, fontSize: 14 },
  summaryFeedback: { borderRadius: 10, padding: 10, borderWidth: 1 },
  summaryMarathi: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  summaryHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: theme.warningLight,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.warning,
  },
  summaryDoneButton: { borderRadius: 16, overflow: "hidden", marginTop: 24 },
  summaryDoneGradient: {
    padding: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  summaryDoneText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  translationText: {
    color: theme.textSecondary,
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 6,
    lineHeight: 18,
  },
  translationText: {
    color: theme.textSecondary,
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 6,
    lineHeight: 18,
  },
});
