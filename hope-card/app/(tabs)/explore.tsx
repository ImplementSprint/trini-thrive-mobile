import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@digdon/ui';
import { campaigns } from '@digdon/mock-data/campaigns';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';
import { ProgressBar } from '@/components/ui/ProgressBar';

const CATEGORIES = ['All', 'Education', 'Health', 'Environment', 'Animal Rescue'];

export default function ExploreScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = React.useState('All');
  
  const featuredCampaign = campaigns[0];

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          Choose a Cause,{"\n"}
          <Text style={styles.italicPrimary}>Give with Purpose</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          HOPECARD isn't just a platform; it's a bridge of compassion. We turn every small contribution into a ripple of hope for communities in need.
        </Text>
        
        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>Our Impact</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialSymbols name="search" size={20} color="#F28D83" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Find causes you care about..."
            placeholderTextColor="#F28D83"
          />
        </View>
      </View>

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

      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Campaign</Text>
        <TouchableOpacity 
          style={styles.featuredCard} 
          onPress={() => router.push(`/modal?id=${featuredCampaign.id}`)}
          activeOpacity={0.9}
        >
          <View style={styles.featuredImageContainer}>
            <Image source={{ uri: featuredCampaign.image }} style={styles.featuredImage} />
            <View style={styles.featuredGradient} />
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>FEATURED</Text>
            </View>
            <TouchableOpacity style={styles.shareIconButton}>
              <MaterialSymbols name="share" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{featuredCampaign.title}</Text>
            <Text style={styles.featuredDescription} numberOfLines={2}>
              {featuredCampaign.description}
            </Text>
            
            <View style={styles.featuredStats}>
              <View style={styles.featuredProgressRow}>
                <Text style={styles.featuredRaisedText}>
                  ₱{featuredCampaign.raised.toLocaleString()} <Text style={styles.featuredGoalLabel}>raised</Text>
                </Text>
                <Text style={styles.featuredPercentText}>82%</Text>
              </View>
              <ProgressBar progress={0.82} height={8} />
              <View style={styles.featuredActionRow}>
                <Text style={styles.featuredGoalText}>Goal: ₱1,000,000</Text>
                <View style={styles.donateNowButton}>
                  <Text style={styles.donateNowText}>Donate Now</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Discovered more</Text>
      </View>
    </View>
  );

  return (
    <SafeLayout>
      <FlatList
        data={campaigns.slice(1)}
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
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: spacing.sm,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F28D83',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -1,
  },
  heroSection: {
    gap: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    lineHeight: 40,
    letterSpacing: -1,
    textAlign: 'center',
  },
  italicPrimary: {
    color: '#F28D83',
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    fontFamily: 'Manrope_500Medium',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  heroActions: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: '#F28D83',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F28D83',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryBtn: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#97453E',
    fontSize: 16,
    fontWeight: '800',
  },
  searchContainer: {
    paddingHorizontal: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(242, 141, 131, 0.2)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#97453E',
    fontWeight: '500',
  },
  categoryContainer: {
    marginHorizontal: -spacing.md,
  },
  categoryScroller: {
    paddingHorizontal: spacing.md,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  activeCategoryChip: {
    backgroundColor: '#F28D83',
    borderColor: '#F28D83',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  activeCategoryText: {
    color: 'white',
  },
  featuredSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    paddingHorizontal: 4,
  },
  featuredCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
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
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  shareIconButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    padding: 20,
    gap: 8,
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  featuredDescription: {
    fontSize: 15,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    fontFamily: 'Manrope_500Medium',
  },
  featuredStats: {
    marginTop: 12,
    gap: 8,
  },
  featuredProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  featuredRaisedText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  featuredGoalLabel: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  featuredPercentText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
  },
  featuredActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  featuredGoalText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontFamily: 'Manrope_600SemiBold',
  },
  donateNowButton: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
});
