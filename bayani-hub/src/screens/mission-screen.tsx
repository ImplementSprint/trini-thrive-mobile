import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/providers/auth-provider';
import { API_BASE } from '@/src/lib/api';

// ── Types & Constants ──────────────────────────────────────────────────────────

type MissionState =
  | 'NO_APPROVED_APPLICATION'
  | 'APPROVED_WAITING_ASSIGNMENT'
  | 'ASSIGNED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'TASK_COMPLETED'
  | 'CLOCK_OUT_REQUESTED'
  | 'CLOCK_OUT_DENIED'
  | 'COMPLETED';

type MissionListItem = {
  applicationId: string;
  submittedAt: string | null;
  state: MissionState;
  mission: {
    deploymentId: string;
    applicationId: string;
    campaignId: string | null;
    campaignTitle: string;
    campaignStatus: string;
    roleTitle: string;
    taskDescription: string;
    taskStatus: 'assigned' | 'in_progress' | 'completed';
    deploymentStatus: string;
    assignedAt: string | null;
    site: string;
  } | null;
  shift: {
    id: string;
    status: string;
    clockIn: string | null;
    clockOut: string | null;
    totalHours: number;
    reviewNote: string | null;
  } | null;
};

type Tab = 'ALL' | 'READY' | 'ACTIVE' | 'COMPLETED';

const stateLabel: Record<MissionState, string> = {
  NO_APPROVED_APPLICATION: 'No Approved Application',
  APPROVED_WAITING_ASSIGNMENT: 'Waiting Assignment',
  ASSIGNED: 'Assigned',
  CHECKED_IN: 'Checked In',
  IN_PROGRESS: 'In Progress',
  TASK_COMPLETED: 'Task Completed',
  CLOCK_OUT_REQUESTED: 'Clock-Out Review',
  CLOCK_OUT_DENIED: 'Clock-Out Flagged',
  COMPLETED: 'Completed',
};

function groupFromState(state: MissionState): Tab {
  if (state === 'COMPLETED') return 'COMPLETED';
  if (['ASSIGNED', 'CHECKED_IN', 'APPROVED_WAITING_ASSIGNMENT'].includes(state)) return 'READY';
  if (['IN_PROGRESS', 'TASK_COMPLETED', 'CLOCK_OUT_REQUESTED', 'CLOCK_OUT_DENIED'].includes(state)) return 'ACTIVE';
  return 'ALL';
}

