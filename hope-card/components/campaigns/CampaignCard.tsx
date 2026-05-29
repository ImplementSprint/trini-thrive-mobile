import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { colors, spacing, borderRadius } from '@digdon/ui';
import { Campaign } from '@digdon/ui/types';
import { HCard } from '../ui/HCard';
import { ProgressBar } from '../ui/ProgressBar';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';

interface CampaignCardProps {
  campaign: Campaign;
  onPress: (id: string) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ 
  campaign, 
  onPress 
}) => {
  const progress = campaign.progress_pct / 100;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing campaign on HOPECARD: "${campaign.title}"! ${campaign.description ?? ''}`,
        title: campaign.title,
      });
    } catch (e) {
      console.error('Failed to share:', e);
    }
  };

  return (
    <TouchableOpacity onPress={() => onPress(campaign.id)} activeOpacity={0.9} style={styles.touchable}>
      <HCard style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: campaign.cover_image_url ?? undefined }} style={styles.image} />
          <View style={styles.categoryOverlay}>
            <Text style={styles.categoryOverlayText}>{campaign.category}</Text>
          </View>
          <TouchableOpacity style={styles.shareIconSmall} onPress={handleShare}>
            <MaterialSymbols name="share" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{campaign.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{campaign.description}</Text>
          
          <View style={styles.progressContainer}>
            <ProgressBar progress={progress} height={4} />
            <View style={styles.footerRow}>
              <Text style={styles.raisedValue}>₱{campaign.collected_amount.toLocaleString()}</Text>
              <TouchableOpacity onPress={() => onPress(campaign.id)}>
                <Text style={styles.supportLink}>Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </HCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: spacing.lg,
  },
  card: {
    padding: 0,
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  categoryOverlayText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  shareIconSmall: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  description: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
    fontFamily: 'Manrope_500Medium',
  },
  progressContainer: {
    marginTop: 4,
    gap: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  raisedValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
  },
  supportLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
