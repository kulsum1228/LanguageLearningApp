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
import { getUser, removeToken, removeUser } from "../utils/storage";

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
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.streak_days || 0}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.xp_points || 0}</Text>
            <Text style={styles.statLabel}>XP Points ⭐</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.lessons_done || 0}</Text>
            <Text style={styles.statLabel}>Lessons Done ✅</Text>
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

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={22} color="#9D4EDD" />
            <Text style={styles.menuText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="language-outline" size={22} color="#9D4EDD" />
            <Text style={styles.menuText}>Language Preference</Text>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={22} color="#9D4EDD" />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#F44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 24, paddingBottom: 100 },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 32,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2D1B69",
    borderWidth: 2,
    borderColor: "#9D4EDD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#9D4EDD",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#888",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badgeCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9D4EDD",
    minWidth: 80,
  },
  badgeEmoji: { fontSize: 24, marginBottom: 4 },
  badgeName: { fontSize: 10, color: "#9D4EDD", textAlign: "center" },
  menuItem: {
    backgroundColor: "#1A1A2E",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2D1B69",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#1A1A2E",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F44336",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 40,
  },
  logoutText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "bold",
  },
});