function fmtDate(iso?: string | null) {
  if (!iso) return 'No schedule yet';
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Chevron Icon component for native UI
const ChevronRightIcon = () => (
  <Text style={{ fontSize: 18, color: '#9ca3af', fontWeight: 'bold' }}>→</Text>
);

export function MissionScreen() {
  const router = useRouter();
  const { token, isReady, logout } = useAuth();
  const [missions, setMissions] = useState<MissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isReady && !token) {
      router.replace('/login' as any);
    }
  }, [isReady, token, router]);

  const loadMissions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/forms/my-missions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        router.replace('/login' as any);
        return;
      }
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message ?? 'Unable to load missions.');
      setMissions(Array.isArray(payload?.data) ? payload.data : []);
    } catch {
      setMissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadMissions();
    }
  }, [token]);

  const counts = useMemo(() => ({
    ALL: missions.length,
    READY: missions.filter((mission) => groupFromState(mission.state) === 'READY').length,
    ACTIVE: missions.filter((mission) => groupFromState(mission.state) === 'ACTIVE').length,
    COMPLETED: missions.filter((mission) => groupFromState(mission.state) === 'COMPLETED').length,
  }), [missions]);

  const visibleMissions = useMemo(() => {
    return missions.filter((mission) => {
      const group = groupFromState(mission.state);
      const matchesTab = tab === 'ALL' || group === tab;
      const needle = search.trim().toLowerCase();
      const haystack = [
        mission.mission?.campaignTitle,
        mission.mission?.roleTitle,
        mission.mission?.site,
        mission.applicationId,
        stateLabel[mission.state],
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesTab && (!needle || haystack.includes(needle));
    });
  }, [missions, search, tab]);

  if (!isReady || !token) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navbar */}
      <View style={styles.navBar}>
        <Pressable
          onPress={() => router.push('/dashboard' as any)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Image source={require('../../assets/logo_b.png')} style={{ width: 35, height: 35 }} resizeMode="contain" />
          <Text style={{ fontSize: 18, color: '#111827' }}>BayaniHub</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Pressable onPress={() => router.push('/dashboard' as any)}>
            <Text style={styles.navTextLink}>Home</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>My Missions</Text>
          <Text style={styles.pageSub}>Open each approved volunteer assignment in its own mission workspace.</Text>
        </View>

        {/* Filter Card */}
        <View style={styles.filterCard}>
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search missions, roles, sites..."
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {(['ALL', 'READY', 'ACTIVE', 'COMPLETED'] as Tab[]).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setTab(item)}
                  style={[styles.tab, tab === item && styles.tabActive]}
                >
                  <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>
                    {item === 'ALL' ? 'All' : item.charAt(0) + item.slice(1).toLowerCase()}
                  </Text>
                  <View style={[styles.tabCount, tab === item && styles.tabCountActive]}>
                    <Text style={[styles.tabCountText, tab === item && styles.tabCountTextActive]}>
                      {counts[item]}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Mission List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1a4f7a" />
            <Text style={{ marginTop: 12, color: '#64748b' }}>Loading missions...</Text>
          </View>
        ) : visibleMissions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🎯</Text>
            <Text style={styles.emptyTitle}>No mission entries found</Text>
            <Text style={styles.emptySub}>
              Approved volunteer applications will appear here once they are available for mission tracking.
            </Text>
            <Pressable style={styles.applyBtn} onPress={() => router.push('/volunteer' as any)}>
              <Text style={styles.applyBtnText}>Apply Volunteer</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {visibleMissions.map((missionEntry) => {
              const status = stateLabel[missionEntry.state];
              const title = missionEntry.mission?.campaignTitle ?? 'Awaiting site assignment';
              const subtitle = missionEntry.mission
                ? `${missionEntry.mission.roleTitle} • ${missionEntry.mission.site || 'Site pending'}`
                : `Application ${missionEntry.applicationId.slice(0, 8).toUpperCase()}`;

              // Determine color themes
              const isCompleted = missionEntry.state === 'COMPLETED';
              const isWaiting = missionEntry.state === 'APPROVED_WAITING_ASSIGNMENT';
              const dotColor = isCompleted ? '#16a34a' : isWaiting ? '#f59e0b' : '#2563eb';
              const badgeBg = isCompleted ? 'rgba(22,163,74,0.12)' : isWaiting ? 'rgba(245,158,11,0.14)' : 'rgba(37,99,235,0.12)';
              const badgeText = isCompleted ? '#15803d' : isWaiting ? '#b45309' : '#1d4ed8';

              return (
                <Pressable
                  key={missionEntry.applicationId}
                  style={styles.appRow}
                  onPress={() => router.push(`/mission/${missionEntry.applicationId}` as any)}
                >
                  <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {title}
                    </Text>
                    <View style={styles.rowMeta}>
                      <Text style={styles.rowRef} numberOfLines={1}>
                        {subtitle}
                      </Text>
                      <Text style={styles.rowDate}>
                        • {fmtDate(missionEntry.mission?.assignedAt ?? missionEntry.submittedAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.statusPillText, { color: badgeText }]}>
                      {status}
                    </Text>
                  </View>
                  <ChevronRightIcon />
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 90,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 35,
  },
  navTextLink: { fontSize: 13, color: '#4b5563', fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 16 },

  pageHeader: { gap: 6 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  pageSub: { fontSize: 14, color: '#64748b', lineHeight: 20 },

  filterCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  searchWrap: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    fontSize: 14,
    color: '#111827',
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#1a4f7a',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabCount: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tabCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4b5563',
  },
  tabCountTextActive: {
    color: '#ffffff',
  },

  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },

  emptyState: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  applyBtn: {
    backgroundColor: '#1a4f7a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowRef: {
    fontSize: 12,
    color: '#64748b',
    maxWidth: '60%',
  },
  rowDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
