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

export default function LessonDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [lesson, setLesson] = useState(null);
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.levelBadge}>{lesson?.level}</Text>
        <Text style={styles.title}>{lesson?.title}</Text>
        <Text style={styles.description}>{lesson?.description}</Text>

        {/* Vocabulary Section */}
        <Text style={styles.sectionTitle}>
          Vocabulary ({vocabulary.length} words)
        </Text>

        {vocabulary.map((word) => (
          <View key={word.id} style={styles.wordCard}>
            <Text style={styles.marathiWord}>{word.marathi_word}</Text>
            <Text style={styles.romanized}>{word.romanized}</Text>
            <Text style={styles.englishMeaning}>{word.english_meaning}</Text>
            {word.example_sentence && (
              <View style={styles.exampleBox}>
                <Text style={styles.exampleLabel}>Example:</Text>
                <Text style={styles.exampleText}>{word.example_sentence}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Start Exercise Button */}
        <TouchableOpacity
          style={styles.exerciseButton}
          onPress={() => router.push(`/exercise/${id}`)}
        >
          <LinearGradient
            colors={["#7B2FBE", "#9D4EDD"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.exerciseGradient}
          >
            <Text style={styles.exerciseButtonText}>Start Exercise →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 24 },
  backButton: { marginTop: 60, marginBottom: 16 },
  backText: { color: "#9D4EDD", fontSize: 16 },
  levelBadge: {
    color: "#9D4EDD",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#888",
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  wordCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2D1B69",
  },
  marathiWord: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  romanized: {
    fontSize: 16,
    color: "#9D4EDD",
    marginBottom: 4,
  },
  englishMeaning: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  exampleBox: {
    backgroundColor: "#0D0D1A",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  exampleLabel: {
    fontSize: 11,
    color: "#9D4EDD",
    fontWeight: "600",
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: "#CCC",
  },
  exerciseButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 40,
  },
  exerciseGradient: {
    padding: 18,
    alignItems: "center",
  },
  exerciseButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
