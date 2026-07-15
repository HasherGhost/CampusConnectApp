import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

type DonutChartProps = {
  percentage: number;
  color: string;
  radius?: number;
  strokeWidth?: number;
};

// Pie chart
const DonutChart = ({ percentage, color, radius = 60, strokeWidth = 15 }: DonutChartProps) => {
  const halfCircle = radius + strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View style={styles.chartContainer}>
      <Svg width={halfCircle * 2} height={halfCircle * 2} viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}>
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          {/* Background Circle position*/}
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle User interfacee*/}
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.chartCenter]}>
        <Text style={styles.chartText}>{percentage}%</Text>
      </View>
    </View>
  );
};

export default function StaffTab() {
  // Mock data for staff attendancef
  const totalStaff = 50;
  const totalPresent = 38;
  const attendancePercentage = Math.round((totalPresent / totalStaff) * 100);

  const history = [
    { id: '1', date: '09 Jul 2026', present: 34, total: 50 },
    { id: '2', date: '08 Jul 2026', present: 35, total: 50 },
    { id: '3', date: '07 Jul 2026', present: 30, total: 50 },
    { id: '4', date: '06 Jul 2026', present: 38, total: 50 },
    { id: '5', date: '05 Jul 2026', present: 36, total: 50 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Today's Attendance</Text>
        <DonutChart percentage={attendancePercentage} color="#ae2525" />

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalPresent}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalStaff - totalPresent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </View>
      </View>

      {/* History List */}
      <Text style={styles.historyTitle}>Attendance History</Text>
      <View style={styles.historyCard}>
        {history.map((item, index) => (
          <View key={item.id} style={[styles.historyRow, index === history.length - 1 && styles.noBorder]}>
            <Text style={styles.historyDate}>{item.date}</Text>
            <View style={styles.historyDetails}>
              <Text style={styles.historyPresent}>{item.present} / {item.total}</Text>
              <Text style={styles.historyPercent}>{Math.round((item.present / item.total) * 100)}%</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcf8',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#fffcf8',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  historyDetails: {
    alignItems: 'flex-end',
  },
  historyPresent: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  historyPercent: {
    fontSize: 14,
    color: '#e09c15', // Matches the gold staff theme color
    fontWeight: '700',
    marginTop: 2,
  },
});
