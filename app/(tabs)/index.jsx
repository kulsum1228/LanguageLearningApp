import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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

export default function HomeScreen() {
  const router = useRouter();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    xp_points: 0,
    streak_days: 0,
    lessons_done: 0,
  });
  const [user, setUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      const savedUser = await getUser();
      setUser(savedUser);
      const [lessonsRes, statsRes] = await Promise.all([
        API.get("/lessons"),
        API.get(`/gamification/stats/${savedUser?.id}`),
      ]);
      setLessons(lessonsRes.data.slice(0, 3));
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* Orange header banner */}
      <LinearGradient
        colors={theme.primaryGradient}
        style={styles.headerBanner}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              Hello{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
            </Text>
            <Text style={styles.subGreeting}>Ready to learn today?</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color="#FF6B00" />
            <Text style={styles.streakNumber}>{stats.streak_days}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={22} color={theme.streakColor} />
            <Text style={styles.statNumber}>{stats.streak_days}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={22} color={theme.xpColor} />
            <Text style={styles.statNumber}>{stats.xp_points}</Text>
            <Text style={styles.statLabel}>XP Points</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={22} color={theme.success} />
            <Text style={styles.statNumber}>{stats.lessons_done}</Text>
            <Text style={styles.statLabel}>Lessons Done</Text>
          </View>
        </View>

        {/* Badges */}
        {stats.badges?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Badges</Text>
            <View style={styles.badgesRow}>
              {stats.badges.map((badge, index) => (
                <View key={index} style={styles.badgeCard}>
                  <Text style={styles.badgeEmoji}>{badge.badge_emoji}</Text>
                  <Text style={styles.badgeName}>{badge.badge_name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Start Learning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          {loading ? (
            <ActivityIndicator color={theme.primary} size="large" />
          ) : (
            lessons.map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.lessonIconBox}>
                  <Ionicons
                    name="book-outline"
                    size={22}
                    color={theme.primary}
                  />
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonLevel}>{lesson.level}</Text>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDesc} numberOfLines={1}>
                    {lesson.description}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.primary}
                />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* View All */}
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/(tabs)/lessons")}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All Lessons</Text>
          <Ionicons name="arrow-forward" size={18} color={theme.primary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  headerBanner: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subGreeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.primary,
  },
  scrollView: { flex: 1 },
  container: { padding: 20, paddingBottom: 100 },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    marginTop: 4,
  },
  statCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    gap: 4,
    ...theme.shadow,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: theme.textSecondary,
    textAlign: "center",
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.textPrimary,
    marginBottom: 12,
  },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badgeCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.badgeBorder,
    minWidth: 80,
    ...theme.shadow,
  },
  badgeEmoji: { fontSize: 24, marginBottom: 4 },
  badgeName: {
    fontSize: 10,
    color: theme.primary,
    textAlign: "center",
    fontWeight: "600",
  },
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
  lessonIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonInfo: { flex: 1 },
  lessonLevel: {
    fontSize: 11,
    color: theme.primary,
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.textPrimary,
    marginBottom: 2,
  },
  lessonDesc: { fontSize: 12, color: theme.textSecondary },
  viewAllButton: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.primary,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  viewAllText: {
    color: theme.primary,
    fontSize: 15,
    fontWeight: "bold",
  },
});
