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
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
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

export default function SpeakingScreen() {
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
    if (!status.granted) {
      Alert.alert(
        "Microphone Permission",
        "Please allow microphone access to use speaking practice.",
      );
    }
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
      console.error("Failed to start recording:", err);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (!uri) {
        Alert.alert("Error", "No recording found. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Convert to base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      // Transcribe audio
      const transcribeRes = await API.post("/ai/transcribe", {
        audio_base64: base64Audio,
        filename: "recording.m4a",
      });

      const transcribedText = transcribeRes.data.text;

      // Evaluate pronunciation
      const evalRes = await API.post("/ai/evaluate-pronunciation", {
        transcribed_text: transcribedText,
        expected_text: currentWord.marathi,
        language: "marathi",
      });

      setResult({
        transcribed: transcribedText,
        ...evalRes.data,
      });
    } catch (err) {
      console.error("Processing error:", err);
      Alert.alert(
        "Error",
        "Could not process your recording. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    setResult(null);
    setCurrentIndex((currentIndex + 1) % PRACTICE_WORDS.length);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#4CAF50";
    if (score >= 50) return "#FF9800";
    return "#F44336";
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return "checkmark-circle";
    if (score >= 50) return "alert-circle";
    return "close-circle";
  };

  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
      style={styles.gradient}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Speaking Practice</Text>
          <Text style={styles.subtitle}>Pronounce the word correctly</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {PRACTICE_WORDS.length}
          </Text>
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
        </View>

        {/* Word Card */}
        <View style={styles.wordCard}>
          <Text style={styles.englishWord}>{currentWord.english}</Text>
          <Text style={styles.marathiWord}>{currentWord.marathi}</Text>
          <Text style={styles.romanized}>{currentWord.romanized}</Text>
        </View>

        {/* Instructions */}
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
                : "Tap the microphone and pronounce the word"}
            </Text>
          </View>
        )}

        {/* Record Button */}
        {!isProcessing && !result && (
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingActive]}
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

        {/* Processing */}
        {isProcessing && (
          <View style={styles.processingBox}>
            <ActivityIndicator color="#9D4EDD" size="large" />
            <Text style={styles.processingText}>
              Analyzing your pronunciation...
            </Text>
          </View>
        )}

        {/* Result */}
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
                  style={styles.listenButton}
                  onPress={() =>
                    Speech.speak(currentWord.marathi, {
                      language: "mr-IN",
                      pitch: 1.0,
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

              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
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

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollView: { flex: 1 },
  container: { padding: 24, paddingBottom: 100 },
  header: { marginTop: 60, marginBottom: 24 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  progressText: { color: "#888", fontSize: 13, width: 50 },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#2D1B69",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#9D4EDD",
    borderRadius: 3,
  },
  wordCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D1B69",
    marginBottom: 24,
    shadowColor: "#9D4EDD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  englishWord: {
    fontSize: 18,
    color: "#888",
    marginBottom: 12,
  },
  marathiWord: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  romanized: {
    fontSize: 20,
    color: "#9D4EDD",
    fontWeight: "500",
  },
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
  instructionText: {
    color: "#CCC",
    fontSize: 14,
    flex: 1,
  },
  recordButton: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
  },
  recordingActive: {
    shadowColor: "#F44336",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  recordGradient: {
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  recordText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  processingBox: {
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  processingText: {
    color: "#888",
    fontSize: 16,
  },
  resultContainer: { gap: 16 },
  scoreCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    gap: 8,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "bold",
  },
  scoreLabel: {
    color: "#888",
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: "#1A1A2E",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2D1B69",
    gap: 6,
  },
  infoLabel: {
    color: "#9D4EDD",
    fontSize: 12,
    fontWeight: "600",
  },
  infoText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
  },
  encouragement: {
    color: "#9D4EDD",
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  resultButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
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
  tryAgainText: {
    color: "#9D4EDD",
    fontSize: 15,
    fontWeight: "600",
  },
  nextButton: { flex: 2, borderRadius: 14, overflow: "hidden" },
  nextGradient: {
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  nextText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  pronunciationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listenButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2D1B69",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9D4EDD",
  },
});
