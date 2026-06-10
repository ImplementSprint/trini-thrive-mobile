import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, borderRadius } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { HCard } from '@/components/ui/HCard';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';
import { ProgressBar } from '@/components/ui/ProgressBar';

import { useRouter } from 'expo-router';

export default function ImpactScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('donations');

  const pointHistory = [
    {
      id: '1',
      title: 'Donation Bonus',
      date: 'Oct 24, 2023',
      amount: '+500 pts',
      status: 'Awarded',
      icon: 'stars',
      color: colors.tertiary,
    },
    {
      id: '2',
      title: 'Daily Impact Login',
      date: 'Oct 23, 2023',
      amount: '+20 pts',
      status: 'Awarded',
      icon: 'auto_awesome',
      color: colors.secondary,
    },
    {
      id: '3',
      title: 'Achievement: Lifesaver',
      date: 'Oct 20, 2023',
      amount: '+1,000 pts',
      status: 'Awarded',
      icon: 'favorite',
      color: colors.primary,
    },
  ];

  return (
    <SafeLayout>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View style={styles.header}>
          {/* Kindred Status Progress Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusLevelRow}>
              <View>
                <Text style={styles.statusValue}>Gold Member</Text>
              </View>
              <View style={styles.statusBadgeIcon}>
                <MaterialSymbols name="stars" size={40} color={colors.tertiary} fill />
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>2,160 pts to <Text style={styles.boldText}>Platinum</Text></Text>
                <Text style={styles.percentageText}>78%</Text>
              </View>
              <ProgressBar progress={0.78} height={12} />
            </View>

            {/* Soft decorative elements */}
            <View style={[styles.decorCircle, { top: -20, right: -30 }]} />
            <View style={[styles.decorCircle, { bottom: -40, left: 20, width: 80, height: 80, opacity: 0.03 }]} />
          </View>
        </View>



        {/* HOPECARD Points Balance */}
        <View style={styles.balanceContainer}>
          <HCard variant="flat" style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Available Balance</Text>
            <View style={styles.pointsDisplay}>
              <Text style={styles.pointsValue}>12,840</Text>
              <Text style={styles.pointsUnit}>HOPECARD points</Text>
            </View>
            <View style={styles.balanceActions}>
              <TouchableOpacity style={styles.balanceActionBtn}>
                <View style={styles.actionIconBox}>
                  <MaterialSymbols name="add_circle" size={20} color={colors.primary} fill />
                </View>
                <Text style={styles.actionBtnText}>Earn More</Text>
              </TouchableOpacity>
              <View style={styles.actionDivider} />
              <TouchableOpacity style={styles.balanceActionBtn}>
                <View style={styles.actionIconBox}>
                  <MaterialSymbols name="redeem" size={20} color={colors.primary} fill />
                </View>
                <Text style={styles.actionBtnText}>Redeem</Text>
              </TouchableOpacity>
            </View>
          </HCard>
        </View>

        {/* History Tabs */}
        <View style={styles.historySection}>
          <View style={styles.historyTabs}>
            <TouchableOpacity 
              style={[styles.historyTab, activeTab === 'donations' && styles.activeTab]}
              onPress={() => setActiveTab('donations')}
            >
              <Text style={[styles.tabText, activeTab === 'donations' && styles.activeTabText]}>Donations</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.historyTab, activeTab === 'points' && styles.activeTab]}
              onPress={() => setActiveTab('points')}
            >
              <Text style={[styles.tabText, activeTab === 'points' && styles.activeTabText]}>Point History</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.historyList}>
            {activeTab === 'donations' ? (
              <>
                <HistoryItem
                  title="Emergency Relief Fund"
                  date="Oct 24, 2023"
                  amount="₱14,250"
                  status="Processed"
                  icon="medical_services"
                  isPrimary
                />
                <HistoryItem
                  title="Rural Education Fund"
                  date="Oct 12, 2023"
                  amount="₱10,000"
                  status="Processed"
                  icon="school"
                />
                <HistoryItem
                  title="Reforestation Project"
                  date="Sep 28, 2023"
                  amount="₱5,000"
                  status="Processed"
                  icon="forest"
                />
              </>
            ) : (
              pointHistory.map((item) => (
                <HistoryItem
                  key={item.id}
                  title={item.title}
                  date={item.date}
                  amount={item.amount}
                  status={item.status}
                  icon={item.icon}
                  isPrimary={item.title === 'Achievement: Lifesaver'}
                />
              ))
            )}
          </View>

          <TouchableOpacity 
            style={styles.viewMoreBtn}
            onPress={() => router.push('/history')}
          >
            <Text style={styles.viewMoreText}>View Complete History</Text>
            <MaterialSymbols name="arrow_forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeLayout>
  );
}

function HistoryItem({ title, date, amount, status, icon, isPrimary }: any) {
  return (
    <View style={styles.historyItem}>
      <View style={styles.historyLeft}>
        <View style={[styles.historyIcon, isPrimary && styles.primaryIconBg]}>
          <MaterialSymbols name={icon} size={24} color={isPrimary ? colors.primary : colors.tertiary} fill />
        </View>
        <View>
          <Text style={styles.historyTitle}>{title}</Text>
          <Text style={styles.historyDate}>{date}</Text>
        </View>
      </View>
      <View style={styles.historyRight}>
        <Text style={styles.historyAmount}>{amount}</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  header: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -1,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(27,28,27,0.05)',
  },
  statusLevelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  statusBadgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.tertiaryContainer + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  progressText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontFamily: 'Manrope_500Medium',
  },
  boldText: {
    fontWeight: '800',
    color: colors.onSurface,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.tertiary,
  },
  decorCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.tertiaryContainer,
    opacity: 0.05,
  },
  impactRecordWrapper: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  impactRecordCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 6,
    gap: 16,
  },
  impactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  impactIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  impactRecordLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  impactRecordValue: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  impactRecordUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  impactQuote: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    fontFamily: 'Manrope_500Medium',
    fontStyle: 'italic',
  },
  impactVisual: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  impactImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(151, 69, 62, 0.4)',
  },
  balanceContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  balanceCard: {
    backgroundColor: colors.surfaceContainerLow,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
  },
  balanceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pointsDisplay: {
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  pointsUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: -4,
  },
  balanceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27,28,27,0.05)',
  },
  balanceActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(27,28,27,0.1)',
  },
  historySection: {
    paddingHorizontal: spacing.md,
    gap: 20,
  },
  historyTabs: {
    flexDirection: 'row',
    gap: 12,
  },
  historyTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: colors.surfaceContainerLow,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  activeTabText: {
    color: 'white',
  },
  historyList: {
    gap: 12,
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
    backgroundColor: colors.tertiaryContainer + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryIconBg: {
    backgroundColor: colors.primaryContainer + '20',
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
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.primary + '33',
    borderRadius: 16,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
