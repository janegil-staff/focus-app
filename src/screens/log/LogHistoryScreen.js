import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useLogs } from '../../context/LogsContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import { Spacing, FontSize, Radius } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';

// 5 = best (green), 1 = worst (red) — matching actual stored data
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

// ── Score badge for diary list ─────────────────────────────────────────────────
function ScoreBadge({ score, size = 28 }) {
  if (!score) return <View style={{ width: size, height: size }} />;
  const color = SCORE_COLORS[score];
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      borderWidth: 1.5, borderColor: color,
      backgroundColor: color + '26',
      justifyContent: 'center', alignItems: 'center',
    }}>
      <Text style={{ color, fontSize: size * 0.38, fontWeight: '700' }}>{score}</Text>
    </View>
  );
}

// ── Calendar tab ───────────────────────────────────────────────────────────────
function CalendarTab({ logs, loading, navigation, t, theme }) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const PRIMARY = theme?.accent ?? '#4a7ab5';
  const NAVY    = '#2d4a6e';
  const MUTED   = '#8fa8c8';

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

  // scoreLabels[0] = score 1 = worst = red = Very low
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
    <View style={{ flex: 1 }}>
      <View style={cal.monthNav}>
        <TouchableOpacity onPress={goBack} style={cal.navBtn}>
          <Text style={[cal.navArrow, { color: NAVY }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[cal.monthTitle, { color: NAVY }]}>
          {(months[month] ?? '').toUpperCase()}{'  '}{year}
        </Text>
        <TouchableOpacity
          onPress={goForward}
          style={[cal.navBtn, isCurrentMonth && { opacity: 0.3 }]}
          disabled={isCurrentMonth}
        >
          <Text style={[cal.navArrow, { color: isCurrentMonth ? '#ccc' : NAVY }]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={[cal.card, { backgroundColor: '#fff' }]}>
        <View style={cal.weekdayRow}>
          {weekdays.map((d, i) => (
            <Text key={i} style={[cal.weekdayLabel, { color: MUTED }]}>{d}</Text>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginVertical: 24 }} />
        ) : (
          <View style={cal.grid}>
            {cells.map((day, i) => {
              if (!day) return <View key={`e-${i}`} style={cal.cell} />;
              const dateStr     = toDateStr(year, month, day);
              const score       = scoreMap[dateStr];
              const isToday     = dateStr === today;
              const existingLog = logs.find((l) => l.date === dateStr) ?? null;
              const bgColor     = score ? SCORE_COLORS[score] : undefined;
              return (
                <TouchableOpacity
                  key={dateStr}
                  style={cal.cell}
                  onPress={() => navigation.navigate('LogEntry', { date: dateStr, log: existingLog })}
                  activeOpacity={0.7}
                >
                  <View style={[
                    cal.cellInner,
                    bgColor && { backgroundColor: bgColor, borderColor: bgColor },
                    isToday && !score && { borderColor: PRIMARY, borderWidth: 2 },
                  ]}>
                    <Text style={[
                      cal.cellText,
                      { color: score ? '#fff' : NAVY },
                      isToday && !score && { color: PRIMARY, fontWeight: '800' },
                    ]}>
                      {day}
                    </Text>
                    {existingLog?.medicationTaken && (
                      <Image
                        source={require('../../../assets/images/ico_intensity_medicine.png')}
                        style={cal.medIcon}
                        resizeMode="contain"
                      />
                    )}
                    {!!(existingLog && existingLog.note && existingLog.note.trim().length > 0) && (
                      <View style={cal.noteIcon}>
                        <Svg width="14" height="14" viewBox="0 0 24 24">
                          <Circle cx="12" cy="12" r="10" fill="none" stroke="#4a7ab5" strokeWidth="2.5"/>
                          <Path d="M7 8 Q7 6 9 6 L15 6 Q17 6 17 8 L17 14 Q17 16 15 16 L13.5 16 L15.5 19.5 L11.5 16 L9 16 Q7 16 7 14 Z" fill="#4a7ab5"/>
                        </Svg>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Legend: score 1=red on left, score 5=green on right */}
      <View style={cal.legendRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View key={s} style={cal.legendItem}>
            <View style={[cal.legendDot, { backgroundColor: SCORE_COLORS[s] }]} />
            <Text style={[cal.legendLabel, { color: NAVY }]}>{scoreLabels[s - 1]}</Text>
          </View>
        ))}
      </View>

      <View style={[cal.card, { backgroundColor: '#fff' }]}>
        <Text style={[cal.sectionTitle, { color: NAVY }]}>{t.monthSummary ?? 'Month summary'}</Text>
        <View style={cal.summaryRow}>
          <View style={cal.summaryItem}>
            <Text style={[cal.summaryValue, { color: PRIMARY }]}>{totalLogged}</Text>
            <Text style={[cal.summarySubLabel, { color: MUTED }]}>{t.daysLoggedShort ?? 'Days logged'}</Text>
          </View>
          <View style={[cal.divider, { backgroundColor: '#e8eef5' }]} />
          <View style={cal.summaryItem}>
            <Text style={[cal.summaryValue, { color: avgAll ? SCORE_COLORS[avgAll] : MUTED }]}>
              {avgAll ? scoreLabels[avgAll - 1] : '—'}
            </Text>
            <Text style={[cal.summarySubLabel, { color: MUTED }]}>{t.avgScore ?? 'Avg. score'}</Text>
          </View>
          <View style={[cal.divider, { backgroundColor: '#e8eef5' }]} />
          <View style={cal.summaryItem}>
            <Text style={[cal.summaryValue, { color: PRIMARY }]}>{totalDays - totalLogged}</Text>
            <Text style={[cal.summarySubLabel, { color: MUTED }]}>{t.missing ?? 'Missing'}</Text>
          </View>
        </View>
      </View>

      <View style={[cal.card, { backgroundColor: '#fff', marginBottom: 40 }]}>
        <Text style={[cal.sectionTitle, { color: NAVY }]}>{t.scoreBreakdown ?? 'Score breakdown'}</Text>
        {countByScore.map(({ score, count, label, color }) => (
          <View key={score} style={cal.breakdownRow}>
            <View style={[cal.breakdownDot, { backgroundColor: color }]} />
            <Text style={[cal.breakdownLabel, { color: NAVY }]}>{label}</Text>
            <View style={[cal.breakdownBarBg, { backgroundColor: '#e8eef5' }]}>
              <View style={[
                cal.breakdownBar,
                { backgroundColor: color, width: totalLogged ? `${Math.round((count / totalLogged) * 100)}%` : '0%' },
              ]} />
            </View>
            <Text style={[cal.breakdownCount, { color: MUTED }]}>{count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const cal = StyleSheet.create({
  monthNav:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  navBtn:      { padding: 8 },
  navArrow:    { fontSize: 28, fontWeight: '300' },
  monthTitle:  { fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  card:        { borderRadius: 14, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  sectionTitle:{ fontSize: 14, fontWeight: '700', marginBottom: 12 },
  weekdayRow:  { flexDirection: 'row', marginBottom: 6 },
  weekdayLabel:{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', padding: 2 },
  cell:        { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
  cellInner:   { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: '#e0e7ef', overflow: 'visible' },
  cellText:    { fontSize: 13, fontWeight: '600' },
  medIcon:     { position: 'absolute', top: -4, right: -4, width: 16, height: 16 },
  noteIcon:    { position: 'absolute', bottom: -4, right: -4, width: 14, height: 14 },
  legendRow:   { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 16, marginBottom: 12, flexWrap: 'wrap', gap: 4 },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:   { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 10, fontWeight: '500' },
  summaryRow:      { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryItem:     { alignItems: 'center', flex: 1 },
  summaryValue:    { fontSize: 20, fontWeight: '800' },
  summarySubLabel: { fontSize: 11, marginTop: 2 },
  divider:         { width: 1, height: 40 },
  breakdownRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  breakdownDot:    { width: 10, height: 10, borderRadius: 5 },
  breakdownLabel:  { fontSize: 12, fontWeight: '500', width: 80 },
  breakdownBarBg:  { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  breakdownBar:    { height: '100%', borderRadius: 4 },
  breakdownCount:  { fontSize: 12, fontWeight: '600', width: 24, textAlign: 'right' },
});

// ── Main screen ────────────────────────────────────────────────────────────────
export default function LogHistoryScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState(route?.params?.initialTab ?? 'calendar');
  const { logs, loading, fetchLogs } = useLogs();
  const { theme } = useTheme();
  const { t }     = useLang();
  const insets    = useSafeAreaInsets();
  const PRIMARY   = theme?.accent ?? '#4a7ab5';

  useFocusEffect(useCallback(() => { fetchLogs(); }, [fetchLogs]));

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const s = makeStyles(theme, insets);

  return (
    <View style={[s.root, { backgroundColor: theme.bgSecondary ?? '#F0F4F8' }]}>

      <View style={[s.header, { backgroundColor: PRIMARY, paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.myDiary ?? 'My Diary'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.tabBar}>
        {['calendar', 'diary'].map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === 'calendar' ? (t.calendar ?? 'Calendar') : (t.diary ?? 'Diary');
          return (
            <TouchableOpacity
              key={tab}
              style={[s.tab, isActive && s.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              {isActive ? (
                <LinearGradient
                  colors={[theme.accent ?? '#4a7ab5', theme.accentDark ?? '#2D4A6E']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={s.tabGradient}
                >
                  <Text style={s.tabTextActive}>{label}</Text>
                </LinearGradient>
              ) : (
                <Text style={s.tabText}>{label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'calendar' && (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <CalendarTab logs={logs} loading={loading} navigation={navigation} t={t} theme={theme} />
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === 'diary' && (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.date}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={[s.emptyText, { color: theme.textMuted }]}>{t.noLogs ?? 'No logs yet'}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const score = avgScore(item);
            return (
              <TouchableOpacity
                style={[s.row, { backgroundColor: theme.card ?? '#fff', borderColor: theme.border }]}
                onPress={() => navigation.navigate('LogEntry', { date: item.date, log: item })}
              >
                <View style={[
                  s.scoreRing,
                  score && { borderColor: SCORE_COLORS[score], backgroundColor: SCORE_COLORS[score] + '20' },
                ]}>
                  {score
                    ? <Text style={[s.scoreRingText, { color: SCORE_COLORS[score] }]}>{score}</Text>
                    : <Text style={[s.scoreRingText, { color: theme.textMuted }]}>—</Text>
                  }
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.rowDate, { color: theme.text }]}>{formatDate(item.date)}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 3, gap: 6 }}>
                    <ScoreBadge score={item.mood}        size={22} />
                    <ScoreBadge score={item.focus}       size={22} />
                    <ScoreBadge score={item.sleep}       size={22} />
                    <ScoreBadge score={item.energy}      size={22} />
                    <ScoreBadge score={item.impulsivity} size={22} />
                    {item.medicationTaken && <Text style={{ fontSize: 14 }}>💊</Text>}
                    {item.note            && <Text style={{ fontSize: 14 }}>📝</Text>}
                  </View>
                </View>
                <Text style={[s.chevron, { color: theme.textMuted }]}>›</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const makeStyles = (t, insets) => StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  backBtn:     { width: 40 },
  back:        { color: '#fff', fontSize: 30 },
  headerTitle: { flex: 1, color: '#fff', fontSize: FontSize.md, fontWeight: '600', textAlign: 'center' },
  tabBar: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: t.border ?? '#e8eef5',
  },
  tab: {
    flex: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: t.border ?? '#dde5ee',
    paddingVertical: 16, shadowColor: '#000', shadowOpacity: 0.22,
    shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 8,
  },
  tabActive:     { borderColor: t.accent ?? '#4a7ab5', shadowOpacity: 0, elevation: 0, overflow: 'hidden', paddingVertical: 0 },
  tabGradient:   { width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  tabText:       { color: t.textMuted ?? '#8fa8c8', fontSize: FontSize.sm, fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  list:  { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 40 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, gap: Spacing.sm,
  },
  scoreRing: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 2,
    borderColor: '#e0e7ef', alignItems: 'center', justifyContent: 'center',
  },
  scoreRingText: { fontSize: 15, fontWeight: '800' },
  rowDate:   { fontSize: FontSize.md, fontWeight: '500' },
  chevron:   { fontSize: 20 },
  empty:     { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: FontSize.md },
});