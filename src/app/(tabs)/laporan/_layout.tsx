import { Stack } from 'expo-router';

export default function LaporanLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="[id]/edit" options={{ headerShown: false }} />
    </Stack>
  );
}
