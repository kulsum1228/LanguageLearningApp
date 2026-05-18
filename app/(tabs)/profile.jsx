import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
import { getUser, removeToken, removeUser } from "../utils/storage";
import { theme } from "../utils/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedUser = await getUser();
      setUser(savedUser);
      const statsRes = await API.get(`/gamification/stats/${savedUser?.id}`);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await removeToken();
    await removeUser();
    router.replace("/(auth)/login");
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
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={theme.primaryGradient}
          style={styles.headerBanner}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={22} color={theme.primary} />
            <Text style={styles.statNumber}>{stats?.streak_days || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={22} color={theme.primary} />
            <Text style={styles.statNumber}>{stats?.xp_points || 0}</Text>
            <Text style={styles.statLabel}>XP Points</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={22} color={theme.success} />
            <Text style={styles.statNumber}>{stats?.lessons_done || 0}</Text>
            <Text style={styles.statLabel}>Lessons Done</Text>
          </View>
        </View>

        {/* Badges */}
        {stats?.badges?.length > 0 && (
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

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={theme.primary}
              />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <Ionicons
                name="language-outline"
                size={20}
                color={theme.primary}
              />
            </View>
            <Text style={styles.menuText}>Language Preference</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={theme.primary}
              />
            </View>
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  scrollView: { flex: 1 },
  container: { paddingBottom: 100 },
  headerBanner: {
    paddingTop: 70,
    paddingBottom: 32,
    alignItems: "center",
    gap: 8,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarText: { fontSize: 32, fontWeight: "bold", color: "#FFFFFF" },
  userName: { fontSize: 22, fontWeight: "bold", color: "#FFFFFF" },
  userEmail: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingBottom: 0,
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
  statNumber: { fontSize: 20, fontWeight: "bold", color: theme.textPrimary },
  statLabel: { fontSize: 10, color: theme.textSecondary, textAlign: "center" },
  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: {
    fontSize: 17,
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
  menuItem: {
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...theme.shadow,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: { flex: 1, color: theme.textPrimary, fontSize: 15 },
  logoutButton: {
    margin: 20,
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.error,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 40,
  },
  logoutText: { color: theme.error, fontSize: 15, fontWeight: "bold" },
});
