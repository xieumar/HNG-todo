import { Stack } from 'expo-router';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ThemeProvider } from '../hooks/useTheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const convexurl = "https://handsome-buffalo-574.convex.cloud";
const convex = new ConvexReactClient( convexurl!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexProvider client={convex}>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: 'Todo' }} />
          </Stack>
        </ThemeProvider>
      </ConvexProvider>
    </GestureHandlerRootView>
  );
}