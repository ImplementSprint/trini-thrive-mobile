import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@digdon/ui';
import { useCampaigns } from '../../hooks/useCampaigns';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';
import { ProgressBar } from '@/components/ui/ProgressBar';

const CATEGORIES = ['All', 'Education', 'Health', 'Environment', 'Animal Rescue'];

export default function HomeScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const isFiltered = activeCategory !== 'All' || debouncedSearch.length > 0;

  const { data: campaigns, isLoading, isError, refetch } = useCampaigns({
    limit: isFiltered ? undefined : 10,
    category: activeCategory !== 'All' ? activeCategory : undefined,
    search: debouncedSearch || undefined,
  });

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Editorial Intro */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          fund <Text style={styles.italicPrimary}>stories</Text>{"\n"}
          that <Text style={styles.italicPrimary}>matter</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Fuel verified local initiatives and start your journey of compassion today.
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialSymbols name="search" size={24} color={colors.onSurfaceVariant} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search causes near you..."
            placeholderTextColor={colors.onSurfaceVariant + '80'}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Categories Scroller */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroller}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.activeCategoryChip
              ]}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === cat && styles.activeCategoryText
              ]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>



      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Campaigns</Text>
      </View>
    </View>
  );

  return (
    <SafeLayout>
      <FlatList
        data={campaigns ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CampaignCard
            campaign={item}
            onPress={(id) => router.push(`/modal?id=${id}`)}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <Text style={{ textAlign: 'center', color: colors.onSurfaceVariant, padding: 32, fontFamily: 'Manrope_500Medium' }}>Loading campaigns...</Text>
          ) : isError ? (
            <View style={{ alignItems: 'center', padding: 32, gap: 12 }}>
              <Text style={{ color: colors.onSurfaceVariant, fontFamily: 'Manrope_500Medium' }}>Failed to load campaigns</Text>
              <TouchableOpacity onPress={() => refetch()}><Text style={{ color: colors.primary, fontWeight: '700' }}>Retry</Text></TouchableOpacity>
            </View>
          ) : isFiltered ? (
            <View style={{ alignItems: 'center', padding: 32, gap: 8 }}>
              <Text style={{ fontSize: 32 }}>🔍</Text>
              <Text style={{ color: colors.onSurface, fontWeight: '800', fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold', textAlign: 'center' }}>No campaigns found</Text>
              <Text style={{ color: colors.onSurfaceVariant, fontFamily: 'Manrope_500Medium', textAlign: 'center', fontSize: 14 }}>
                {debouncedSearch ? `No results for "${debouncedSearch}"` : `No campaigns in "${activeCategory}"`}
              </Text>
            </View>
          ) : null
        }
      />
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  header: {
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F28D83',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
  heroSection: {
    gap: 8,
    paddingHorizontal: 4,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    lineHeight: 44,
    letterSpacing: -1.5,
  },
  italicPrimary: {
    color: colors.primary,
    fontStyle: 'italic',
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.onSurfaceVariant,
    fontFamily: 'Manrope_500Medium',
    lineHeight: 26,
    maxWidth: '90%',
  },
  searchContainer: {
    paddingHorizontal: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.onSurface,
    fontFamily: 'Manrope_500Medium',
  },
  categoryContainer: {
    marginHorizontal: -spacing.md,
  },
  categoryScroller: {
    paddingHorizontal: spacing.md,
    gap: 10,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: colors.surfaceContainerLow,
  },
  activeCategoryChip: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    fontFamily: 'Manrope_600SemiBold',
  },
  activeCategoryText: {
    color: 'white',
  },
  featuredSection: {
    marginTop: spacing.sm,
  },
  featuredCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  featuredImageContainer: {
    height: 240,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.tertiary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.onTertiary,
    letterSpacing: 1,
  },
  shareIconButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    padding: 24,
    paddingTop: 16,
  },
  featuredTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_700Bold',
    lineHeight: 34,
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
    fontFamily: 'Manrope_500Medium',
    marginBottom: 20,
  },
  featuredStats: {
    gap: 8,
  },
  featuredProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  featuredRaisedText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  featuredGoalLabel: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontWeight: '400',
  },
  featuredPercentText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  featuredActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  featuredGoalText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  donateNowButton: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  donateNowText: {
    color: colors.onPrimaryContainer,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionHeader: {
    paddingHorizontal: 4,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
});
