import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';
import { usePurchases } from '../hooks/usePurchases';

export default function CompleteHistoryScreen() {
  const router = useRouter();
  const [filter, setFilter] = React.useState('all');
  const { history } = usePurchases();
  const purchases = history.data ?? [];

  return (
    <SafeLayout hideHeader>
      <View style={styles.container}>
        {/* Simple Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialSymbols name="close" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Complete History</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.searchBox}>
            <MaterialSymbols name="search" size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.searchPlaceholder}>Search history...</Text>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {['all', 'donations', 'points'].map((f) => (
              <TouchableOpacity 
                key={f}
                style={[styles.filterChip, filter === f && styles.activeFilterChip]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {history.isLoading && (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
          <View style={styles.list}>
            {purchases.map((purchase) => (
              <View key={purchase.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={styles.historyIcon}>
                    <MaterialSymbols
                      name="volunteer_activism"
                      size={24}
                      color={colors.primary}
                      fill
                    />
                  </View>
                  <View>
                    <Text style={styles.historyTitle}>{purchase.hopecard.campaign.title}</Text>
                    <Text style={styles.historyDate}>{new Date(purchase.purchased_at).toLocaleDateString()}</Text>
                  </View>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyAmount}>
                    ₱{purchase.amount_paid.toLocaleString()}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>
                      {purchase.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
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
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 20,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    opacity: 0.6,
    fontFamily: 'Manrope_500Medium',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  activeFilterText: {
    color: 'white',
  },
  list: {
    gap: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(27,28,27,0.05)',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointIconBg: {
    backgroundColor: colors.tertiaryContainer + '15',
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  historyDate: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
  },
  pointText: {
    color: colors.tertiary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
  },
});
