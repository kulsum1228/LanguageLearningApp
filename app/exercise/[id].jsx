import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../utils/api";
import { getUser } from "../utils/storage";
import { theme } from "../utils/theme";

export default function ExerciseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [user, setUser] = useState(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [hints, setHints] = useState([]);
  const [difficulty, setDifficulty] = useState("beginner");

  useEffect(() => {
    fetchExercises();
  }, [id]);

  const fetchExercises = async () => {
    try {
      // Get previous score for adaptive difficulty
      const savedUser = await getUser();
      setUser(savedUser);

      // Get previous score from progress
      let previousScore = 0;
      try {
        const progressRes = await API.get(
          `/gamification/stats/${savedUser?.id}`,
        );
        previousScore =
          progressRes.data.xp_points > 200
            ? 80
            : progressRes.data.xp_points > 100
              ? 50
              : 0;
      } catch (e) {
        console.log("No previous score");
      }

      // Generate AI exercises
      const response = await API.get(
        `/exercises/generate/${id}?score=${previousScore}`,
      );
      setExercises(response.data.exercises);
      setDifficulty(response.data.difficulty);
    } catch (err) {
      console.error("Exercise fetch error:", err);
      // Fallback to static exercises if AI fails
      try {
        const fallback = await API.get(`/lessons/${id}/exercises`);
        setExercises(fallback.data);
      } catch (e) {
        console.error("Fallback also failed:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (exercises.length > 0 && exercises[currentIndex]?.type === "FILL") {
      setHints(
        generateHints(exercises[currentIndex].correct_answer, exercises),
      );
    }
  }, [currentIndex, exercises]);

  const generateHints = (correctAnswer, allExercises) => {
    const otherAnswers = allExercises
      .filter((ex) => ex.correct_answer !== correctAnswer)
      .map((ex) => ex.correct_answer)
      .slice(0, 3);
    return [correctAnswer, ...otherAnswers].sort(() => Math.random() - 0.5);
  };

  const currentExercise = exercises[currentIndex];
  const progress =
    exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;

  const handleMCQAnswer = (option) => {
    if (answered) return;
    setSelectedAnswer(option);
    setAnswered(true);
    if (option === currentExercise.correct_answer) setScore(score + 1);
  };

  const handleNext = async () => {
    if (currentIndex + 1 >= exercises.length) {
      try {
        const response = await API.post("/gamification/award-xp", {
          user_id: user?.id,
          lesson_id: id,
          score: score,
          total: exercises.length,
        });
        setXpEarned(response.data.xp_earned);
      } catch (err) {
        console.error(err);
      }
      setFinished(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setFillAnswer("");
      setAnswered(false);
    }
  };

  const getOptionStyle = (option) => {
    if (!answered) return styles.optionButton;
    if (option === currentExercise.correct_answer)
      return [styles.optionButton, styles.correctOption];
    if (option === selectedAnswer)
      return [styles.optionButton, styles.wrongOption];
    return [styles.optionButton, styles.disabledOption];
  };

  const getOptionTextStyle = (option) => {
    if (!answered) return styles.optionText;
    if (option === currentExercise.correct_answer)
      return [styles.optionText, { color: theme.success }];
    if (option === selectedAnswer)
      return [styles.optionText, { color: theme.error }];
    return [styles.optionText, { color: theme.textLight }];
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

  // Results Screen
  if (finished) {
    const percentage = Math.round((score / exercises.length) * 100);
    const isGood = percentage >= 80;
    const isOk = percentage >= 50;

    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
        <LinearGradient
          colors={theme.primaryGradient}
          style={styles.resultBanner}
        >
          <Ionicons
            name={isGood ? "trophy" : isOk ? "thumbs-up" : "barbell-outline"}
            size={64}
            color="#FFFFFF"
          />
          <Text style={styles.resultTitle}>
            {isGood ? "Excellent!" : isOk ? "Good Job!" : "Keep Practicing!"}
          </Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreNumber}>
              {score}/{exercises.length}
            </Text>
            <Text style={styles.scorePercent}>{percentage}% correct</Text>
          </View>

          {xpEarned > 0 && (
            <View style={styles.xpBanner}>
              <Ionicons name="star" size={20} color={theme.primary} />
              <Text style={styles.xpText}>+{xpEarned} XP earned!</Text>
            </View>
          )}

          <View style={styles.resultButtons}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setCurrentIndex(0);
                setScore(0);
                setFinished(false);
                setAnswered(false);
                setSelectedAnswer(null);
                setXpEarned(0);
              }}
            >
              <Ionicons name="refresh" size={18} color={theme.primary} />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.primaryGradient}
                style={styles.doneGradient}
              >
                <Text style={styles.doneText}>Back to Lesson</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1}/{exercises.length}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Score */}
        <View style={styles.scoreRow}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>
              {difficulty === "beginner"
                ? "🌱 Beginner"
                : difficulty === "intermediate"
                  ? "📚 Intermediate"
                  : "🏆 Advanced"}
            </Text>
          </View>
          <Ionicons name="star" size={16} color={theme.primary} />
          <Text style={styles.scoreText}>{score} points</Text>
        </View>

        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionType}>
            {currentExercise?.type === "MCQ"
              ? "🎯 Choose the correct answer"
              : "✏️ Fill in the blank"}
          </Text>
          <Text style={styles.questionText}>{currentExercise?.question}</Text>
        </View>

        {/* MCQ Options */}
        {currentExercise?.type === "MCQ" && (
          <View style={styles.optionsContainer}>
            {currentExercise.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getOptionStyle(option)}
                onPress={() => handleMCQAnswer(option)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLetterBox}>
                  <Text style={styles.optionLetter}>
                    {["A", "B", "C", "D"][index]}
                  </Text>
                </View>
                <Text style={getOptionTextStyle(option)}>{option}</Text>
                {answered && option === currentExercise.correct_answer && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.success}
                  />
                )}
                {answered &&
                  option === selectedAnswer &&
                  option !== currentExercise.correct_answer && (
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={theme.error}
                    />
                  )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Fill in the blank */}
        {currentExercise?.type === "FILL" && (
          <View style={styles.fillContainer}>
            {!answered ? (
              <>
                <View style={styles.fillOptions}>
                  {hints.map((hint, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.hintButton,
                        fillAnswer === hint && styles.selectedHint,
                      ]}
                      onPress={() => setFillAnswer(hint)}
                    >
                      <Text
                        style={[
                          styles.hintText,
                          fillAnswer === hint && styles.selectedHintText,
                        ]}
                      >
                        {hint}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    !fillAnswer && styles.checkButtonDisabled,
                  ]}
                  onPress={() => {
                    if (!fillAnswer) return;
                    setAnswered(true);
                    if (fillAnswer === currentExercise.correct_answer)
                      setScore(score + 1);
                  }}
                  disabled={!fillAnswer}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      fillAnswer ? theme.primaryGradient : ["#CCC", "#BBB"]
                    }
                    style={styles.checkGradient}
                  >
                    <Text style={styles.checkButtonText}>Check Answer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <View
                style={[
                  styles.fillResult,
                  fillAnswer === currentExercise.correct_answer
                    ? styles.correctFill
                    : styles.wrongFill,
                ]}
              >
                <Ionicons
                  name={
                    fillAnswer === currentExercise.correct_answer
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={24}
                  color={
                    fillAnswer === currentExercise.correct_answer
                      ? theme.success
                      : theme.error
                  }
                />
                <Text style={styles.fillResultText}>
                  {fillAnswer === currentExercise.correct_answer
                    ? "Correct!"
                    : `Answer: ${currentExercise.correct_answer}`}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Feedback & Next */}
        {answered && (
          <View style={styles.feedbackContainer}>
            <View
              style={[
                styles.feedbackBox,
                selectedAnswer === currentExercise?.correct_answer ||
                fillAnswer === currentExercise?.correct_answer
                  ? styles.correctFeedback
                  : styles.wrongFeedback,
              ]}
            >
              <Ionicons
                name={
                  selectedAnswer === currentExercise?.correct_answer ||
                  fillAnswer === currentExercise?.correct_answer
                    ? "checkmark-circle"
                    : "bulb-outline"
                }
                size={20}
                color={
                  selectedAnswer === currentExercise?.correct_answer ||
                  fillAnswer === currentExercise?.correct_answer
                    ? theme.success
                    : theme.primary
                }
              />
              <Text style={styles.feedbackText}>
                {selectedAnswer === currentExercise?.correct_answer ||
                fillAnswer === currentExercise?.correct_answer
                  ? "Great job! Keep it up!"
                  : `Correct answer: ${currentExercise?.correct_answer}`}
              </Text>
            </View>

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
                  {currentIndex + 1 >= exercises.length ? "Finish" : "Next"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  scrollView: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: theme.background,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.cardBorder,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
  progressText: { color: theme.textSecondary, fontSize: 13, fontWeight: "600" },

  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
    alignSelf: "flex-end",
  },
  scoreText: { color: theme.primary, fontSize: 14, fontWeight: "bold" },

  questionCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    ...theme.shadow,
  },
  questionType: {
    color: theme.textSecondary,
    fontSize: 13,
    marginBottom: 12,
  },
  questionText: {
    color: theme.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 30,
  },

  optionsContainer: { gap: 10, marginBottom: 20 },
  optionButton: {
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: theme.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...theme.shadow,
  },
  correctOption: {
    backgroundColor: theme.successLight,
    borderColor: theme.success,
  },
  wrongOption: {
    backgroundColor: theme.errorLight,
    borderColor: theme.error,
  },
  disabledOption: { opacity: 0.5 },
  optionLetterBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  optionLetter: {
    color: theme.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  optionText: { color: theme.textPrimary, fontSize: 16, flex: 1 },

  fillContainer: { marginBottom: 20 },
  fillOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  hintButton: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: theme.cardBorder,
    ...theme.shadow,
  },
  selectedHint: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryLight,
  },
  hintText: { color: theme.textPrimary, fontSize: 18 },
  selectedHintText: { color: theme.primary, fontWeight: "600" },
  checkButton: { borderRadius: 14, overflow: "hidden" },
  checkButtonDisabled: { opacity: 0.6 },
  checkGradient: { padding: 16, alignItems: "center" },
  checkButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  fillResult: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  correctFill: {
    backgroundColor: theme.successLight,
    borderColor: theme.success,
  },
  wrongFill: {
    backgroundColor: theme.errorLight,
    borderColor: theme.error,
  },
  fillResultText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },

  feedbackContainer: { gap: 12, marginBottom: 20 },
  feedbackBox: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  correctFeedback: {
    backgroundColor: theme.successLight,
    borderColor: theme.success,
  },
  wrongFeedback: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  feedbackText: { color: theme.textPrimary, fontSize: 15, flex: 1 },
  nextButton: { borderRadius: 14, overflow: "hidden" },
  nextGradient: {
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  nextText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Results
  resultBanner: {
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: "center",
    gap: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  resultContent: { padding: 20 },
  scoreCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    ...theme.shadow,
  },
  scoreNumber: {
    fontSize: 52,
    fontWeight: "bold",
    color: theme.primary,
    marginBottom: 4,
  },
  scorePercent: { fontSize: 18, color: theme.textSecondary },
  xpBanner: {
    backgroundColor: theme.primaryLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  xpText: { color: theme.primary, fontSize: 17, fontWeight: "bold" },
  resultButtons: { flexDirection: "row", gap: 12 },
  retryButton: {
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
  retryText: { color: theme.primary, fontSize: 15, fontWeight: "600" },
  doneButton: { flex: 2, borderRadius: 14, overflow: "hidden" },
  doneGradient: {
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  doneText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  difficultyBadge: {
    backgroundColor: theme.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  difficultyText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: "600",
  },
});
