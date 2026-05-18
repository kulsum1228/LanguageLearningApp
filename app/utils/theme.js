export const theme = {
  // Backgrounds
  background: "#F7F7F7", // Light grey app background
  card: "#FFFFFF", // White cards
  cardBorder: "#E5E5E5", // Light grey border
  inputBg: "#F0F0F0", // Input field background

  // Orange Accent (Primary)
  primary: "#FF6B00", // Main orange
  primaryLight: "#FFF0E6", // Very light orange (badges, highlights)
  primaryDark: "#CC5500", // Darker orange (pressed state)
  primaryGradient: ["#FF6B00", "#FF8C00"], // Orange gradient

  // Text
  textPrimary: "#1A1A1A", // Main text
  textSecondary: "#777777", // Secondary text
  textLight: "#AAAAAA", // Placeholder text
  textOnPrimary: "#FFFFFF", // Text on orange background

  // Status Colors
  success: "#58CC02", // Duolingo green (correct answers)
  successLight: "#E6F9D4", // Light green background
  error: "#FF4B4B", // Red (wrong answers)
  errorLight: "#FFE6E6", // Light red background
  warning: "#FFC800", // Yellow (hints)
  warningLight: "#FFF8E6", // Light yellow background

  // Tab Bar
  tabBar: "#FFFFFF",
  tabBarBorder: "#E5E5E5",
  tabActive: "#FF6B00",
  tabInactive: "#AAAAAA",

  // Specific Components
  streakColor: "#FF6B00", // Streak flame
  xpColor: "#FF6B00", // XP star
  badgeBorder: "#FF6B00", // Badge border

  // Shadow
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};

export default theme;
