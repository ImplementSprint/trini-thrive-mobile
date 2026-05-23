import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator,
  Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/src/providers/auth-provider';
import { API_BASE } from '@/src/lib/api';

type WorkflowState =
  | 'loading'
  | 'no_deployment'
  | 'pending_checkin'
  | 'on_shift'
  | 'clocked_out'
  | 'summary_pending'
  | 'completed';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

interface ShiftInfo {
  id: string;
  clock_in: string;
  total_hours?: number;
}

export function DeploymentPortalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ applicationId?: string; campaignId?: string }>();
  const { token } = useAuth();

  const [workflowState, setWorkflowState] = useState<WorkflowState>('loading');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeShift, setActiveShift] = useState<ShiftInfo | null>(null);
  const [deployment, setDeployment] = useState<any>(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  const applicationId = params.applicationId;
  const campaignId = params.campaignId;

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const animateTransition = (nextState: WorkflowState) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setWorkflowState(nextState);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  // ── Load deployment info on mount ──────────────────────────────────────────
  const loadDeploymentInfo = useCallback(async () => {
    if (!applicationId || !token) return;
    try {
      const res = await fetch(`${API_BASE}/deployment/my-info/${applicationId}`, { headers: authHeaders });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load');

      const { deployment: dep, tasks: fetchedTasks, activeShift: shift } = json.data;

      setDeployment(dep);
      setTasks(fetchedTasks.map((t: any) => ({
        id: t.id,
        title: t.task_title,
        status: t.status as Task['status'],
        notes: t.notes,
      })));

      // 1. No deployment assigned yet
      if (!dep) {
        animateTransition('no_deployment');
        return;
      }

      // 2. Deployment is already completed or withdrawn — lock the portal
      if (dep.status === 'completed' || dep.status === 'withdrawn') {
        animateTransition('completed');
        return;
      }

      // 3. Active shift exists — volunteer is currently on shift
      if (shift) {
        setActiveShift(shift);
        setClockInTime(shift.clock_in);
        animateTransition('on_shift');
        return;
      }

      // 4. Deployment assigned but not yet checked in
      animateTransition('pending_checkin');
    } catch (e: any) {
      Alert.alert('Error', e.message);
      animateTransition('no_deployment');
    }
  }, [applicationId, token]);

  useEffect(() => { loadDeploymentInfo(); }, [loadDeploymentInfo]);

  // ── Check In ───────────────────────────────────────────────────────────────
  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/deployment/check-in`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ applicationId, campaignId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Check-in failed');
      setActiveShift(json.data);
      setClockInTime(json.data.clock_in);
      Alert.alert('Checked In! ✅', 'Your shift has started. Your task assignments are now available.');
      animateTransition('on_shift');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Update Task Status ─────────────────────────────────────────────────────
  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      const res = await fetch(`${API_BASE}/deployment/task/${taskId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Update failed');
    } catch (e: any) {
      // Revert on failure
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'pending' } : t));
      Alert.alert('Update Failed', e.message);
    }
  };

  // ── Clock Out ──────────────────────────────────────────────────────────────
  const handleClockOut = () => {
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    if (incompleteTasks.length > 0) {
      Alert.alert(
        'Incomplete Tasks',
        `You still have ${incompleteTasks.length} task(s) not yet completed. Clock out anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clock Out Anyway', style: 'destructive', onPress: performClockOut },
        ],
      );
    } else {
      performClockOut();
    }
  };

  const performClockOut = async () => {
    if (!activeShift) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/deployment/clock-out`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ shiftId: activeShift.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Clock-out failed');
      animateTransition('clocked_out');
      // After 2s transition to summary
      setTimeout(() => {
        Alert.alert('Shift Acknowledged ✅', 'Your clock-out has been recorded. Please post your shift summary.');
        animateTransition('summary_pending');
      }, 2000);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Post Summary ───────────────────────────────────────────────────────────
  const handlePostSummary = async () => {
    if (!summary.trim()) {
      Alert.alert('Required', 'Please provide a brief shift summary before completing.');
      return;
    }
    if (!activeShift) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/deployment/summary`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ shiftId: activeShift.id, summary }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Summary post failed');
      animateTransition('completed');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return '#64748B';
      case 'in_progress': return '#F59E0B';
      case 'completed': return '#10B981';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
    }
  };

  const formatClockIn = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // ── Render Sections ────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.headerTitle}>Deployment Portal</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderProgressIndicator = () => {
    const steps = ['pending_checkin', 'on_shift', 'summary_pending', 'completed'];
    const currentIdx = workflowState === 'clocked_out' ? 2 : steps.indexOf(workflowState);
    return (
      <View style={styles.progressContainer}>
        {steps.map((step, idx) => (
          <React.Fragment key={step}>
            <View style={[styles.progressDot, idx <= currentIdx && styles.progressDotActive]} />
            {idx < steps.length - 1 && (
              <View style={[styles.progressLine, idx < currentIdx && styles.progressLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  if (workflowState === 'loading') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        {renderHeader()}
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 80 }} />
        <Text style={styles.heroSub}>Loading your deployment...</Text>
      </View>
    );
  }

  if (workflowState === 'no_deployment') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {renderHeader()}
        <View style={styles.centeredContent}>
          <View style={styles.heroIconBox}><Text style={styles.heroIcon}>📋</Text></View>
          <Text style={styles.heroTitle}>No Deployment Yet</Text>
          <Text style={styles.heroSub}>
            You haven't been assigned to a deployment by the site manager. Check back after your application is fully processed.
          </Text>
          <Pressable style={[styles.primaryButton, { marginTop: 30 }]} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {renderHeader()}
      {renderProgressIndicator()}

      <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
        {/* PENDING CHECK-IN */}
        {workflowState === 'pending_checkin' && (
          <View style={styles.centeredContent}>
            <View style={styles.heroIconBox}><Text style={styles.heroIcon}>📍</Text></View>
            <Text style={styles.heroTitle}>Ready for your shift?</Text>
            <Text style={styles.heroSub}>Check in via the portal to view your assigned tasks and start your deployment.</Text>
            {deployment?.task_description && (
              <View style={styles.infoCard}>
                <Text style={styles.infoCardLabel}>DEPLOYMENT NOTES</Text>
                <Text style={styles.infoCardText}>{deployment.task_description}</Text>
              </View>
            )}
            <Pressable style={styles.primaryButton} onPress={handleCheckIn} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Check In Now</Text>}
            </Pressable>
          </View>
        )}

        {/* ON SHIFT */}
        {workflowState === 'on_shift' && (
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.shiftBadge}>
              <Text style={styles.shiftBadgeIcon}>🟢</Text>
              <Text style={styles.shiftBadgeText}>On Shift</Text>
              {clockInTime && <Text style={styles.shiftBadgeTime}>Since {formatClockIn(clockInTime)}</Text>}
            </View>

            <Text style={styles.sectionTitle}>Task Assignments</Text>
            <Text style={styles.sectionSub}>Update each task as you progress through your shift.</Text>

            {tasks.length === 0 ? (
              <View style={styles.emptyTasks}>
                <Text style={styles.emptyTasksText}>No tasks have been assigned yet by your site manager.</Text>
              </View>
            ) : (
              <View style={styles.tasksContainer}>
                {tasks.map((task) => (
                  <View key={task.id} style={styles.taskCard}>
                    <View style={styles.taskHeader}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '1A' }]}>
                        <Text style={[styles.statusBadgeText, { color: getStatusColor(task.status) }]}>
                          {getStatusLabel(task.status)}
                        </Text>
                      </View>
                    </View>
                    {task.notes && <Text style={styles.taskNotes}>{task.notes}</Text>}
                    <View style={styles.taskActions}>
                      {(['pending', 'in_progress', 'completed'] as Task['status'][]).map((s) => (
                        <Pressable
                          key={s}
                          style={[styles.taskBtn, task.status === s && styles.taskBtnActive]}
                          onPress={() => handleUpdateTaskStatus(task.id, s)}>
                          <Text style={[styles.taskBtnText, task.status === s && styles.taskBtnTextActive]}>
                            {getStatusLabel(s)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.clockOutContainer}>
              <Text style={styles.clockOutText}>Done with your tasks?</Text>
              <Pressable style={styles.dangerButton} onPress={handleClockOut} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.dangerButtonText}>Signal End of Shift – Clock Out</Text>}
              </Pressable>
            </View>
          </ScrollView>
        )}

        {/* CLOCKED OUT */}
        {workflowState === 'clocked_out' && (
          <View style={styles.centeredContent}>
            <View style={styles.heroIconBox}><ActivityIndicator size="large" color="#1E3A8A" /></View>
            <Text style={styles.heroTitle}>Clocked Out</Text>
            <Text style={styles.heroSub}>Receiving final acknowledgement from your supervisor...</Text>
          </View>
        )}

        {/* SUMMARY PENDING */}
        {workflowState === 'summary_pending' && (
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.heroIconBoxSuccess, { alignSelf: 'center' }]}><Text style={styles.heroIcon}>✅</Text></View>
            <Text style={[styles.heroTitle, { textAlign: 'center' }]}>Shift Acknowledged!</Text>
            <Text style={[styles.heroSub, { textAlign: 'center', marginBottom: 24 }]}>
              Post a shift summary to officially wrap up your deployment.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Shift Summary *</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={6}
                placeholder="Describe what you did, issues you encountered, and any observations..."
                placeholderTextColor="#9CA3AF"
                value={summary}
                onChangeText={setSummary}
                textAlignVertical="top"
              />
            </View>
            <Pressable style={styles.primaryButton} onPress={handlePostSummary} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Post Shift Summary</Text>}
            </Pressable>
          </ScrollView>
        )}

        {/* COMPLETED */}
        {workflowState === 'completed' && (
          <View style={styles.centeredContent}>
            <View style={styles.heroIconBoxSuccess}><Text style={styles.heroIcon}>🎉</Text></View>
            <Text style={styles.heroTitle}>Deployment Complete!</Text>
            <Text style={styles.heroSub}>
              Thank you for your invaluable contribution to BayaniHub! Your shift summary has been recorded.
            </Text>
            <Pressable style={[styles.primaryButton, { marginTop: 30 }]} onPress={() => router.push('/dashboard' as any)}>
              <Text style={styles.primaryButtonText}>Return to Dashboard</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const NAVY = '#1E3A8A';
const BLUE = '#3B82F6';
const GRAY_BG = '#F8FAFC';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GRAY_BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 24, color: '#0F172A', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: NAVY },
  placeholder: { width: 40 },

  progressContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, paddingHorizontal: 40, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 10,
  },
  progressDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#CBD5E1' },
  progressDotActive: { backgroundColor: BLUE, transform: [{ scale: 1.2 }] },
  progressLine: { flex: 1, height: 2, backgroundColor: '#CBD5E1', marginHorizontal: 4 },
  progressLineActive: { backgroundColor: BLUE },

  contentWrapper: { flex: 1 },
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scrollContent: { flex: 1, padding: 20 },

  heroIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  heroIconBoxSuccess: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  heroIcon: { fontSize: 36 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  heroSub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10, marginTop: 4 },

  infoCard: {
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, marginTop: 24, width: '100%',
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  infoCardLabel: { fontSize: 10, fontWeight: '700', color: BLUE, letterSpacing: 1, marginBottom: 6 },
  infoCardText: { fontSize: 14, color: '#1E293B', lineHeight: 20 },

  shiftBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 20, alignSelf: 'flex-start',
    gap: 8,
  },
  shiftBadgeIcon: { fontSize: 12 },
  shiftBadgeText: { fontSize: 13, fontWeight: '700', color: '#15803D' },
  shiftBadgeTime: { fontSize: 12, color: '#166534', marginLeft: 4 },

  primaryButton: {
    backgroundColor: NAVY, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 32, width: '100%',
    shadowColor: BLUE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  dangerButton: {
    backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', width: '100%',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  dangerButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: '#64748B', marginBottom: 20 },

  emptyTasks: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyTasksText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },

  tasksContainer: { gap: 16 },
  taskCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  taskTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1E293B', marginRight: 12, lineHeight: 22 },
  taskNotes: { fontSize: 13, color: '#64748B', marginBottom: 12, lineHeight: 18 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  taskActions: { flexDirection: 'row', gap: 8 },
  taskBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 8,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
  },
  taskBtnActive: { backgroundColor: '#EFF6FF', borderColor: BLUE },
  taskBtnText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  taskBtnTextActive: { color: BLUE, fontWeight: '700' },

  clockOutContainer: { marginTop: 36, marginBottom: 40, alignItems: 'center' },
  clockOutText: { fontSize: 14, color: '#64748B', marginBottom: 12, fontWeight: '500' },

  inputContainer: { marginBottom: 24, width: '100%' },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
  textInput: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0',
    padding: 16, fontSize: 15, color: '#1E293B', minHeight: 130,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
});
