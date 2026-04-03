import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLogs } from '../../context/LogsContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import { Spacing, FontSize, Radius } from '../../theme';

const { width } = Dimensions.get('window');
const BLUE     = '#4879BB';
const LIGHT_BG = '#F0F5FC';

// Mood score → dot color
const dotColor = (score) => {
  if (!score) return null;
  if (score <= 1) return '#90CAF9';
  if (score <= 2) return '#66BB6A';
  if (score <= 3) return '#FFA726';
  if (score <= 4) return '#EF7C5A';
  return '#E53935';
};

const MONTH_NAMES = {
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  no: ['Januar','Februar','Mars','April','Mai','Juni','Juli','August','September','Oktober','November','Desember'],
  sv: ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'],
  da: ['Januar','Februar','Marts','April','Maj','Juni','Juli','August','September','Oktober','November','December'],
  de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
  fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  nl: ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'],
  fi: ['Tammikuu','Helmikuu','Maaliskuu','Huhtikuu','Toukokuu','Kesäkuu','Heinäkuu','Elokuu','Syyskuu','Lokakuu','Marraskuu','Joulukuu'],
  es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  it: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
  pl: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
  pt: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
};

const WEEKDAYS = {
  en: ['M','T','W','T','F','S','S'],
  no: ['M','T','O','T','F','L','S'],
  sv: ['M','T','O','T','F','L','S'],
  da: ['M','T','O','T','F','L','S'],
  de: ['M','D','M','D','F','S','S'],
  fr: ['L','M','M','J','V','S','D'],
  nl: ['M','D','W','D','V','Z','Z'],
  fi: ['M','T','K','T','P','L','S'],
  es: ['L','M','X','J','V','S','D'],
  it: ['L','M','M','G','V','S','D'],
  pl: ['P','W','Ś','C','P','S','N'],
  pt: ['S','T','Q','Q','S','S','D'],
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year, month) {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7; // Mon=0 … Sun=6
}

function pad(n) { return String(n).padStart(2, '0'); }

