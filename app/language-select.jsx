import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "./utils/theme";

const LANGUAGES = [
  {
    id: "marathi",
    name: "Marathi",
    nativeName: "मराठी",
    region: "Maharashtra",
    available: true,
  },
  {
    id: "hindi",
    name: "Hindi",
    nativeName: "हिन्दी",
    region: "Pan India",
    available: false,
  },
  {
    id: "tamil",
    name: "Tamil",
    nativeName: "தமிழ்",
    region: "Tamil Nadu",
    available: false,
  },
  {
    id: "bengali",
    name: "Bengali",
    nativeName: "বাংলা",
    region: "West Bengal",
    available: false,
  },
  {
    id: "kannada",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    region: "Karnataka",
    available: false,
  },
  {
    id: "telugu",
    name: "Telugu",
    nativeName: "తెలుగు",
    region: "Andhra Pradesh",
    available: false,
  },
];

export default function LanguageSelectScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <LinearGradient colors={theme.primaryGradient} style={styles.topBanner}>
        <Text style={styles.bannerTitle}>What do you want{"\n"}to learn?</Text>
        <Text style={styles.bannerSubtitle}>
          Choose a language to start your journey
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.id}
            style={[
              styles.langCard,
              selected === lang.id && styles.selectedCard,
              !lang.available && styles.disabledCard,
            ]}
            onPress={() => lang.available && setSelected(lang.id)}
            disabled={!lang.available}
            activeOpacity={0.7}
          >
            <View style={styles.langInfo}>
              <Text style={styles.nativeName}>{lang.nativeName}</Text>
              <Text style={styles.langName}>{lang.name}</Text>
              <Text style={styles.langRegion}>{lang.region}</Text>
            </View>
            <View style={styles.langRight}>
              {!lang.available ? (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              ) : selected === lang.id ? (
                <Ionicons
                  name="checkmark-circle"
                  size={28}
                  color={theme.primary}
                />
              ) : (
                <Ionicons
                  name="ellipse-outline"
                  size={28}
                  color={theme.textLight}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.continueButton, !selected && styles.continueDisabled]}
          onPress={() => selected === "marathi" && router.replace("/(tabs)")}
          disabled={!selected}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selected ? theme.primaryGradient : ["#CCCCCC", "#BBBBBB"]}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  topBanner: {
    paddingTop: 70,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    lineHeight: 36,
  },
  bannerSubtitle: { fontSize: 15, color: "rgba(255,255,255,0.85)" },
  scrollView: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  langCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    ...theme.shadow,
  },
  selectedCard: {
    borderColor: theme.primary,
    borderWidth: 2,
    backgroundColor: theme.primaryLight,
  },
  disabledCard: { opacity: 0.5 },
  langInfo: { flex: 1 },
  nativeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.textPrimary,
    marginBottom: 4,
  },
  langName: { fontSize: 15, color: theme.textPrimary, marginBottom: 2 },
  langRegion: { fontSize: 13, color: theme.textSecondary },
  langRight: { alignItems: "center" },
  comingSoonBadge: {
    backgroundColor: theme.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  comingSoonText: { color: theme.primary, fontSize: 11, fontWeight: "600" },
  continueButton: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
  continueDisabled: { opacity: 0.6 },
  continueGradient: {
    padding: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  continueText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});
