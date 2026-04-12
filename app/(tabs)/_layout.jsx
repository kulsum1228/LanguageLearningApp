import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1A1A2E",
          borderTopColor: "#2D1B69",
        },
        tabBarActiveTintColor: "#9D4EDD",
        tabBarInactiveTintColor: "#666",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarLabel: "Home" }}
      />
      <Tabs.Screen
        name="lessons"
        options={{ title: "Lessons", tabBarLabel: "Lessons" }}
      />
      <Tabs.Screen
        name="conversation"
        options={{ title: "Practice", tabBarLabel: "🗣️ Practice" }}
      />
    </Tabs>
  );
}