export default function CalendarScreen({ navigation }) {
  const { logs }      = useLogs();
  const { theme }     = useTheme();
  const { t, lang }   = useLang();
  const insets        = useSafeAreaInsets();

  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // date → log map
  const logMap = {};
  (logs ?? []).forEach((l) => { logMap[l.date] = l; });

  const daysInMonth  = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);

  const monthNames = MONTH_NAMES[lang] ?? MONTH_NAMES.en;
  const weekdays   = WEEKDAYS[lang]    ?? WEEKDAYS.en;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    const isCurrentMonth =
      year === today.getFullYear() && month === today.getMonth();
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  // Build grid cells: null = empty padding, number = day
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const dateStr  = (d) => `${year}-${pad(month + 1)}-${pad(d)}`;
  const isToday  = (d) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  // Monthly stats
  const prefix    = `${year}-${pad(month + 1)}`;
  const monthLogs = (logs ?? []).filter((l) => l.date.startsWith(prefix));
  const count     = monthLogs.length;
  const avg       = (key) =>
    count ? (monthLogs.reduce((s, l) => s + (l[key] ?? 0), 0) / count) : 0;

  const STATS = [
    { emoji: '😊', label: t('mood'),        raw: avg('mood'),        key: 'mood' },
    { emoji: '🧠', label: t('focus'),       raw: avg('focus'),       key: 'focus' },
    { emoji: '😴', label: t('sleep'),       raw: avg('sleep'),       key: 'sleep' },
    { emoji: '⚡', label: t('energy'),      raw: avg('energy'),      key: 'energy' },
    { emoji: '🎯', label: t('impulsivity'), raw: avg('impulsivity'), key: 'impulsivity' },
  ];

  const isDark  = theme.mode === 'dark';
  const pageBg  = isDark ? theme.bg       : LIGHT_BG;
  const cardBg  = isDark ? theme.card     : '#FFFFFF';
  const textCol = isDark ? theme.text     : '#1A2D5A';
  const mutedCol= isDark ? theme.textMuted: '#8A9BBE';
  const divider = isDark ? theme.border   : '#F0F4FA';

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>

      {/* Blue header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('myDiary')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Month navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={[styles.navArrow, { color: BLUE }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: textCol }]}>
            {monthNames[month].toUpperCase()}{'  '}{year}
          </Text>
          <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={[
              styles.navArrow,
              { color: BLUE },
              (year === today.getFullYear() && month === today.getMonth()) && { opacity: 0.25 },
            ]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar card */}
        <View style={[styles.calCard, { backgroundColor: cardBg }]}>

          {/* Weekday labels */}
          <View style={styles.weekRow}>
            {weekdays.map((d, i) => (
              <Text key={i} style={[styles.weekDay, { color: mutedCol }]}>{d}</Text>
            ))}
          </View>

          {/* Day cells */}
          <View style={styles.grid}>
            {cells.map((day, idx) => {
              if (!day) return <View key={`empty-${idx}`} style={styles.dayCell} />;

              const ds    = dateStr(day);
              const log   = logMap[ds];
              const color = log ? dotColor(log.mood) : null;
              const today_= isToday(day);

              return (
                <TouchableOpacity
                  key={ds}
                  style={styles.dayCell}
                  onPress={() =>
                    navigation.navigate('LogEntry', { date: ds, log })
                  }
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.dayInner,
                    today_ && { backgroundColor: BLUE },
                    log && !today_ && styles.dayLogged,
                  ]}>
                    <Text style={[
                      styles.dayNum,
                      { color: today_ ? '#FFFFFF' : log ? BLUE : mutedCol },
                      today_ && { fontWeight: '700' },
                    ]}>
                      {day}
                    </Text>
                    {color && (
                      <View style={[styles.dot, { backgroundColor: color }]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dot legend */}
        <View style={styles.legend}>
          {[
            { c: '#90CAF9', l: '1' },
            { c: '#66BB6A', l: '2' },
            { c: '#FFA726', l: '3' },
            { c: '#EF7C5A', l: '4' },
            { c: '#E53935', l: '5' },
          ].map(({ c, l }) => (
            <View key={l} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: c }]} />
              <Text style={[styles.legendLabel, { color: mutedCol }]}>{l}</Text>
            </View>
          ))}
          <Text style={[styles.legendDesc, { color: mutedCol }]}>
            = {t('mood')}
          </Text>
        </View>

        {/* Monthly summary */}
        <Text style={[styles.sectionTitle, { color: textCol }]}>
          {monthNames[month]}  ·  {t('summary')}
        </Text>

        <View style={[styles.statsCard, { backgroundColor: cardBg }]}>
          {STATS.map((row, i) => (
            <View
              key={row.key}
              style={[
                styles.statRow,
                { borderBottomColor: divider },
                i === STATS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={styles.statEmoji}>{row.emoji}</Text>
              <Text style={[styles.statLabel, { color: textCol }]}>{row.label}</Text>
              <Text style={[
                styles.statValue,
                { color: dotColor(Math.round(row.raw)) ?? BLUE },
              ]}>
                {count > 0 ? row.raw.toFixed(1) : '—'}
              </Text>
            </View>
          ))}

          {/* Medication days */}
          <View style={styles.statRow}>
            <Text style={styles.statEmoji}>💊</Text>
            <Text style={[styles.statLabel, { color: textCol }]}>{t('medications')}</Text>
            <Text style={[styles.statValue, { color: BLUE }]}>
              {monthLogs.filter((l) => l.medicationTaken).length} {t('days')}
            </Text>
          </View>

          {/* Days logged */}
          <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.statEmoji}>📋</Text>
            <Text style={[styles.statLabel, { color: textCol }]}>{t('daysLogged')}</Text>
            <Text style={[styles.statValue, { color: BLUE }]}>
              {count} {t('days')}
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const DAY_SIZE = Math.floor((width - Spacing.lg * 2 - 24) / 7);

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerBtn:   { width: 40 },
  headerBack:  { color: '#FFFFFF', fontSize: 30, lineHeight: 36 },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  navArrow:   { fontSize: 30, fontWeight: '300', lineHeight: 36 },
  monthTitle: { fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 2 },

  calCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekDay: {
    width: DAY_SIZE,
    textAlign: 'center',
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },

  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayInner: {
    width: DAY_SIZE - 8,
    height: DAY_SIZE - 8,
    borderRadius: (DAY_SIZE - 8) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayLogged: {
    borderWidth: 1.5,
    borderColor: '#4879BB55',
  },
  dayNum: { fontSize: FontSize.sm, fontWeight: '400' },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 1,
  },

  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendDot:   { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { fontSize: 11 },
  legendDesc:  { fontSize: 11, marginLeft: 2 },

  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },

  statsCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  statEmoji: { fontSize: 22, width: 32 },
  statLabel: { flex: 1, fontSize: FontSize.md },
  statValue: { fontSize: FontSize.md, fontWeight: '700' },
});