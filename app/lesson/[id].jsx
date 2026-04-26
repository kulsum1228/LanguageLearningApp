import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../utils/api";

export default function LessonDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [lesson, setLesson] = useState(null);
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const response = await API.get(`/lessons/${id}`);
      setLesson(response.data.lesson);
      setVocabulary(response.data.vocabulary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const speakWord = (word) => {
    Speech.speak(word, {
      language: "mr-IN",
      pitch: 1.0,
      rate: 0.8,
    });
  };

  const handleNext = () => {
    if (currentIndex + 1 >= vocabulary.length) {
      router.push(`/exercise/${id}`);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
        style={styles.gradient}
      >
        <ActivityIndicator
          color="#9D4EDD"
          size="large"
          style={{ marginTop: 100 }}
        />
      </LinearGradient>
    );
  }

  const currentWord = vocabulary[currentIndex];
  const progress =
    vocabulary.length > 0 ? ((currentIndex + 1) / vocabulary.length) * 100 : 0;

  // Intro Screen
  if (showIntro) {
    return (
      <LinearGradient
        colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
        style={styles.gradient}
      >
        <View style={styles.introContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#9D4EDD" />
          </TouchableOpacity>

          <View style={styles.introContent}>
            <Text style={styles.levelBadge}>{lesson?.level}</Text>
            <Text style={styles.introTitle}>{lesson?.title}</Text>
            <Text style={styles.introDesc}>{lesson?.description}</Text>

            <View style={styles.introStats}>
              <View style={styles.introStat}>
                <Ionicons name="book-outline" size={24} color="#9D4EDD" />
                <Text style={styles.introStatText}>
                  {vocabulary.length} words
                </Text>
              </View>
              <View style={styles.introStat}>
                <Ionicons
                  name="volume-high-outline"
                  size={24}
                  color="#9D4EDD"
                />
                <Text style={styles.introStatText}>Audio included</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setShowIntro(false)}
            >
              <LinearGradient
                colors={["#7B2FBE", "#9D4EDD"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startGradient}
              >
                <Text style={styles.startText}>Start Learning →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Word Card Screen
  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
      style={styles.gradient}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowIntro(true)}>
            <Ionicons name="arrow-back" size={24} color="#9D4EDD" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{lesson?.title}</Text>
          <Text style={styles.headerCount}>
            {currentIndex + 1}/{vocabulary.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* Word Card */}
        <View style={styles.cardContainer}>
          <View style={styles.wordCard}>
            {/* Speak Button */}
            <TouchableOpacity
              style={styles.speakButton}
              onPress={() => speakWord(currentWord?.marathi_word)}
            >
              <Ionicons name="volume-high" size={28} color="#9D4EDD" />
            </TouchableOpacity>

            {/* Marathi Word */}
            <Text style={styles.marathiWord}>{currentWord?.marathi_word}</Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Romanized */}
            <Text style={styles.romanized}>{currentWord?.romanized}</Text>

            {/* English */}
            <Text style={styles.englishMeaning}>
              {currentWord?.english_meaning}
            </Text>

            {/* Example */}
            {currentWord?.example_sentence && (
              <View style={styles.exampleBox}>
                <Text style={styles.exampleLabel}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={12}
                    color="#9D4EDD"
                  />{" "}
                  Example
                </Text>
                <Text style={styles.exampleText}>
                  {currentWord?.example_sentence}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[
              styles.prevButton,
              currentIndex === 0 && styles.disabledButton,
            ]}
            onPress={handlePrev}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={currentIndex === 0 ? "#444" : "#9D4EDD"}
            />
            <Text
              style={[
                styles.prevText,
                currentIndex === 0 && styles.disabledText,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={["#7B2FBE", "#9D4EDD"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextGradient}
            >
              <Text style={styles.nextText}>
                {currentIndex + 1 >= vocabulary.length
                  ? "Start Exercise 🎯"
                  : "Next →"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  introContainer: { flex: 1, padding: 24 },
  backButton: { marginTop: 60, marginBottom: 32 },
  introContent: { flex: 1, justifyContent: "center" },
  levelBadge: {
    color: "#9D4EDD",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  introDesc: {
    fontSize: 16,
    color: "#888",
    marginBottom: 32,
    lineHeight: 24,
  },
  introStats: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 40,
  },
  introStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  introStatText: {
    color: "#CCC",
    fontSize: 15,
  },
  startButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  startGradient: {
    padding: 18,
    alignItems: "center",
  },
  startText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  container: { flex: 1, padding: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 60,
    marginBottom: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 12,
  },
  headerCount: {
    color: "#9D4EDD",
    fontSize: 14,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#2D1B69",
    borderRadius: 3,
    marginBottom: 32,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#9D4EDD",
    borderRadius: 3,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
  },
  wordCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: "#2D1B69",
    alignItems: "center",
    shadowColor: "#9D4EDD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  speakButton: {
    backgroundColor: "#2D1B69",
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#9D4EDD",
  },
  marathiWord: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  divider: {
    width: "40%",
    height: 1,
    backgroundColor: "#2D1B69",
    marginBottom: 16,
  },
  romanized: {
    fontSize: 22,
    color: "#9D4EDD",
    marginBottom: 8,
    fontWeight: "500",
  },
  englishMeaning: {
    fontSize: 18,
    color: "#888",
    marginBottom: 24,
  },
  exampleBox: {
    backgroundColor: "#0D0D1A",
    borderRadius: 12,
    padding: 14,
    width: "100%",
  },
  exampleLabel: {
    fontSize: 12,
    color: "#9D4EDD",
    fontWeight: "600",
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 15,
    color: "#CCC",
    lineHeight: 22,
  },
  navButtons: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 40,
  },
  prevButton: {
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
  disabledButton: { opacity: 0.3 },
  prevText: { color: "#9D4EDD", fontSize: 16, fontWeight: "600" },
  disabledText: { color: "#444" },
  nextButton: { flex: 2, borderRadius: 14, overflow: "hidden" },
  nextGradient: { padding: 16, alignItems: "center" },
  nextText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
