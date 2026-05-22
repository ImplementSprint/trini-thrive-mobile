import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { HButton } from '@/components/ui/HButton';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeLayout hideHeader={true}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Choose a Cause,{'\n'}
            <Text style={{ color: '#F28D83' }}>Give with Purpose</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            HOPECARD isn't just a platform; it's a bridge of compassion. We turn every small contribution into a ripple of hope for communities in need.
          </Text>
          
          <View style={styles.heroActions}>
            <HButton 
              title="Get Started" 
              onPress={() => router.push('/(auth)/signup')} 
              style={styles.heroBtnCentered}
            />
          </View>

          <View style={styles.heroImageContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCae4hCayUUsyyJIgEkrgw9jmnmvyZnLvs5T_bO1HHTGM9VPMz09phC37yzdLBtxLPJkSltXB2063J6cyV6siG1jwumLj92VSdmxY7XOaqks8jrrADRLWrOcKC71RPZBydK-nKS_W1mEky-tBRfrAlOTqExik3gCddse7kH4tx6S_cXWB3llOyL-fvtHOJz-Ds8znV5Q2kYZDqec06m4TMjB9qklH2nmGFsppbp__S6ewnACsf0rggySQ8flkeMgjtmv6gjGNLaG0EG' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <StatCard 
            icon="volunteer_activism" 
            value="124k+" 
            label="Lives Impacted" 
            bgColor="#FFDAD6"
            iconColor={colors.primary}
          />
          <StatCard 
            icon="payments" 
            value="$8.2M" 
            label="Funds Raised"
            bgColor="#FFDAD5"
            iconColor={colors.secondary}
          />
          <StatCard 
            icon="public" 
            value="42" 
            label="Global Partners"
            bgColor="#91F6D130"
            iconColor="#006C53"
          />
        </View>

        {/* Featured Narrative */}
        <View style={styles.narrativeSection}>
          <View style={styles.narrativeBadge}>
            <View style={styles.badgeLine} />
            <Text style={styles.badgeText}>FEATURED IMPACT</Text>
          </View>
          <Text style={styles.narrativeTitle}>Beyond the Transaction</Text>
          <View style={styles.narrativeImageContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaJs518c9IuZKQIPMdHf46G7kRmhRAyVisnl7AsGePWMuEWI3dZZo1nKuD2B_vTo4oiboPormMvw3ufEu_FtduMQ1PtrV3EEIjkBPKAu_lwSVxxZzARuefsCsolD873O54M1G1MG2ZxWCIMaib1SS2Odnz-6yTX15yw9HPC3hu9H2563hnP22gwQSoalSy9qqA_30tlZ2QsKjFG7ZwGzxm8e1t399QL6f8BzYeMehcNdvgQjzaoxDBthAMWOiEocK965eiVsETH1HA' }}
              style={styles.narrativeImage}
            />
          </View>
          <Text style={styles.narrativeDesc}>
            We believe that every donation is a story waiting to be told. Through HOPECARD, you're providing clean water to a village in Malawi and hope for a brighter future.
          </Text>
          
          <View style={styles.featurePoints}>
            <FeaturePoint 
              icon="verified" 
              title="Transparent Tracking" 
              desc="See exactly where your impact flows with real-time updates." 
            />
            <FeaturePoint 
              icon="favorite" 
              title="Community First" 
              desc="Projects chosen by the people who live within them." 
            />
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaOuter}>
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjjSaXKP4-m05qvzsvBk33V2y5Ex1ee3YLeC-PmTyoCq98dMcRA8_AEbL3_6XMF5_h93-nXpD_AQ5wuVE6K6ImW-3FXpG-kpxf_vm69pYMVqHZeKVQEgfT_wHXyHDLbVVgvLs1p0OKbMT5WeYjfErs1RGHeJkTxVN7e4GVBWkPSgC2bKSfZeLK6YPqfVsEFLVc0OKUE9XDlOTdY9P5X598W0qNJurOyatI4hQRxQ-n3GBbwf3ity-SQ2wy4kY77FaiFokz0OEHW5E5' }}
            style={styles.ctaContainer}
            imageStyle={{ opacity: 0.2, borderRadius: 24 }}
          >
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>Ready to start your journey?</Text>
              <Text style={styles.ctaSubtitle}>Join over 50,000 donors who are making the world a softer, more compassionate place every single day.</Text>
              <View style={styles.ctaActions}>
                <TouchableOpacity style={styles.ctaBtnSecondary}>
                  <Text style={styles.ctaBtnTextSecondary}>Donor Dashboard</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>HOPECARD</Text>
          <Text style={styles.footerTagline}>
            Cultivating a world where compassion is the primary currency. Join us in our mission to humanize the act of giving.
          </Text>
          
          <View style={styles.footerLinksGrid}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerColTitle}>EXPLORE</Text>
              <Text style={styles.footerLink}>Our Story</Text>
              <Text style={styles.footerLink}>Impact Reports</Text>
              <Text style={styles.footerLink}>Community</Text>
            </View>
            <View style={styles.footerColumn}>
              <Text style={styles.footerColTitle}>SUPPORT</Text>
              <Text style={styles.footerLink}>Privacy Policy</Text>
              <Text style={styles.footerLink}>Contact Us</Text>
              <Text style={styles.footerLink}>Help Center</Text>
            </View>
          </View>
          
          <View style={styles.copyContainer}>
            <Text style={styles.copyright}>© 2024 HOPECARD | THE HUMAN EMBRACE. ALL RIGHTS RESERVED.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeLayout>
  );
}

