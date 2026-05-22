import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';

export default function CompleteHistoryScreen() {
  const router = useRouter();
  const [filter, setFilter] = React.useState('all');

  const historyItems = [
    { id: '1', title: 'Emergency Relief Fund', date: 'Oct 24, 2023', amount: '₱14,250', status: 'Processed', icon: 'medical_services', type: 'donation' },
    { id: '2', title: 'Rural Education Fund', date: 'Oct 12, 2023', amount: '₱10,000', status: 'Processed', icon: 'school', type: 'donation' },
    { id: '3', title: 'Donation Bonus', date: 'Oct 10, 2023', amount: '+500 pts', status: 'Awarded', icon: 'stars', type: 'point' },
    { id: '4', title: 'Reforestation Project', date: 'Sep 28, 2023', amount: '₱5,000', status: 'Processed', icon: 'forest', type: 'donation' },
    { id: '5', title: 'Daily Impact Login', date: 'Sep 27, 2023', amount: '+20 pts', status: 'Awarded', icon: 'auto_awesome', type: 'point' },
    { id: '6', title: 'Ocean Cleanup Drive', date: 'Sep 15, 2023', amount: '₱2,500', status: 'Processed', icon: 'waves', type: 'donation' },
  ];

  const filteredItems = historyItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'donations') return item.type === 'donation';
    if (filter === 'points') return item.type === 'point';
    return true;
  });

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

          <View style={styles.list}>
            {filteredItems.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={[styles.historyIcon, item.type === 'point' && styles.pointIconBg]}>
                    <MaterialSymbols 
                      name={item.icon} 
                      size={24} 
                      color={item.type === 'point' ? colors.tertiary : colors.primary} 
                      fill 
                    />
                  </View>
                  <View>
                    <Text style={styles.historyTitle}>{item.title}</Text>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                </View>
                <View style={styles.historyRight}>
                  <Text style={[styles.historyAmount, item.type === 'point' && styles.pointText]}>
                    {item.amount}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, item.type === 'point' && { backgroundColor: colors.tertiary }]} />
                    <Text style={[styles.statusText, item.type === 'point' && { color: colors.tertiary }]}>
                      {item.status}
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
