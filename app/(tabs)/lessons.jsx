import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../utils/api";
import { theme } from "../utils/theme";

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

  // const fetchLessons = async () => {
  //   try {
  //     const response = await API.get("/lessons");
  //     setLessons(response.data);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchLessons = async () => {
    try {
      const response = await API.get("/lessons");
      setLessons(response.data);
    } catch (err) {
      Alert.alert("API Error", err.message + "\n\nURL: " + err.config?.url);
    } finally {
      setLoading(false);
    }
  };

  const levelColors = {
    Beginner: theme.success,
    Intermediate: theme.warning,
    Advanced: theme.error,
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

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
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
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name={lessonIcons[index % lessonIcons.length]}
                size={24}
                color={theme.primary}
              />
            </View>
            <View style={styles.lessonInfo}>
              <Text
                style={[
                  styles.levelBadge,
                  { color: levelColors[lesson.level] || theme.primary },
                ]}
              >
                {lesson.level}
              </Text>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonDesc} numberOfLines={1}>
                {lesson.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.primary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  scrollView: { flex: 1 },
  container: { padding: 20, paddingBottom: 100 },
  header: { marginTop: 60, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "bold", color: theme.textPrimary },
  subtitle: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
  lessonCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...theme.shadow,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonInfo: { flex: 1 },
  levelBadge: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.textPrimary,
    marginBottom: 2,
  },
  lessonDesc: { fontSize: 12, color: theme.textSecondary },
});