function StatCard({ icon, value, label, bgColor, iconColor }: any) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: bgColor }]}>
        <MaterialSymbols name={icon} size={32} color={iconColor} fill />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FeaturePoint({ icon, title, desc }: any) {
  return (
    <View style={styles.featurePoint}>
      <View style={styles.featureIconBox}>
        <MaterialSymbols name={icon} size={24} color={colors.primaryContainer} fill />
      </View>
      <View style={styles.featureTextBox}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: '#FCF9F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(252, 249, 248, 0.85)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F28D83',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -1,
  },
  headerBtn: {
    width: 140,
    paddingVertical: 12,
  },
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl * 1.5,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.onSurface,
    textAlign: 'center',
    lineHeight: 52,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginBottom: spacing.lg,
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: 'Manrope_500Medium',
    paddingHorizontal: 20,
    marginBottom: spacing.xl,
  },
  heroActions: {
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: spacing.xxl,
  },
  heroBtnCentered: {
    width: '100%',
    paddingVertical: 18,
  },
  heroImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  statsSection: {
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: '#FCF9F8',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
  },
  statIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  narrativeSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    backgroundColor: colors.surfaceContainerLow,
  },
  narrativeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  badgeLine: {
    width: 4,
    height: 24,
    backgroundColor: colors.primaryContainer,
    borderRadius: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryContainer,
    letterSpacing: 2,
  },
  narrativeTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    lineHeight: 42,
    marginBottom: 32,
  },
  narrativeImageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    borderWidth: 4,
    borderColor: 'white',
  },
  narrativeImage: {
    width: '100%',
    height: '100%',
  },
  narrativeDesc: {
    fontSize: 18,
    color: colors.onSurfaceVariant,
    lineHeight: 28,
    fontFamily: 'Manrope_500Medium',
    marginBottom: 40,
  },
  featurePoints: {
    gap: 24,
  },
  featurePoint: {
    flexDirection: 'row',
    gap: 20,
  },
  featureIconBox: {
    padding: 12,
    backgroundColor: 'rgba(242, 141, 131, 0.1)',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    fontFamily: 'Manrope_500Medium',
  },
  ctaOuter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  ctaContainer: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 80,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 24,
  },
  ctaSubtitle: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
  },
  ctaActions: {
    width: '100%',
    gap: 16,
  },
  ctaBtnPrimary: {
    backgroundColor: 'white',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  ctaBtnTextPrimary: {
    color: colors.primaryContainer,
    fontSize: 16,
    fontWeight: '800',
  },
  ctaBtnSecondary: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  ctaBtnTextSecondary: {
    color: colors.onPrimaryContainer,
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.lg,
    paddingVertical: 60,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  footerLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F28D83',
    opacity: 0.7,
    marginBottom: 20,
  },
  footerTagline: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    fontFamily: 'Manrope_500Medium',
    marginBottom: 40,
  },
  footerLinksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 60,
  },
  footerColumn: {
    gap: 12,
  },
  footerColTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: 2,
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  copyContainer: {
    paddingTop: 32,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  copyright: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
