import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notificationsQuery, markRead } = useNotifications();
  const notifications = notificationsQuery.data ?? [];

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
          {notificationsQuery.isLoading && (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}

          {notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.notificationCard, item.is_read && { opacity: 0.6 }]}
              onPress={() => markRead.mutate(item.id)}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '1A' }]}>
                <MaterialSymbols name="notifications" size={24} color={colors.primary} fill />
              </View>
              <View style={styles.content}>
                <View style={styles.row}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.notifMessage}>{item.message}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {!notificationsQuery.isLoading && notifications.length === 0 && (
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
