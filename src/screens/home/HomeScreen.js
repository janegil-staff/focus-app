import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useLogs } from '../../context/LogsContext';
import { Card, ScoreBadge, MenuButton } from '../../components';
import { Colors, Spacing, FontSize, Radius } from '../../theme';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { logs, summary, loading, fetchLogs, fetchSummary, getLogForDate } = useLogs();

  const today    = getToday();
  const todayLog = getLogForDate(today);
  const avgs     = summary?.averages ?? {};
  const medAdh   = summary?.medicationAdherence ?? 0;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    fetchLogs();
    fetchSummary(7);
  }, []);

  const menuItems = [
    { icon: '📅', label: 'History',  onPress: () => navigation.navigate('LogHistory') },
    { icon: '📊', label: 'Charts',   onPress: () => navigation.navigate('LogHistory') },
    { icon: '👤', label: 'Profile',  onPress: () => navigation.navigate('Profile') },
    { icon: '💊', label: 'Meds',     onPress: () => navigation.navigate('Medications') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{firstName}</Text>
        </View>
        <Text style={styles.date}>{formatDate()}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => { fetchLogs(); fetchSummary(7); }}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Today card */}
        <Card style={[styles.todayCard, todayLog && styles.todayCardLogged]}>
          {todayLog ? (
            <View>
              <View style={styles.todayRow}>
                {[
                  ['Mood',    todayLog.mood],
                  ['Focus',   todayLog.focus],
                  ['Sleep',   todayLog.sleep],
                  ['Energy',  todayLog.energy],
                ].map(([label, score]) => (
                  <View key={label} style={styles.scoreCol}>
                    <Text style={styles.scoreValue(score)}>{score}</Text>
                    <Text style={styles.scoreLabel}>{label}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('LogEntry', { date: today, log: todayLog })}
              >
                <Text style={styles.editBtnText}>✏️  Edit today's log</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.notLoggedRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notLoggedTitle}>Today's log</Text>
                <Text style={styles.notLoggedSub}>Tap + to log your day</Text>
              </View>
              <View style={styles.notLoggedBadge}>
                <Text style={styles.notLoggedBadgeText}>Not logged</Text>
              </View>
            </View>
          )}
        </Card>

        {/* 7-day averages */}
        {Object.keys(avgs).length > 0 && (
          <Card style={styles.avgCard}>
            <Text style={styles.avgTitle}>7-DAY AVERAGE</Text>
            <View style={styles.avgRow}>
              {[
                ['Mood',   avgs.mood],
                ['Focus',  avgs.focus],
                ['Sleep',  avgs.sleep],
                ['Energy', avgs.energy],
                ['Meds',   null, medAdh],
              ].map(([label, val, pct]) => {
                const v = pct != null ? pct / 20 : (val ?? 0);
                const color = v >= 4 ? Colors.scoreHigh : v >= 3 ? Colors.scoreMid : Colors.scoreLow;
                return (
                  <View key={label} style={styles.avgCol}>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { height: `${(v / 5) * 100}%`, backgroundColor: color + 'B3' }]} />
                      <Text style={[styles.barValue, { color }]}>
                        {pct != null ? `${pct}%` : v.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.barLabel}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        {/* Recent logs */}
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>RECENT</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LogHistory')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {logs.slice(0, 7).map((log) => (
          <TouchableOpacity
            key={log.date}
            style={styles.logRow}
            onPress={() => navigation.navigate('LogEntry', { date: log.date, log })}
          >
            <Text style={styles.logDate}>{log.date}</Text>
            <View style={styles.logBadges}>
              <ScoreBadge score={log.mood}   size={28} />
              <ScoreBadge score={log.focus}  size={28} />
              <ScoreBadge score={log.sleep}  size={28} />
              <ScoreBadge score={log.energy} size={28} />
            </View>
            {log.medicationTaken && <Text style={styles.medIcon}>💊</Text>}
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom menu */}
      <View style={styles.bottomMenu}>
        <View style={styles.menuRow}>
          {menuItems.map((m) => (
            <MenuButton key={m.label} icon={m.icon} label={m.label} onPress={m.onPress} />
          ))}
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('LogEntry', { date: today, log: todayLog })}
      >
        <Text style={styles.fabIcon}>{todayLog ? '✏️' : '+'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const scoreColor = (s) => s >= 4 ? Colors.scoreHigh : s === 3 ? Colors.scoreMid : Colors.scoreLow;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: { color: Colors.textMuted, fontSize: FontSize.sm },
  name: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '300' },
  date: { color: Colors.textMuted, fontSize: FontSize.sm },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg },

  todayCard: { marginBottom: Spacing.md },
  todayCardLogged: { backgroundColor: Colors.accentBg, borderColor: Colors.accentBorder },
  todayRow: { flexDirection: 'row', justifyContent: 'space-around' },
  scoreCol: { alignItems: 'center' },
  scoreValue: (s) => ({ fontSize: FontSize.xl, fontWeight: '700', color: scoreColor(s) }),
  scoreLabel: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  editBtn: {
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    borderRadius: Radius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  editBtnText: { color: Colors.accent, fontSize: FontSize.sm, fontWeight: '600' },
  notLoggedRow: { flexDirection: 'row', alignItems: 'center' },
  notLoggedTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '500' },
  notLoggedSub: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 2 },
  notLoggedBadge: {
    backgroundColor: Colors.accent + '26',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  notLoggedBadgeText: { color: Colors.accent, fontSize: FontSize.xs, fontWeight: '600' },

  avgCard: { marginBottom: Spacing.md },
  avgTitle: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1.2, marginBottom: Spacing.md },
  avgRow: { flexDirection: 'row', gap: 6 },
  avgCol: { flex: 1, alignItems: 'center' },
  barBg: {
    width: '100%', height: 56,
    backgroundColor: Colors.surfaceDim,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barFill: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderRadius: 4,
  },
  barValue: { fontSize: FontSize.xs, fontWeight: '700', zIndex: 1 },
  barLabel: { color: Colors.textMuted, fontSize: 10, marginTop: 4 },

  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  recentTitle: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1.2 },
  seeAll: { color: Colors.accent, fontSize: FontSize.sm },

  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  logDate: { color: Colors.textMuted, fontSize: FontSize.sm, fontFamily: 'monospace', width: 90 },
  logBadges: { flexDirection: 'row', gap: 4, flex: 1 },
  medIcon: { fontSize: 14 },

  bottomMenu: {
    backgroundColor: Colors.bg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  menuRow: { flexDirection: 'row', justifyContent: 'space-evenly' },

  fab: {
    position: 'absolute',
    bottom: 72,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: Colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabIcon: { color: Colors.white, fontSize: 28, fontWeight: '300' },
});
