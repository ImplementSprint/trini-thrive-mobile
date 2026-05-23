import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/src/providers/auth-provider';
import { API_BASE } from '@/src/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

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

type MissionPayload = {
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
    sitemanagerNotes?: string | null;
    zone: {
      name: string;
    } | null;
  } | null;
  shift: {
    clockIn: string | null;
    clockOut: string | null;
  } | null;
  reliability: {
    score: number;
    label: string;
    metrics: {
      completedTasks: number;
      approvedShifts: number;
      approvedHours: number;
      rejectedClockOuts: number;
      noShows: number;
    };
  };
  postShiftSummary: {
    totalHours: number;
    approvedAt: string | null;
    completedTaskCount: number;
    score: number;
  } | null;
};

const stateCopy: Record<MissionState, { title: string; message: string; color: string }> = {
  NO_APPROVED_APPLICATION: {
    title: 'No active mission yet',
    message: 'This application is not yet eligible for mission access.',
    color: '#64748b',
  },
  APPROVED_WAITING_ASSIGNMENT: {
    title: 'Waiting for assignment',
    message: 'Approved. A site manager still needs to assign it.',
    color: '#d97706',
  },
  ASSIGNED: {
    title: 'Mission assigned',
    message: 'Have your QR validated on-site, then start the mission.',
    color: '#2965a2',
  },
  CHECKED_IN: {
    title: 'Presence validated',
    message: 'Your on-site check-in is recorded. Start when ready.',
    color: '#2965a2',
  },
  IN_PROGRESS: {
    title: 'Mission in progress',
    message: 'Keep your task status updated for the site manager.',
    color: '#4f46e5',
  },
  TASK_COMPLETED: {
    title: 'Task completed',
    message: 'Your task is marked complete. Request clock-out when done.',
    color: '#16a34a',
  },
  CLOCK_OUT_REQUESTED: {
    title: 'Awaiting review',
    message: 'Your clock-out request was sent.',
    color: '#d97706',
  },
  CLOCK_OUT_DENIED: {
    title: 'Clock-out needs review',
    message: 'The site manager flagged your request.',
    color: '#dc2626',
  },
  COMPLETED: {
    title: 'Shift approved',
    message: 'Your hours were approved.',
    color: '#16a34a',
  },
};

const flowSteps = ['Assigned', 'Checked In', 'In Progress', 'Completed Task', 'Review', 'Done'];

function stateStep(state: MissionState) {
  if (state === 'COMPLETED') return 5;
  if (state === 'CLOCK_OUT_REQUESTED' || state === 'CLOCK_OUT_DENIED') return 4;
  if (state === 'TASK_COMPLETED') return 3;
  if (state === 'IN_PROGRESS') return 2;
  if (state === 'CHECKED_IN') return 1;
  if (state === 'ASSIGNED') return 0;
  return -1;
}

