import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="language-select" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lesson/[id]" />
      <Stack.Screen name="exercise/[id]" />
    </Stack>
  );
}
