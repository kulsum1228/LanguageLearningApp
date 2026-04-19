import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../utils/api";
import { getUser } from "../utils/storage";

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

  useEffect(() => {
    fetchExercises();
  }, [id]);

  const fetchExercises = async () => {
    try {
      const response = await API.get(`/lessons/${id}/exercises`);
      setExercises(response.data);
      const savedUser = await getUser();
      setUser(savedUser);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate hints dynamically whenever current exercise changes
  useEffect(() => {
    if (exercises.length > 0 && exercises[currentIndex]?.type === "FILL") {
      setHints(
        generateHints(exercises[currentIndex].correct_answer, exercises),
      );
    }
  }, [currentIndex, exercises]);

  const generateHints = (correctAnswer, allExercises) => {
    // Get wrong options from other exercises
    const otherAnswers = allExercises
      .filter((ex) => ex.correct_answer !== correctAnswer)
      .map((ex) => ex.correct_answer)
      .slice(0, 3);

    // Combine correct answer with wrong ones and shuffle
    const hints = [correctAnswer, ...otherAnswers];
    return hints.sort(() => Math.random() - 0.5);
  };

  const currentExercise = exercises[currentIndex];
  const progress =
    exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;

  const handleMCQAnswer = (option) => {
    if (answered) return;
    setSelectedAnswer(option);
    setAnswered(true);
    if (option === currentExercise.correct_answer) {
      setScore(score + 1);
    }
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
      return [styles.optionText, styles.correctText];
    if (option === selectedAnswer) return [styles.optionText, styles.wrongText];
    return [styles.optionText, styles.disabledText];
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

  // Results Screen
  if (finished) {
    const percentage = Math.round((score / exercises.length) * 100);
    return (
      <LinearGradient
        colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
        style={styles.gradient}
      >
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>
            {percentage >= 80 ? "🏆" : percentage >= 50 ? "👍" : "💪"}
          </Text>
          <Text style={styles.resultTitle}>
            {percentage >= 80
              ? "Excellent!"
              : percentage >= 50
                ? "Good Job!"
                : "Keep Practicing!"}
          </Text>
          <Text style={styles.resultScore}>
            {score}/{exercises.length}
          </Text>
          <Text style={styles.resultPercent}>{percentage}% correct</Text>

          {xpEarned > 0 && (
            <View style={styles.xpBanner}>
              <Text style={styles.xpText}>+{xpEarned} XP earned! ⭐</Text>
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
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <LinearGradient
                colors={["#7B2FBE", "#9D4EDD"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.backGradient}
              >
                <Text style={styles.backButtonText}>Back to Lesson</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{exercises.length}
          </Text>
        </View>

        {/* Score */}
        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>⭐ {score} points</Text>
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
              >
                <Text style={styles.optionLetter}>
                  {["A", "B", "C", "D"][index]}
                </Text>
                <Text style={getOptionTextStyle(option)}>{option}</Text>
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
                      <Text style={styles.hintText}>{hint}</Text>
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
                    if (fillAnswer === currentExercise.correct_answer) {
                      setScore(score + 1);
                    }
                  }}
                  disabled={!fillAnswer}
                >
                  <Text style={styles.checkButtonText}>Check Answer</Text>
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
                <Text style={styles.fillResultText}>
                  {fillAnswer === currentExercise.correct_answer
                    ? "✅ Correct!"
                    : `❌ Wrong! Answer: ${currentExercise.correct_answer}`}
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
              <Text style={styles.feedbackText}>
                {selectedAnswer === currentExercise?.correct_answer ||
                fillAnswer === currentExercise?.correct_answer
                  ? "🎉 Correct! Great job!"
                  : `💡 Correct answer: ${currentExercise?.correct_answer}`}
              </Text>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <LinearGradient
                colors={["#7B2FBE", "#9D4EDD"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextGradient}
              >
                <Text style={styles.nextText}>
                  {currentIndex + 1 >= exercises.length
                    ? "Finish 🏁"
                    : "Next →"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 24 },
  closeButton: { marginTop: 60, marginBottom: 16, alignSelf: "flex-start" },
  closeText: { color: "#888", fontSize: 20 },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#2D1B69",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#9D4EDD",
    borderRadius: 4,
  },
  progressText: { color: "#888", fontSize: 13 },
  scoreRow: { alignItems: "flex-end", marginBottom: 24 },
  scoreText: { color: "#9D4EDD", fontSize: 16, fontWeight: "bold" },
  questionCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2D1B69",
  },
  questionType: { color: "#9D4EDD", fontSize: 13, marginBottom: 12 },
  questionText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 30,
  },
  optionsContainer: { gap: 12, marginBottom: 24 },
  optionButton: {
    backgroundColor: "#1A1A2E",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2D1B69",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  correctOption: {
    backgroundColor: "#1A3A1A",
    borderColor: "#4CAF50",
  },
  wrongOption: {
    backgroundColor: "#3A1A1A",
    borderColor: "#F44336",
  },
  disabledOption: { opacity: 0.5 },
  optionLetter: {
    color: "#9D4EDD",
    fontWeight: "bold",
    fontSize: 16,
    width: 24,
  },
  optionText: { color: "#FFFFFF", fontSize: 16, flex: 1 },
  correctText: { color: "#4CAF50" },
  wrongText: { color: "#F44336" },
  disabledText: { color: "#666" },
  fillContainer: { marginBottom: 24 },
  fillOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  hintButton: {
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2D1B69",
  },
  selectedHint: {
    borderColor: "#9D4EDD",
    backgroundColor: "#2D1B69",
  },
  hintText: { color: "#FFFFFF", fontSize: 18 },
  checkButton: {
    backgroundColor: "#9D4EDD",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  checkButtonDisabled: { opacity: 0.5 },
  checkButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  fillResult: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  correctFill: {
    backgroundColor: "#1A3A1A",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  wrongFill: {
    backgroundColor: "#3A1A1A",
    borderWidth: 1,
    borderColor: "#F44336",
  },
  fillResultText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  feedbackContainer: { marginBottom: 40 },
  feedbackBox: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  correctFeedback: { backgroundColor: "#1A3A1A", borderColor: "#4CAF50" },
  wrongFeedback: { backgroundColor: "#3A1A1A", borderColor: "#F44336" },
  feedbackText: { color: "#FFFFFF", fontSize: 15, textAlign: "center" },
  nextButton: { borderRadius: 14, overflow: "hidden" },
  nextGradient: { padding: 18, alignItems: "center" },
  nextText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  resultEmoji: { fontSize: 80, marginBottom: 16 },
  resultTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  resultScore: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#9D4EDD",
    marginBottom: 8,
  },
  resultPercent: { fontSize: 18, color: "#888", marginBottom: 16 },
  xpBanner: {
    backgroundColor: "#2D1B69",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#9D4EDD",
  },
  xpText: {
    color: "#9D4EDD",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  resultButtons: { width: "100%", gap: 12 },
  retryButton: {
    backgroundColor: "#1A1A2E",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D1B69",
  },
  retryText: { color: "#9D4EDD", fontSize: 16, fontWeight: "bold" },
  backButton: { borderRadius: 14, overflow: "hidden" },
  backGradient: { padding: 16, alignItems: "center" },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
