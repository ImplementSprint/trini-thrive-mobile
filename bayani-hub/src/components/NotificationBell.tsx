import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView, Modal, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { useAuth } from '@/src/providers/auth-provider';
import { API_BASE } from '@/src/lib/api';

export default function NotificationBell() {
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data || [];
        setNotifications(list);
        setUnreadCount(list.filter((n: any) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to fetch user notifications (mobile):', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // 10-second polling
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read (mobile):', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0 || !token) return;

    setLoading(true);
    try {
      await Promise.all(
        unread.map((n) =>
          fetch(`${API_BASE}/notifications/${n.id}/read`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read (mobile):', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to clear notifications (mobile):', err);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('volunteer')) {
      return { emoji: '🤝', bg: '#EEF2FF', color: '#4F46E5' };
    }
    if (type.includes('donation')) {
      return { emoji: '🎁', bg: '#ECFDF5', color: '#059669' };
    }
    if (type.includes('shift')) {
      return { emoji: '⏱️', bg: '#FFFBEB', color: '#D97706' };
    }
    return { emoji: '🔔', bg: '#F1F5F9', color: '#64748B' };
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          fetchNotifications();
          setShowModal(true);
        }}
        style={({ pressed }) => [
          styles.iconButton,
          pressed && { opacity: 0.6 }
        ]}
      >
        <Image source={require('../../assets/icon-bell.png')} style={styles.navIcon} resizeMode="contain" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerTitle}>Notifications</Text>
                  <Text style={styles.headerSubtitle}>Stay updated with your actions</Text>
                </View>
                <View style={styles.headerActions}>
                  {unreadCount > 0 && (
                    <Pressable 
                      onPress={handleMarkAllAsRead}
                      disabled={loading}
                      style={({ pressed }) => [
                        styles.markAllBtn,
                        pressed && { opacity: 0.7 }
                      ]}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#4273B8" />
                      ) : (
                        <Text style={styles.markAllText}>Mark all read</Text>
                      )}
                    </Pressable>
                  )}
                  {notifications.length > 0 && (
                    <Pressable 
                      onPress={handleClearAll}
                      disabled={loading}
                      style={({ pressed }) => [
                        styles.clearAllBtn,
                        pressed && { opacity: 0.7 }
                      ]}
                    >
                      <Text style={styles.clearAllText}>Clear all</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              <ScrollView 
                style={styles.list} 
                contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : styles.listContent}
                showsVerticalScrollIndicator={true}
              >
                {notifications.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🔔</Text>
                    <Text style={styles.emptyTitle}>No notifications yet</Text>
                    <Text style={styles.emptyText}>We'll notify you here when your applications, shifts, or pledges get reviewed.</Text>
                  </View>
                ) : (
                  notifications.map((notif) => {
                    const iconData = getNotificationIcon(notif.type);
                    return (
                      <Pressable
                        key={notif.id}
                        onPress={() => !notif.is_read && handleMarkAsRead(notif.id)}
                        style={({ pressed }) => [
                          styles.item,
                          !notif.is_read && styles.unreadItem,
                          pressed && { backgroundColor: '#F3F4F6' }
                        ]}
                      >
                        <View style={[styles.iconIndicator, { backgroundColor: iconData.bg }]}>
                          <Text style={[styles.iconEmoji, { color: iconData.color }]}>{iconData.emoji}</Text>
                        </View>
                        <View style={styles.contentWrap}>
                          <View style={styles.itemHeader}>
                            <Text style={styles.title}>{notif.title}</Text>
                            {!notif.is_read && <View style={styles.dotIndicator} />}
                          </View>
                          <Text style={styles.message}>{notif.message}</Text>
                          <Text style={styles.time}>{formatTime(notif.created_at)}</Text>
                        </View>
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>

              <Pressable
                onPress={() => setShowModal(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && { backgroundColor: '#315B96' }
                ]}
              >
                <Text style={styles.closeButtonText}>Dismiss</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  navIcon: {
    width: 24,
    height: 24,
    opacity: 0.7,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    height: 16,
    minWidth: 16,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalContent: {
    height: Dimensions.get('window').height * 0.75,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4273B8',
  },
  clearAllBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 8,
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  unreadItem: {
    backgroundColor: '#F8FAFC',
  },
  iconIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconEmoji: {
    fontSize: 16,
  },
  contentWrap: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4273B8',
  },
  message: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 10,
    color: '#94A3B8',
  },
  closeButton: {
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 24,
    backgroundColor: '#4273B8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
