import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

export default function LessonsScreen() {
  const router = useRouter();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await API.get("/lessons");
      setLessons(response.data);
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const levelColors = {
    Beginner: "#4CAF50",
    Intermediate: "#FF9800",
    Advanced: "#F44336",
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
        <View style={styles.header}>
          <Text style={styles.title}>All Lessons</Text>
          <Text style={styles.subtitle}>
            {lessons.length} lessons available
          </Text>
        </View>

        {lessons.map((lesson) => (
          <TouchableOpacity
            key={lesson.id}
            style={styles.lessonCard}
            onPress={() => router.push(`/lesson/${lesson.id}`)}
          >
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{lesson.order_number}</Text>
            </View>
            <View style={styles.lessonInfo}>
              <Text
                style={[
                  styles.levelBadge,
                  { color: levelColors[lesson.level] || "#9D4EDD" },
                ]}
              >
                {lesson.level}
              </Text>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonDesc} numberOfLines={2}>
                {lesson.description}
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 24 },
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
  lessonCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2D1B69",
    flexDirection: "row",
    alignItems: "center",
  },
  numberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2D1B69",
    borderWidth: 1,
    borderColor: "#9D4EDD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  numberText: {
    color: "#9D4EDD",
    fontWeight: "bold",
    fontSize: 16,
  },
  lessonInfo: { flex: 1 },
  levelBadge: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  lessonDesc: {
    fontSize: 13,
    color: "#888",
  },
  arrow: {
    fontSize: 20,
    color: "#9D4EDD",
    marginLeft: 12,
  },
});
