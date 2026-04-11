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

export default function HomeScreen() {
  const router = useRouter();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await API.get("/lessons");
      setLessons(response.data.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>नमस्कार! 👋</Text>
          <Text style={styles.subGreeting}>Ready to learn today?</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>XP Points ⭐</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Lessons Done ✅</Text>
          </View>
        </View>

        {/* Continue Learning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Learning</Text>
          {loading ? (
            <ActivityIndicator color="#9D4EDD" size="large" />
          ) : (
            lessons.map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
              >
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonLevel}>{lesson.level}</Text>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDesc} numberOfLines={1}>
                    {lesson.description}
                  </Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* View All Button */}
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/(tabs)/lessons")}
        >
          <Text style={styles.viewAllText}>View All Lessons →</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 24 },
  header: { marginTop: 60, marginBottom: 24 },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subGreeting: {
    fontSize: 16,
    color: "#888",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#2D1B69",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9D4EDD",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
    textAlign: "center",
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
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
    justifyContent: "space-between",
  },
  lessonInfo: { flex: 1 },
  lessonLevel: {
    fontSize: 11,
    color: "#9D4EDD",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
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
  viewAllButton: {
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9D4EDD",
    marginBottom: 40,
  },
  viewAllText: {
    color: "#9D4EDD",
    fontSize: 16,
    fontWeight: "bold",
  },
});
