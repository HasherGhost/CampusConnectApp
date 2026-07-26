import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import {
  getHodStudentAttendance,
  HodStudentAttendanceData,
  StudentMemberDetail,
} from '@/services/hodService';

export default function StudentsTab() {
  const { session, apiBaseUrl } = useAuth();
  const [data, setData] = useState<HodStudentAttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | 'ALL'>('ALL');
  const [expandedErpId, setExpandedErpId] = useState<string | null>(null);

  const fetchAttendance = useCallback(
    async (isRefresh = false) => {
      if (!session?.token) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await getHodStudentAttendance(apiBaseUrl, session.token);
        setData(res);
      } catch (error) {
        console.error('[StudentsTab] fetch error:', error);
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

  const divisions = data?.divisions ?? [];
  const studentsList = data?.studentsList ?? [];

  // Filter divisions to ONLY show divisions present in student records
  const activeDivIds = new Set(studentsList.map((s) => s.divisionId).filter(Boolean));
  const activeDivNames = new Set(studentsList.map((s) => s.division).filter(Boolean));
  const validDivisions = divisions.filter(
    (d) => activeDivIds.has(d.id) || activeDivNames.has(d.div_name)
  );

  const filteredStudents = studentsList.filter((st) => {
    // Division filter
    if (selectedDivisionId !== 'ALL') {
      if (st.divisionId !== selectedDivisionId) return false;
    }
    // Search filter
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      st.name.toLowerCase().includes(q) ||
      st.erpid.toLowerCase().includes(q) ||
      (st.rollNo && st.rollNo.toLowerCase().includes(q)) ||
      (st.division && st.division.toLowerCase().includes(q))
    );
  });

  const toggleExpand = (erpid: string) => {
    setExpandedErpId((prev) => (prev === erpid ? null : erpid));
  };

  const totalFiltered = filteredStudents.length;
  const presentCount = filteredStudents.filter((s) => s.todayStatus === 'Present').length;
  const absentCount = filteredStudents.filter((s) => s.todayStatus === 'Absent').length;

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
          <Ionicons name="people-outline" size={16} color="#475569" />
          <Text style={styles.statChipValue}>{loading ? '--' : totalFiltered}</Text>
          <Text style={styles.statChipLabel}>Total Students</Text>
        </View>

        <View style={[styles.statChip, styles.statChipPresent]}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#15803d" />
          <Text style={styles.statChipValue}>{loading ? '--' : presentCount}</Text>
          <Text style={styles.statChipLabel}>Present</Text>
        </View>

        <View style={[styles.statChip, styles.statChipAbsent]}>
          <Ionicons name="close-circle-outline" size={16} color="#b91c1c" />
          <Text style={styles.statChipValue}>{loading ? '--' : absentCount}</Text>
          <Text style={styles.statChipLabel}>Absent</Text>
        </View>
      </View>

      {/* Division Selector Horizontal Pills - ONLY present divisions */}
      <View style={styles.divisionSection}>
        <Text style={styles.divisionTitle}>Select Division:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          <Pressable
            style={[styles.pillBtn, selectedDivisionId === 'ALL' && styles.pillBtnActive]}
            onPress={() => setSelectedDivisionId('ALL')}
          >
            <Text style={[styles.pillText, selectedDivisionId === 'ALL' && styles.pillTextActive]}>
              All Divisions
            </Text>
          </Pressable>

          {validDivisions.map((div) => {
            const isSelected = selectedDivisionId === div.id;
            return (
              <Pressable
                key={div.id}
                style={[styles.pillBtn, isSelected && styles.pillBtnActive]}
                onPress={() => setSelectedDivisionId(div.id)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  Division {div.div_name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Input Box */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search student by name, ERP ID, or roll no..."
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

      {/* Student List Header */}
      <View style={styles.sectionHeader}>
        <Ionicons name="school-outline" size={18} color="#0f172a" />
        <Text style={styles.sectionTitle}>Student Records</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading student records...</Text>
      ) : filteredStudents.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="search-outline" size={32} color="#cbd5e1" />
          <Text style={styles.emptyText}>No student records found</Text>
        </View>
      ) : (
        filteredStudents.map((student) => {
          const isExpanded = expandedErpId === student.erpid;
          return (
            <View key={student.erpid} style={styles.studentCard}>
              <TouchableOpacity
                style={styles.studentCardHeader}
                activeOpacity={0.7}
                onPress={() => toggleExpand(student.erpid)}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {student.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.studentMainInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentSubInfo}>
                    ERP: {student.erpid} {student.division ? `| Div ${student.division}` : ''} {student.rollNo ? `| Roll: ${student.rollNo}` : ''}
                  </Text>
                </View>

                {/* Today's Status displayed directly on card header top-right */}
                <View style={styles.rightHeaderAction}>
                  <View
                    style={[
                      styles.statusChip,
                      student.todayStatus === 'Present'
                        ? styles.statusChipPresent
                        : student.todayStatus === 'Absent'
                        ? styles.statusChipAbsent
                        : styles.statusChipNA,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        student.todayStatus === 'Present'
                          ? styles.statusTextPresent
                          : student.todayStatus === 'Absent'
                          ? styles.statusTextAbsent
                          : styles.statusTextNA,
                      ]}
                    >
                      {student.todayStatus}
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

              {/* Expanded 7-Day Past Attendance Report */}
              {isExpanded && (
                <View style={styles.expandedSection}>
                  <View style={styles.expandedTitleRow}>
                    <Ionicons name="time-outline" size={16} color="#ae2525" />
                    <Text style={styles.expandedTitle}>Past 7 Days Attendance Log</Text>
                  </View>

                  <View style={styles.pastLogsTable}>
                    {student.pastLogs.map((log, idx) => (
                      <View
                        key={log.date}
                        style={[
                          styles.pastLogRow,
                          idx === student.pastLogs.length - 1 && styles.noBorder,
                        ]}
                      >
                        <Text style={styles.logDateText}>{log.date}</Text>

                        <View
                          style={[
                            styles.miniBadge,
                            log.status === 'Present'
                              ? styles.miniBadgePresent
                              : log.status === 'Absent'
                              ? styles.miniBadgeAbsent
                              : styles.miniBadgeNA,
                          ]}
                        >
                          <Text
                            style={[
                              styles.miniBadgeText,
                              log.status === 'Present'
                                ? styles.miniTextPresent
                                : log.status === 'Absent'
                                ? styles.miniTextAbsent
                                : styles.miniTextNA,
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
  divisionSection: {
    marginBottom: 14,
  },
  divisionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  pillsScroll: {
    gap: 8,
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillBtnActive: {
    backgroundColor: '#ae2525',
    borderColor: '#ae2525',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  pillTextActive: {
    color: '#ffffff',
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
  studentCard: {
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
  studentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e09c15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  studentMainInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  studentSubInfo: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  rightHeaderAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusChipPresent: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#15803d',
  },
  statusChipAbsent: {
    backgroundColor: '#fee2e2',
  },
  statusChipNA: {
    backgroundColor: '#f1f5f9',
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextPresent: {
    color: '#15803d',
  },
  statusTextAbsent: {
    color: '#b91c1c',
  },
  statusTextNA: {
    color: '#64748b',
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
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniBadgePresent: {
    backgroundColor: 'transparent',
  },
  miniBadgeAbsent: {
    backgroundColor: '#fee2e2',
  },
  miniBadgeNA: {
    backgroundColor: '#f1f5f9',
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
  miniTextNA: {
    color: '#64748b',
  },
});
