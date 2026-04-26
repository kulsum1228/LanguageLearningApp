import { Ionicons } from "@expo/vector-icons";
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

const lessonIcons = [
  "hand-left-outline",
  "calculator-outline",
  "color-palette-outline",
  "sunny-outline",
  "restaurant-outline",
  "people-outline",
  "body-outline",
  "paw-outline",
];

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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>All Lessons</Text>
          <Text style={styles.subtitle}>
            {lessons.length} lessons available
          </Text>
        </View>

        {lessons.map((lesson, index) => (
          <TouchableOpacity
            key={lesson.id}
            style={styles.lessonCard}
            onPress={() => router.push(`/lesson/${lesson.id}`)}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name={lessonIcons[index % lessonIcons.length]}
                size={24}
                color="#9D4EDD"
              />
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
              <Text style={styles.lessonDesc} numberOfLines={1}>
                {lesson.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9D4EDD" />
          </TouchableOpacity>
        ))}
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
  lessonCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2D1B69",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#2D1B69",
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 2,
  },
  lessonDesc: {
    fontSize: 12,
    color: "#888",
  },
});
