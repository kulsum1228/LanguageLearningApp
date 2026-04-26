import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

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

  const handleContinue = () => {
    if (selected === "marathi") {
      router.replace("/(tabs)");
    }
  };

  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A0533", "#2D1B69"]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>What do you want{"\n"}to learn?</Text>
          <Text style={styles.subtitle}>
            Choose a language to start your journey
          </Text>
        </View>

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
          >
            <View style={styles.langInfo}>
              <Text style={styles.nativeName}>{lang.nativeName}</Text>
              <Text style={styles.langName}>{lang.name}</Text>
              <Text style={styles.langRegion}>{lang.region}</Text>
            </View>
            <View style={styles.langRight}>
              {!lang.available && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              )}
              {lang.available && selected === lang.id && (
                <Ionicons name="checkmark-circle" size={28} color="#9D4EDD" />
              )}
              {lang.available && selected !== lang.id && (
                <Ionicons name="ellipse-outline" size={28} color="#444" />
              )}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.continueButton, !selected && styles.continueDisabled]}
          onPress={handleContinue}
          disabled={!selected}
        >
          <LinearGradient
            colors={selected ? ["#7B2FBE", "#9D4EDD"] : ["#333", "#444"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 24 },
  header: {
    marginTop: 60,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
  },
  langCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2D1B69",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedCard: {
    borderColor: "#9D4EDD",
    backgroundColor: "#2D1B69",
  },
  disabledCard: {
    opacity: 0.5,
  },
  langInfo: { flex: 1 },
  nativeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  langName: {
    fontSize: 16,
    color: "#CCC",
    marginBottom: 2,
  },
  langRegion: {
    fontSize: 13,
    color: "#888",
  },
  langRight: { alignItems: "center" },
  comingSoonBadge: {
    backgroundColor: "#2D1B69",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  comingSoonText: {
    color: "#9D4EDD",
    fontSize: 11,
    fontWeight: "600",
  },
  continueButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 40,
  },
  continueDisabled: { opacity: 0.5 },
  continueGradient: {
    padding: 18,
    alignItems: "center",
  },
  continueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
