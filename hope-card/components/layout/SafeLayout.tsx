import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { colors } from '@digdon/ui';

import { TopNavBar } from './TopNavBar';

interface SafeLayoutProps {
  children: React.ReactNode;
  bg?: string;
  hideHeader?: boolean;
}

export const SafeLayout: React.FC<SafeLayoutProps> = ({ 
  children, 
  bg = colors.background,
  hideHeader = false
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={bg} 
        translucent={Platform.OS === 'android'} 
      />
      {!hideHeader && <TopNavBar />}
      <View style={styles.inner}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  }
});
