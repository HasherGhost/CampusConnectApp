import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { getHodStaffAttendance, HodStaffAttendanceData, StaffMemberDetail } from '@/services/hodService';

export default function StaffTab() {
  const { session, apiBaseUrl } = useAuth();
  const [data, setData] = useState<HodStaffAttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedErpId, setExpandedErpId] = useState<string | null>(null);

  const fetchAttendance = useCallback(
    async (isRefresh = false) => {
      if (!session?.token) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await getHodStaffAttendance(apiBaseUrl, session.token);
        setData(res);
      } catch (error) {
        console.error('[StaffTab] fetch error:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [apiBaseUrl, session?.token]
  );

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const formatTime = (rawTime?: string | null) => {
    if (!rawTime) return '--:--';

    const d = new Date(rawTime);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    const timeMatch = rawTime.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }

    return rawTime;
  };

  const staffMembers = data?.staffMembers ?? [];
  const filteredStaff = staffMembers
    .filter((staff) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        staff.name.toLowerCase().includes(q) ||
        staff.erpid.toLowerCase().includes(q) ||
        (staff.email && staff.email.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (a.status === 'Present' && b.status === 'Absent') return -1;
      if (a.status === 'Absent' && b.status === 'Present') return 1;

      if (a.status === 'Present' && b.status === 'Present') {
        if (!a.loginTime) return 1;
        if (!b.loginTime) return -1;
        const timeA = new Date(a.loginTime).getTime();
        const timeB = new Date(b.loginTime).getTime();
        if (!isNaN(timeA) && !isNaN(timeB)) {
          return timeB - timeA;
        }
        return b.loginTime.localeCompare(a.loginTime);
      }

      return a.name.localeCompare(b.name);
    });

  const toggleExpand = (erpid: string) => {
    setExpandedErpId((prev) => (prev === erpid ? null : erpid));
  };

  const totalStaff = data?.today.total ?? 0;
  const totalPresent = data?.today.present ?? 0;
  const totalAbsent = data?.today.absent ?? 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchAttendance(true)}
          tintColor="#ae2525"
        />
      }
    >
      {/* Header Summary Chips */}
      <View style={styles.summaryBar}>
        <View style={[styles.statChip, styles.statChipTotal]}>
          <Ionicons name="briefcase-outline" size={16} color="#475569" />
          <Text style={styles.statChipValue}>{loading ? '--' : totalStaff}</Text>
          <Text style={styles.statChipLabel}>Total Staff</Text>
        </View>

        <View style={[styles.statChip, styles.statChipPresent]}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#15803d" />
          <Text style={styles.statChipValue}>{loading ? '--' : totalPresent}</Text>
          <Text style={styles.statChipLabel}>Present</Text>
        </View>

        <View style={[styles.statChip, styles.statChipAbsent]}>
          <Ionicons name="close-circle-outline" size={16} color="#b91c1c" />
          <Text style={styles.statChipValue}>{loading ? '--' : totalAbsent}</Text>
          <Text style={styles.statChipLabel}>Absent</Text>
        </View>
      </View>

      {/* Search Input Box */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search faculty by name or ERP ID..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Staff Detailed Report List */}
      <View style={styles.sectionHeader}>
        <Ionicons name="people-outline" size={18} color="#0f172a" />
        <Text style={styles.sectionTitle}>Faculty In-Time & Out-Time Report</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading staff records...</Text>
      ) : filteredStaff.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="search-outline" size={32} color="#cbd5e1" />
          <Text style={styles.emptyText}>No faculty members found</Text>
        </View>
      ) : (
        filteredStaff.map((staff) => {
          const isExpanded = expandedErpId === staff.erpid;
          return (
            <View key={staff.erpid} style={styles.staffCard}>
              <TouchableOpacity
                style={styles.staffCardHeader}
                activeOpacity={0.7}
                onPress={() => toggleExpand(staff.erpid)}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {staff.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.staffMainInfo}>
                  <Text style={styles.staffName}>{staff.name}</Text>
                  <Text style={styles.staffSubInfo}>ERP: {staff.erpid}</Text>
                </View>

                <View style={styles.rightHeaderAction}>
                  <View
                    style={[
                      styles.statusBadge,
                      staff.status === 'Present' ? styles.statusBadgePresent : styles.statusBadgeAbsent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        staff.status === 'Present' ? styles.statusTextPresent : styles.statusTextAbsent,
                      ]}
                    >
                      {staff.status}
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#64748b"
                    style={{ marginLeft: 6 }}
                  />
                </View>
              </TouchableOpacity>

              {/* In Time & Out Time Row */}
              <View style={styles.timingRow}>
                <View style={styles.timingBox}>
                  <Ionicons name="log-in-outline" size={16} color="#15803d" />
                  <Text style={styles.timingLabel}>In Time:</Text>
                  <Text style={styles.timingValue}>{formatTime(staff.loginTime)}</Text>
                </View>

                <View style={styles.timingDivider} />

                <View style={styles.timingBox}>
                  <Ionicons name="log-out-outline" size={16} color="#b91c1c" />
                  <Text style={styles.timingLabel}>Out Time:</Text>
                  <Text style={styles.timingValue}>{formatTime(staff.logoutTime)}</Text>
                </View>
              </View>

              {/* Expanded 7-Day Past Attendance Report */}
              {isExpanded && (
                <View style={styles.expandedSection}>
                  <View style={styles.expandedTitleRow}>
                    <Ionicons name="time-outline" size={16} color="#ae2525" />
                    <Text style={styles.expandedTitle}>Past 7 Days Attendance Log</Text>
                  </View>

                  <View style={styles.pastLogsTable}>
                    {staff.pastLogs.map((log, idx) => (
                      <View
                        key={log.date}
                        style={[
                          styles.pastLogRow,
                          idx === staff.pastLogs.length - 1 && styles.noBorder,
                        ]}
                      >
                        <Text style={styles.logDateText}>{log.date}</Text>

                        <View style={styles.logTimesGroup}>
                          <Text style={styles.logTimeText}>
                            In: {formatTime(log.loginTime)} | Out: {formatTime(log.logoutTime)}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.miniBadge,
                            log.status === 'Present' ? styles.miniBadgePresent : styles.miniBadgeAbsent,
                          ]}
                        >
                          <Text
                            style={[
                              styles.miniBadgeText,
                              log.status === 'Present' ? styles.miniTextPresent : styles.miniTextAbsent,
                            ]}
                          >
                            {log.status}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcf8',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statChipTotal: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  statChipPresent: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
  },
  statChipAbsent: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  statChipValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  statChipLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    padding: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  loadingText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginVertical: 20,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  staffCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  staffCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ae2525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  staffMainInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  staffSubInfo: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  rightHeaderAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgePresent: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#15803d',
  },
  statusBadgeAbsent: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextPresent: {
    color: '#15803d',
  },
  statusTextAbsent: {
    color: '#b91c1c',
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffcf8',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  timingBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timingLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  timingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  timingDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 8,
  },
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  expandedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  expandedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ae2525',
  },
  pastLogsTable: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pastLogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  logDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    width: 80,
  },
  logTimesGroup: {
    flex: 1,
    paddingHorizontal: 4,
  },
  logTimeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniBadgePresent: {
    backgroundColor: 'transparent',
  },
  miniBadgeAbsent: {
    backgroundColor: '#fee2e2',
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  miniTextPresent: {
    color: '#15803d',
  },
  miniTextAbsent: {
    color: '#b91c1c',
  },
});
