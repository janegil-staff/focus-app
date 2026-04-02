import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useLogs } from '../../context/LogsContext';
import { useTheme } from '../../context/ThemeContext';
import { FontSize, Spacing, Radius } from '../../theme';

const { width } = Dimensions.get('window');

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

const SCORE_COLORS = ['#EF4444', '#FB923C', '#FBBF24', '#60A5FA', '#22C55E'];

export default function HomeScreen({ navigation }) {
  const { user }   = useAuth();
  const insets     = useSafeAreaInsets();
  const { theme }  = useTheme();
  const { logs, summary, loading, fetchLogs, fetchSummary, getLogForDate } = useLogs();

  const today    = getToday();
  const todayLog = getLogForDate(today);
  const avgs     = summary?.averages ?? {};
  const count    = summary?.count ?? 0;
  const medAdh   = summary?.medicationAdherence ?? 0;

  useEffect(() => {
    fetchLogs();
    fetchSummary(30);
  }, []);

  const s = makeStyles(theme, insets);

  const menuItems = [
    { label: 'MY DATA',       icon: '📊', screen: 'LogHistory' },
    { label: 'MY DIARY',      icon: '📅', screen: 'LogHistory' },
    { label: 'SHARE DATA',    icon: '📤', screen: 'Profile' },
    { label: 'MY MEDICATION', icon: '💊', screen: 'Medications' },
  ];

  const statRows = [
    { label: 'Days logged',   value: count,                       color: '#1A56DB' },
    { label: 'Avg mood',      value: (avgs.mood    ?? 0).toFixed(1), color: '#22C55E' },
    { label: 'Avg focus',     value: (avgs.focus   ?? 0).toFixed(1), color: '#60A5FA' },
    { label: 'Avg sleep',     value: (avgs.sleep   ?? 0).toFixed(1), color: '#FBBF24' },
    { label: 'Medication',    value: `${medAdh}%`,                color: '#FB923C' },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={s.topBtn}>
          <Text style={s.topIcon}>⚙️</Text>
        </TouchableOpacity>
        <View style={s.topCenter}>
          <Text style={s.appName}>FocusApp</Text>
          <View style={s.tagRow}>
            <Text style={s.tagText}>KBB Medic</Text>
          </View>
        </View>
        <TouchableOpacity
          style={s.topBtn}
          onPress={() => navigation.navigate('LogEntry', { date: today, log: todayLog })}
        >
          <Text style={s.topIcon}>📋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Stats — last 30 days */}
        <Text style={s.sectionTitle}>Last 30 days</Text>
        <View style={s.statsCard}>
          {statRows.map((row) => (
            <View key={row.label} style={s.statRow}>
              <View style={[s.statDot, { backgroundColor: row.color }]} />
              <Text style={s.statLabel}>{row.label}</Text>
              <Text style={[s.statValue, { color: row.color }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* 2x2 menu grid */}
        <View style={s.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={s.gridCard}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <Text style={s.gridIcon}>{item.icon}</Text>
              <Text style={s.gridLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom DAILY LOG button */}
      <View style={s.bottomWrap}>
        <TouchableOpacity
          style={s.dailyLogBtn}
          onPress={() => navigation.navigate('LogEntry', { date: today, log: todayLog })}
          activeOpacity={0.88}
        >
          <Text style={s.dailyLogText}>
            {todayLog ? '✏️  EDIT TODAY\'S LOG' : 'DAILY LOG'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (t, insets = { top: 44 }) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: t.bg },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A56DB',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: insets.top + Spacing.md,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topBtn:    { width: 40, alignItems: 'center' },
  topIcon:   { fontSize: 22 },
  topCenter: { alignItems: 'center' },
  appName:   { color: '#FFFFFF', fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 0.5 },
  tagRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  tagText:   { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, letterSpacing: 1 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },

  sectionTitle: {
    color: t.text,
    fontSize: FontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  // Stats card
  statsCard: {
    backgroundColor: t.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: t.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  statDot: {
    width: 32, height: 32,
    borderRadius: 16,
    marginRight: Spacing.md,
  },
  statLabel: { flex: 1, color: t.text, fontSize: FontSize.md },
  statValue: { fontSize: FontSize.lg, fontWeight: '700' },

  // 2x2 grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  gridCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: t.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: t.border,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  gridIcon:  { fontSize: 36, marginBottom: Spacing.md },
  gridLabel: {
    color: '#1A56DB',
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },

  // Bottom button
  bottomWrap: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: t.bg,
    borderTopWidth: 1,
    borderTopColor: t.border,
  },
  dailyLogBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#1A56DB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A56DB',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  dailyLogText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: 2,
  },
});