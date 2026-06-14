import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { SystemPhaseProvider } from '../context/SystemPhaseContext';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(Ionicons.font);
      } catch (error) {
        console.warn('Error loading fonts', error);
      } finally {
        setFontsReady(true);
      }
    }

    loadFonts();

    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      return () => {
        link.remove();
      };
    }

    return undefined;
  }, []);

  if (!fontsReady) {
    return <View style={{ flex: 1, backgroundColor: '#f8f9f8' }} />;
  }

  return (
    <SystemPhaseProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SystemPhaseProvider>
  );
}