function formatDateTime(val?: string | null) {
  if (!val) return 'Not recorded';
  return new Date(val).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatTaskStatus(s?: string) {
  if (s === 'in_progress') return 'In Progress';
  if (s === 'checked_in') return 'Checked In';
  if (s === 'completed') return 'Completed';
  return 'Assigned';
}

export function MissionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, isReady, user } = useAuth();

  const [data, setData] = useState<MissionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && !token) {
      router.replace('/login' as any);
    }
  }, [isReady, token, router]);

  const requestApi = useCallback(
    async (path: string, options?: RequestInit) => {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options?.headers,
        },
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message ?? 'Mission request failed.');
      return payload?.data as MissionPayload;
    },
    [token],
  );

  const loadData = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await requestApi(`/forms/my-missions/${id}`);
      setData(res);
    } catch (err: any) {
      setError(err.message ?? 'Unable to load mission.');
    } finally {
      setLoading(false);
    }
  }, [id, requestApi, token]);

  useEffect(() => {
    if (isReady && token && id) loadData();
  }, [id, isReady, token, loadData]);

  const doAction = async (label: string, callback: () => Promise<MissionPayload>) => {
    setAction(label);
    setError(null);
    try {
      const res = await callback();
      setData(res);
    } catch (err: any) {
      setError(err.message ?? 'Action failed.');
    } finally {
      setAction(null);
    }
  };

  const meta = data ? stateCopy[data.state] : stateCopy.NO_APPROVED_APPLICATION;
  const activeStep = data ? stateStep(data.state) : -1;
  const mission = data?.mission;
  const shift = data?.shift;
  const reliability = data?.reliability;

  const canStart = data ? ['ASSIGNED', 'CLOCK_OUT_DENIED'].includes(data.state) : false;
  const canMarkInProgress = data ? ['CHECKED_IN', 'IN_PROGRESS'].includes(data.state) : false;
  const canCompleteTask = data ? ['IN_PROGRESS'].includes(data.state) : false;
  const canRequestClockOut = data ? ['TASK_COMPLETED', 'CLOCK_OUT_DENIED'].includes(data.state) : false;

  if (!isReady || !token) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <Pressable
          onPress={() => router.push('/dashboard' as any)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Image source={require('../../assets/logo_b.png')} style={{ width: 35, height: 35 }} resizeMode="contain" />
          <Text style={{ fontSize: 18, color: '#111827' }}>BayaniHub</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Pressable onPress={() => router.push('/mission' as any)}>
            <Text style={{ fontSize: 13, color: '#1e3a8a', fontWeight: '600' }}>Mission</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageHeader}>
          <Text style={styles.kicker}>Volunteer Operations</Text>
          <Text style={styles.pageTitle}>Mission Workspace</Text>
          <View style={styles.profileChip}>
            <Text style={styles.profileName}>{user?.profile?.first_name ?? 'Volunteer'}</Text>
            <Text style={styles.profileScore}>
              {reliability ? `${reliability.score}/100 reliability` : 'Mission ready'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Pressable style={styles.backBtn} onPress={() => router.push('/mission' as any)}>
            <Text style={styles.backBtnText}>Back to Mission List</Text>
          </Pressable>
          {id && (
            <Pressable style={styles.backBtn} onPress={() => router.push({ pathname: '/status', params: { applicationId: id } } as any)}>
              <Text style={styles.backBtnText}>View Application</Text>
            </Pressable>
          )}
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#1a4f7a" />
            <Text style={{ marginTop: 10, color: '#64748b' }}>Loading mission details...</Text>
          </View>
        ) : (
          <>
            <View style={[styles.statusHero, { borderLeftColor: meta.color }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusLabel, { color: meta.color }]}>{meta.title}</Text>
                <Text style={styles.statusTitle}>{mission?.campaignTitle ?? 'Mission status'}</Text>
                <Text style={styles.statusDesc}>{meta.message}</Text>
              </View>
              <Pressable
                style={[styles.secondaryBtn, { alignSelf: 'center', marginLeft: 10 }]}
                onPress={loadData}
                disabled={!!action}
              >
                <Text style={styles.secondaryBtnText}>Refresh</Text>
              </Pressable>
            </View>

            <View style={styles.stepperContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {flowSteps.map((step, idx) => {
                  const isDone = idx <= activeStep;
                  const isActive = idx === activeStep;
                  return (
                    <View
                      key={step}
                      style={[
                        styles.stepItem,
                        isDone && styles.stepDone,
                        isActive && styles.stepActive,
                      ]}
                    >
                      <View style={[styles.stepNumBox, isDone && styles.stepNumBoxDone]}>
                        <Text style={[styles.stepNum, isDone && styles.stepNumDone]}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.metricGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Task Status</Text>
                <Text style={styles.metricValue}>{formatTaskStatus(mission?.taskStatus)}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Check-In Time</Text>
                <Text style={styles.metricValue}>{formatDateTime(shift?.clockIn)}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Clock-Out</Text>
                <Text style={styles.metricValue}>{formatDateTime(shift?.clockOut)}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Reliability</Text>
                <Text style={styles.metricValue}>{reliability ? `${reliability.score}/100` : '50/100'}</Text>
              </View>
            </View>

            {mission ? (
              <>
                <View style={styles.panel}>
                  <View style={styles.panelHeader}>
                    <Text style={styles.panelTitle}>Assignment</Text>
                    <Text style={styles.panelTitleRight}>{mission.roleTitle}</Text>
                  </View>
                  <View style={styles.taskBox}>
                    <Text style={styles.taskBoxLabel}>Assigned Task</Text>
                    <Text style={styles.taskBoxValue}>{mission.taskDescription}</Text>
                  </View>

                  {mission.sitemanagerNotes ? (
                    <View style={styles.taskBox}>
                      <Text style={styles.taskBoxLabel}>Site Manager Notes</Text>
                      <Text style={styles.taskBoxValue}>{mission.sitemanagerNotes}</Text>
                    </View>
                  ) : null}

                  <View style={styles.detailRow}>
                    <View style={styles.detailCard}>
                      <Text style={styles.detailLabel}>Site / Zone</Text>
                      <Text style={styles.detailValue}>{mission.site || 'Pending'}</Text>
                    </View>
                    <View style={styles.detailCard}>
                      <Text style={styles.detailLabel}>Assigned At</Text>
                      <Text style={styles.detailValue}>{formatDateTime(mission.assignedAt)}</Text>
                    </View>
                  </View>

                </View>

                <View style={styles.panel}>
                  <View style={styles.panelHeader}>
                    <Text style={styles.panelTitle}>Actions</Text>
                    <Text style={styles.panelTitleRight}>{stateCopy[data!.state].title}</Text>
                  </View>

                  <View style={{ gap: 10 }}>
                    <Pressable
                      style={[styles.btn, styles.btnPrimary, (!canStart || !!action) && styles.btnDisabled]}
                      disabled={!canStart || !!action}
                      onPress={() =>
                        doAction('start', () =>
                          requestApi(`/forms/my-missions/${id}/start`, { method: 'POST' }),
                        )
                      }
                    >
                      <Text style={[styles.btnText, styles.btnTextPrimary]}>
                        {action === 'start' ? 'Starting...' : 'Start Mission'}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[styles.btn, styles.btnSecondary, (!canMarkInProgress || !!action) && styles.btnDisabled]}
                      disabled={!canMarkInProgress || !!action}
                      onPress={() =>
                        doAction('progress', () =>
                          requestApi(`/forms/my-missions/${id}/task-status`, {
                            method: 'PATCH',
                            body: JSON.stringify({ status: 'in_progress' }),
                          }),
                        )
                      }
                    >
                      <Text style={[styles.btnText, styles.btnTextSecondary]}>Mark In Progress</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.btn, styles.btnSuccess, (!canCompleteTask || !!action) && styles.btnDisabled]}
                      disabled={!canCompleteTask || !!action}
                      onPress={() =>
                        doAction('complete', () =>
                          requestApi(`/forms/my-missions/${id}/task-status`, {
                            method: 'PATCH',
                            body: JSON.stringify({ status: 'completed' }),
                          }),
                        )
                      }
                    >
                      <Text style={[styles.btnText, styles.btnTextPrimary]}>
                        {action === 'complete' ? 'Updating...' : 'Mark Task Completed'}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[styles.btn, styles.btnWarning, (!canRequestClockOut || !!action) && styles.btnDisabled]}
                      disabled={!canRequestClockOut || !!action}
                      onPress={() =>
                        doAction('clockout', () =>
                          requestApi(`/forms/my-missions/${id}/clock-out`, { method: 'POST' }),
                        )
                      }
                    >
                      <Text style={[styles.btnText, styles.btnTextWarning]}>
                        {action === 'clockout' ? 'Sending...' : 'Request Clock-Out'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{meta.title}</Text>
                <Text style={{ marginTop: 5, color: '#64748b' }}>{meta.message}</Text>
              </View>
            )}

            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Reliability Metrics</Text>
                <Text style={styles.panelTitleRight}>{reliability?.label ?? 'Developing'}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 }}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreText}>{reliability?.score ?? 50}</Text>
                  <Text style={styles.scoreSub}>/100</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 13, color: '#64748b', lineHeight: 20 }}>
                  Based on completed tasks, approved hours, flagged clock-outs, and no-shows.
                </Text>
              </View>

              <View style={{ gap: 8 }}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricRowLabel}>Completed tasks</Text>
                  <Text style={styles.metricRowValue}>{reliability?.metrics.completedTasks ?? 0}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricRowLabel}>Approved shifts</Text>
                  <Text style={styles.metricRowValue}>{reliability?.metrics.approvedShifts ?? 0}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricRowLabel}>Approved hours</Text>
                  <Text style={styles.metricRowValue}>{reliability?.metrics.approvedHours ?? 0}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.panel, { marginBottom: 30 }]}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Post-Shift Summary</Text>
                <Text style={styles.panelTitleRight}>{data?.postShiftSummary ? 'Available' : 'Pending'}</Text>
              </View>
              {data?.postShiftSummary ? (
                <View style={{ gap: 8 }}>
                  <Text style={{ color: '#64748b', marginBottom: 5 }}>Your shift has been approved.</Text>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricRowLabel}>Total Hours</Text>
                    <Text style={styles.metricRowValue}>{data.postShiftSummary.totalHours}</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricRowLabel}>Approved At</Text>
                    <Text style={styles.metricRowValue}>{formatDateTime(data.postShiftSummary.approvedAt)}</Text>
                  </View>
                </View>
              ) : (
                <Text style={{ color: '#64748b' }}>
                  Your post-shift summary appears after your clock-out request is approved.
                </Text>
              )}
            </View>
          </>
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
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },

  pageHeader: { gap: 8 },
  kicker: { fontSize: 11, fontWeight: '800', color: '#2965a2', textTransform: 'uppercase' },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  profileChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    alignSelf: 'flex-start',
  },
  profileName: { fontSize: 14, fontWeight: '800', color: '#111827' },
  profileScore: { fontSize: 12, color: '#64748b', fontWeight: '600' },

  backBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  backBtnText: { fontSize: 13, fontWeight: '700', color: '#1a4f7a' },

  errorBanner: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 12 },
  errorBannerText: { color: '#b91c1c', fontSize: 13, fontWeight: '700' },

  loadingCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },

  statusHero: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 6,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  statusTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  statusDesc: { fontSize: 13, color: '#64748b', lineHeight: 20 },

  stepperContainer: { flexDirection: 'row', paddingVertical: 5 },
  stepItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepDone: { borderColor: '#bfdbfe' },
  stepActive: { borderColor: '#2965a2', backgroundColor: '#f8fafc' },
  stepNumBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumBoxDone: { backgroundColor: '#dbeafe' },
  stepNum: { fontSize: 11, fontWeight: '800', color: '#64748b' },
  stepNumDone: { color: '#1e40af' },
  stepText: { fontSize: 12, fontWeight: '700', color: '#64748b' },

  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  metricLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  metricValue: { fontSize: 14, fontWeight: '800', color: '#111827' },

  panel: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, padding: 16 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  panelTitle: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
  panelTitleRight: { fontSize: 14, fontWeight: '700', color: '#111827' },

  taskBox: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginBottom: 12 },
  taskBoxLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  taskBoxValue: { fontSize: 13, fontWeight: '700', color: '#111827', lineHeight: 20 },

  detailRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  detailCard: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f7', borderRadius: 12, padding: 12 },
  detailLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  detailValue: { fontSize: 13, fontWeight: '700', color: '#111827' },

  capacityCard: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 12, padding: 12 },
  capacityLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  capacityValue: { fontSize: 14, fontWeight: '700', color: '#166534' },
  capacityTrack: { height: 8, backgroundColor: '#dcfce7', borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  capacityFill: { height: '100%', backgroundColor: '#16a34a', borderRadius: 4 },

  btn: { padding: 14, borderRadius: 10, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnPrimary: { backgroundColor: '#1a4f7a' },
  btnSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#bfdbfe' },
  btnSuccess: { backgroundColor: '#16a34a' },
  btnWarning: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa' },

  btnText: { fontSize: 14, fontWeight: '800' },
  btnTextPrimary: { color: '#fff' },
  btnTextSecondary: { color: '#1a4f7a' },
  btnTextWarning: { color: '#c2410c' },

  secondaryBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#bfdbfe', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  secondaryBtnText: { color: '#1a4f7a', fontSize: 12, fontWeight: '700' },

  scoreCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eff6ff', borderWidth: 6, borderColor: '#bfdbfe', alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontSize: 24, fontWeight: '800', color: '#1e40af' },
  scoreSub: { fontSize: 11, fontWeight: '800', color: '#1e40af' },

  metricRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10 },
  metricRowLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  metricRowValue: { fontSize: 13, color: '#111827', fontWeight: '800' },
});
