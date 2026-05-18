import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../utils/api";
import { theme } from "../utils/theme";

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
    Speech.speak(word, { language: "mr-IN", pitch: 1.0, rate: 0.8 });
  };

  const handleNext = () => {
    if (currentIndex + 1 >= vocabulary.length) {
      router.push(`/exercise/${id}`);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.screen,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  const currentWord = vocabulary[currentIndex];
  const progress =
    vocabulary.length > 0 ? ((currentIndex + 1) / vocabulary.length) * 100 : 0;

  // Intro Screen
  if (showIntro) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
        <LinearGradient
          colors={theme.primaryGradient}
          style={styles.introBanner}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.introLevel}>{lesson?.level}</Text>
          <Text style={styles.introTitle}>{lesson?.title}</Text>
          <Text style={styles.introDesc}>{lesson?.description}</Text>
        </LinearGradient>

        <View style={styles.introContent}>
          <View style={styles.introStatsRow}>
            <View style={styles.introStat}>
              <View style={styles.introStatIcon}>
                <Ionicons name="book-outline" size={22} color={theme.primary} />
              </View>
              <Text style={styles.introStatNumber}>{vocabulary.length}</Text>
              <Text style={styles.introStatLabel}>Words</Text>
            </View>
            <View style={styles.introStatDivider} />
            <View style={styles.introStat}>
              <View style={styles.introStatIcon}>
                <Ionicons
                  name="volume-high-outline"
                  size={22}
                  color={theme.primary}
                />
              </View>
              <Text style={styles.introStatNumber}>✓</Text>
              <Text style={styles.introStatLabel}>Audio</Text>
            </View>
            <View style={styles.introStatDivider} />
            <View style={styles.introStat}>
              <View style={styles.introStatIcon}>
                <Ionicons
                  name="pencil-outline"
                  size={22}
                  color={theme.primary}
                />
              </View>
              <Text style={styles.introStatNumber}>Quiz</Text>
              <Text style={styles.introStatLabel}>After</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setShowIntro(false)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={theme.primaryGradient}
              style={styles.startGradient}
            >
              <Text style={styles.startText}>Start Learning</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Word Card Screen
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowIntro(true)}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lesson?.title}</Text>
        <Text style={styles.headerCount}>
          {currentIndex + 1}/{vocabulary.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Word Card */}
      <View style={styles.cardContainer}>
        <View style={styles.wordCard}>
          {/* Listen Button */}
          <TouchableOpacity
            style={styles.speakButton}
            onPress={() => speakWord(currentWord?.marathi_word)}
          >
            <Ionicons name="volume-high" size={26} color={theme.primary} />
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
              <Text style={styles.exampleLabel}>Example</Text>
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
            color={currentIndex === 0 ? theme.textLight : theme.primary}
          />
          <Text
            style={[styles.prevText, currentIndex === 0 && styles.disabledText]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={theme.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextGradient}
          >
            <Text style={styles.nextText}>
              {currentIndex + 1 >= vocabulary.length ? "Start Quiz" : "Next"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },

  // Intro
  introBanner: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  backButton: { marginBottom: 20 },
  introLevel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  introDesc: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
  },
  introContent: { flex: 1, padding: 24 },
  introStatsRow: {
    flexDirection: "row",
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    ...theme.shadow,
  },
  introStat: { flex: 1, alignItems: "center", gap: 8 },
  introStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  introStatNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.textPrimary,
  },
  introStatLabel: { fontSize: 12, color: theme.textSecondary },
  introStatDivider: {
    width: 1,
    backgroundColor: theme.cardBorder,
    marginVertical: 8,
  },
  startButton: { borderRadius: 16, overflow: "hidden" },
  startGradient: {
    padding: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  startText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  // Word Card
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: theme.background,
  },
  headerTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 12,
  },
  headerCount: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: theme.cardBorder,
    marginHorizontal: 20,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.primary,
    borderRadius: 3,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  wordCard: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.cardBorder,
    ...theme.shadow,
  },
  speakButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  marathiWord: {
    fontSize: 48,
    fontWeight: "bold",
    color: theme.textPrimary,
    textAlign: "center",
    marginBottom: 16,
  },
  divider: {
    width: "40%",
    height: 2,
    backgroundColor: theme.primaryLight,
    borderRadius: 1,
    marginBottom: 16,
  },
  romanized: {
    fontSize: 22,
    color: theme.primary,
    marginBottom: 6,
    fontWeight: "600",
  },
  englishMeaning: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  exampleBox: {
    backgroundColor: theme.primaryLight,
    borderRadius: 12,
    padding: 14,
    width: "100%",
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
  },
  exampleLabel: {
    fontSize: 11,
    color: theme.primary,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  exampleText: {
    fontSize: 14,
    color: theme.textPrimary,
    lineHeight: 20,
  },
  navButtons: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingBottom: 40,
  },
  prevButton: {
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
  },
  disabledButton: { opacity: 0.4 },
  prevText: { color: theme.primary, fontSize: 15, fontWeight: "600" },
  disabledText: { color: theme.textLight },
  nextButton: { flex: 2, borderRadius: 14, overflow: "hidden" },
  nextGradient: {
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  nextText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});
