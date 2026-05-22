import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';

export default function NotificationsScreen() {
  const router = useRouter();

  const notifications = [
    {
      id: '1',
      title: 'Donation Successful',
      message: 'Your donation to "Support Local Farmers" was successful.',
      time: '2 hours ago',
      icon: 'check_circle',
      color: '#4CAF50',
    },
    {
      id: '2',
      title: 'New Achievement!',
      message: 'You have earned the "Impact Starter" badge.',
      time: '5 hours ago',
      icon: 'auto_awesome',
      color: '#FF9800',
    },
    {
      id: '3',
      title: 'Weekly Roundup',
      message: 'See how your contributions made a difference this week.',
      time: '1 day ago',
      icon: 'redeem',
      color: colors.primary,
    },
  ];

  return (
    <SafeLayout hideHeader>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialSymbols name="close" size={24} color={colors.onSurface} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={{ width: 44 }} /> {/* Placeholder for balance */}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {notifications.map((item) => (
            <TouchableOpacity key={item.id} style={styles.notificationCard}>
              <View style={[styles.iconContainer, { backgroundColor: item.color + '1A' }]}>
                <MaterialSymbols name={item.icon} size={24} color={item.color} fill />
              </View>
              <View style={styles.content}>
                <View style={styles.row}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
                <Text style={styles.notifMessage}>{item.message}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {notifications.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialSymbols name="notifications_off" size={64} color={colors.outlineVariant} />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  scrollContent: {
    padding: 24,
    gap: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  notifTime: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: 'Manrope_500Medium',
  },
  notifMessage: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    fontFamily: 'Manrope_500Medium',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    fontFamily: 'Manrope_500Medium',
  },
});
