import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../utils/api";
import { saveToken, saveUser } from "../utils/storage";
import { theme } from "../utils/theme";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await API.post("/auth/login", { email, password });
      await saveToken(response.data.token);
      await saveUser(response.data.user);
      router.replace("/language-select");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      {/* Top orange banner */}
      <LinearGradient colors={theme.primaryGradient} style={styles.topBanner}>
        <View style={styles.logoCircle}>
          <Ionicons name="language" size={40} color={theme.primary} />
        </View>
        <Text style={styles.appName}>BhashaLearn</Text>
        <Text style={styles.tagline}>Learn Indian Languages</Text>
      </LinearGradient>

      {/* Form card */}
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Continue your language journey</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={theme.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={theme.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient colors={theme.primaryGradient} style={styles.button}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.link}>
            Don't have an account? <Text style={styles.linkBold}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  container: { flexGrow: 1 },
  topBanner: {
    paddingTop: 70,
    paddingBottom: 40,
    alignItems: "center",
    gap: 8,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    ...theme.shadow,
  },
  appName: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF" },
  tagline: { fontSize: 14, color: "rgba(255,255,255,0.85)" },
  card: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 28,
    margin: 20,
    marginTop: -20,
    ...theme.shadow,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.textPrimary,
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: theme.textSecondary, marginBottom: 24 },
  inputWrapper: { marginBottom: 16 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.textPrimary,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: theme.textPrimary,
  },
  buttonWrapper: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 20,
  },
  button: { padding: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  link: { color: theme.textSecondary, textAlign: "center", fontSize: 14 },
  linkBold: { color: theme.primary, fontWeight: "bold" },
});
