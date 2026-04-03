import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useLogs } from '../../context/LogsContext';
import { useLang } from '../../context/LangContext';
import { useTheme } from '../../context/ThemeContext';

const NAVY  = '#2d4a6e';
const BG    = '#f0f4f8';
const CARD  = '#ffffff';
const MUTED = '#8fa8c8';

// 1=worst(red) → 5=best(green), matching how scores feel in the calendar
const SCORE_COLORS = {
  1: '#EF4444',
  2: '#FB923C',
  3: '#FBBF24',
  4: '#7AABDB',
  5: '#22C55E',
};

function avgScore(log) {
  const vals = [log.mood, log.focus, log.sleep, log.energy, log.impulsivity].filter(Boolean);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function firstWeekday(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarScreen({ navigation }) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const { logs, loading, fetchLogs, getLogForDate } = useLogs();
  const { t }      = useLang();
  const { theme }  = useTheme();
  const insets     = useSafeAreaInsets();
  const PRIMARY    = theme?.accent ?? '#4a7ab5';

  useFocusEffect(useCallback(() => { fetchLogs(); }, [fetchLogs]));

  const scoreMap = {};
  logs.forEach((log) => {
    const s = avgScore(log);
    if (s) scoreMap[log.date] = s;
  });

  const goBack = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };
  const goForward = () => {
    if (year === now.getFullYear() && month === now.getMonth()) return;
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const totalDays   = daysInMonth(year, month);
  const startOffset = firstWeekday(year, month);
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const monthLogs = logs.filter((l) => {
    const [ly, lm] = l.date.split('-').map(Number);
    return ly === year && lm === month + 1;
  });
  const totalLogged = monthLogs.length;
  const avgAll = totalLogged
    ? Math.round(monthLogs.reduce((s, l) => s + (avgScore(l) ?? 0), 0) / totalLogged)
    : null;

  // score 1 = worst (red) … score 5 = best (green)
  const scoreLabels = [
    t.scoreVeryLow   ?? 'Very low',
    t.scoreLow       ?? 'Low',
    t.scoreModerate  ?? 'Moderate',
    t.scoreGood      ?? 'Good',
    t.scoreExcellent ?? 'Excellent',
  ];

  const countByScore = [5, 4, 3, 2, 1].map((s) => ({
    score: s,
    count: monthLogs.filter((l) => avgScore(l) === s).length,
    label: scoreLabels[s - 1],
    color: SCORE_COLORS[s],
  }));

  const today    = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
  const months   = t.months   ?? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const weekdays = t.weekdays ?? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>

      {/* Header — spans behind status bar */}
      <View style={[styles.header, { backgroundColor: PRIMARY, paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.calendar ?? 'Calendar'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Month navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goBack} style={styles.navBtn}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {(months[month] ?? '').toUpperCase()}{'  '}{year}
          </Text>
          <TouchableOpacity
            onPress={goForward}
            style={[styles.navBtn, isCurrentMonth && styles.navBtnDisabled]}
            disabled={isCurrentMonth}
          >
            <Text style={[styles.navArrow, isCurrentMonth && { color: '#ccc' }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View style={styles.card}>
          <View style={styles.weekdayRow}>
            {weekdays.map((d, i) => (
              <Text key={i} style={styles.weekdayLabel}>{d}</Text>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator color={PRIMARY} style={{ marginVertical: 24 }} />
          ) : (
            <View style={styles.grid}>
              {cells.map((day, i) => {
                if (!day) return <View key={`e-${i}`} style={styles.cell} />;
                const dateStr     = toDateStr(year, month, day);
                const score       = scoreMap[dateStr];
                const isToday     = dateStr === today;
                const existingLog = getLogForDate(dateStr);
                const bgColor     = score ? SCORE_COLORS[score] : undefined;

                return (
                  <TouchableOpacity
                    key={dateStr}
                    style={styles.cell}
                    onPress={() => navigation?.navigate?.('LogEntry', { date: dateStr, log: existingLog })}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.cellInner,
                      bgColor && { backgroundColor: bgColor, borderColor: bgColor },
                      isToday && !score && { borderColor: PRIMARY, borderWidth: 2 },
                    ]}>
                      <Text style={[
                        styles.cellText,
                        { color: score ? '#fff' : NAVY },
                        isToday && !score && { color: PRIMARY, fontWeight: '800' },
                      ]}>
                        {day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Legend — same colors as log entry */}
        <View style={styles.legendRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <View key={s} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: SCORE_COLORS[s] }]} />
              <Text style={styles.legendLabel}>{scoreLabels[s - 1]}</Text>
            </View>
          ))}
        </View>

        {/* Month summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.monthSummary ?? 'Month summary'}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: PRIMARY }]}>{totalLogged}</Text>
              <Text style={styles.summarySubLabel}>{t.daysLoggedShort ?? 'Days logged'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: avgAll ? SCORE_COLORS[avgAll] : MUTED }]}>
                {avgAll ? scoreLabels[avgAll - 1] : '—'}
              </Text>
              <Text style={styles.summarySubLabel}>{t.avgScore ?? 'Avg. score'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: PRIMARY }]}>{totalDays - totalLogged}</Text>
              <Text style={styles.summarySubLabel}>{t.missing ?? 'Missing'}</Text>
            </View>
          </View>
        </View>

        {/* Score breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.scoreBreakdown ?? 'Score breakdown'}</Text>
          {countByScore.map(({ score, count, label, color }) => (
            <View key={score} style={styles.breakdownRow}>
              <View style={[styles.breakdownDot, { backgroundColor: color }]} />
              <Text style={styles.breakdownLabel}>{label}</Text>
              <View style={styles.breakdownBarBg}>
                <View style={[
                  styles.breakdownBar,
                  {
                    backgroundColor: color,
                    width: totalLogged ? `${Math.round((count / totalLogged) * 100)}%` : '0%',
                  },
                ]} />
              </View>
              <Text style={styles.breakdownCount}>{count}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: BG },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 8 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 16,
  },
  backBtn:     { width: 40, alignItems: 'flex-start' },
  backArrow:   { color: '#fff', fontSize: 28, lineHeight: 30 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },

  monthNav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12, marginTop: 4,
  },
  navBtn:         { padding: 8 },
  navBtnDisabled: { opacity: 0.3 },
  navArrow:       { fontSize: 28, color: NAVY, fontWeight: '300' },
  monthTitle:     { fontSize: 16, fontWeight: '800', color: NAVY, letterSpacing: 1 },

  card: {
    backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: NAVY, marginBottom: 12 },

  weekdayRow:   { flexDirection: 'row', marginBottom: 6 },
  weekdayLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: MUTED },

  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 2 },
  cell: {
    width: `${100 / 7}%`, aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    padding: 4,
  },
  cellInner: {
    flex: 1, width: '100%',
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#e0e7ef',
  },
  cellText: { fontSize: 13, fontWeight: '600' },

  legendRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginBottom: 12, flexWrap: 'wrap', gap: 4,
  },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:   { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 10, color: NAVY, fontWeight: '500' },

  summaryRow:      { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryItem:     { alignItems: 'center', flex: 1 },
  summaryValue:    { fontSize: 20, fontWeight: '800' },
  summarySubLabel: { fontSize: 11, color: MUTED, marginTop: 2 },
  divider:         { width: 1, height: 40, backgroundColor: '#e8eef5' },

  breakdownRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  breakdownDot:   { width: 10, height: 10, borderRadius: 5 },
  breakdownLabel: { fontSize: 12, color: NAVY, fontWeight: '500', width: 80 },
  breakdownBarBg: { flex: 1, height: 8, backgroundColor: '#e8eef5', borderRadius: 4, overflow: 'hidden' },
  breakdownBar:   { height: '100%', borderRadius: 4 },
  breakdownCount: { fontSize: 12, color: MUTED, fontWeight: '600', width: 24, textAlign: 'right' },
});