import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline, Rect, Ellipse } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useLogs } from '../../context/LogsContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import { FontSize, Spacing, Radius } from '../../theme';

const { width } = Dimensions.get('window');

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function IconCalendarCheck({ color, size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Rect x="3" y="6" width="26" height="23" rx="3" stroke={color} strokeWidth="2" />
      <Line x1="3" y1="13" x2="29" y2="13" stroke={color} strokeWidth="2" />
      <Line x1="10" y1="3" x2="10" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="22" y1="3" x2="22" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M10 21 L14 25 L22 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconMood({ color, size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="13" stroke={color} strokeWidth="2" />
      <Circle cx="11" cy="13" r="1.5" fill={color} />
      <Circle cx="21" cy="13" r="1.5" fill={color} />
      <Path d="M10 19 Q16 25 22 19" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function IconFocus({ color, size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="13" stroke={color} strokeWidth="2" />
      <Circle cx="16" cy="16" r="8"  stroke={color} strokeWidth="2" />
      <Circle cx="16" cy="16" r="3"  fill={color} />
      <Line x1="26" y1="6" x2="19" y2="13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Polyline points="23,6 26,6 26,9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconSleep({ color, size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M20 6 C14 6 9 11 9 17 C9 23 14 27 20 27 C24 27 27 25 29 22 C26 23 22 22 19 19 C16 16 15 12 16 8 C17.5 7 18.8 6.2 20 6 Z"
        stroke={color} strokeWidth="2" strokeLinejoin="round" fill="none"
      />
      <Circle cx="25" cy="8"  r="1.5" fill={color} />
      <Circle cx="28" cy="13" r="1"   fill={color} opacity="0.7" />
      <Circle cx="22" cy="4"  r="1"   fill={color} opacity="0.7" />
    </Svg>
  );
}

function IconPill({ color, size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Rect x="4" y="12" width="24" height="10" rx="5" stroke={color} strokeWidth="2" />
      <Line x1="16" y1="12" x2="16" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M4 17 C4 14.2 6.2 12 9 12 L16 12 L16 22 L9 22 C6.2 22 4 19.8 4 17 Z" fill={color} opacity="0.18" />
    </Svg>
  );
}

function IconMyData({ color, size = 46 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Line x1="6" y1="42" x2="44" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="6" y1="42" x2="6"  y2="8"  stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Polyline points="6,36 16,28 26,32 36,18 44,12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx="16" cy="28" r="2.5" fill={color} />
      <Circle cx="26" cy="32" r="2.5" fill={color} />
      <Circle cx="36" cy="18" r="2.5" fill={color} />
      <Polyline points="39,8 44,12 40,16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function IconMyDiary({ color, size = 46 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect x="10" y="6" width="28" height="36" rx="3" stroke={color} strokeWidth="2.2" />
      <Line x1="10" y1="14" x2="38" y2="14" stroke={color} strokeWidth="1.5" />
      <Line x1="15" y1="22" x2="33" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <Line x1="15" y1="28" x2="33" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <Line x1="15" y1="34" x2="26" y2="34" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <Line x1="32" y1="36" x2="40" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M40 28 L43 25 L41 23 L38 26 Z" fill={color} />
      <Line x1="32" y1="36" x2="31" y2="39" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function IconShareData({ color, size = 46 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="18" cy="14" r="6" stroke={color} strokeWidth="2.2" />
      <Path d="M6 38 C6 30 30 30 30 38" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <Line x1="38" y1="28" x2="38" y2="14" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Polyline points="33,19 38,14 43,19" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="33" y1="30" x2="43" y2="30" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function IconMedication({ color, size = 46 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect x="6" y="18" width="24" height="12" rx="6" stroke={color} strokeWidth="2.2" transform="rotate(-35 18 24)" />
      <Line x1="10" y1="29" x2="20" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Circle cx="36" cy="32" r="10" stroke={color} strokeWidth="2" />
      <Line x1="36" y1="26" x2="36" y2="32" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="36" y1="32" x2="40" y2="35" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function WaveBackground({ color }) {
  return (
    <Svg width={width} height={300} viewBox={`0 0 ${width} 300`} style={StyleSheet.absoluteFill}>
      <Path d={`M0 80 Q${width*0.25} 20 ${width*0.5} 80 Q${width*0.75} 140 ${width} 80 L${width} 300 L0 300 Z`} fill={color} opacity="0.07" />
      <Path d={`M0 120 Q${width*0.3} 60 ${width*0.6} 120 Q${width*0.85} 160 ${width} 100 L${width} 300 L0 300 Z`} fill={color} opacity="0.05" />
      <Path d={`M0 160 Q${width*0.4} 100 ${width*0.7} 150 Q${width*0.9} 180 ${width} 130 L${width} 300 L0 300 Z`} fill={color} opacity="0.04" />
    </Svg>
  );
}

function ClipboardIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 28 28" fill="none">
      <Rect x="4" y="6" width="20" height="20" rx="3" stroke="white" strokeWidth="2" />
      <Rect x="10" y="3" width="8" height="5" rx="1.5" stroke="white" strokeWidth="2" />
      <Line x1="9"  y1="14" x2="19" y2="14" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="14" y1="9"  x2="14" y2="19" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

const STAT_ICONS = [IconCalendarCheck, IconMood, IconFocus, IconSleep, IconPill];
const GRID_ICONS = [IconMyData, IconMyDiary, IconShareData, IconMedication];

export default function HomeScreen({ navigation }) {
  const { user }  = useAuth();
  const insets    = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t }     = useLang();
  const { summary, fetchLogs, fetchSummary, getLogForDate } = useLogs();

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

  const statRows = [
    { labelKey: 'daysLogged', value: count,                          iconIdx: 0 },
    { labelKey: 'avgMood',    value: (avgs.mood    ?? 0).toFixed(1), iconIdx: 1 },
    { labelKey: 'avgFocus',   value: (avgs.focus   ?? 0).toFixed(1), iconIdx: 2 },
    { labelKey: 'avgSleep',   value: (avgs.sleep   ?? 0).toFixed(1), iconIdx: 3 },
    { labelKey: 'medication', value: `${medAdh}%`,                   iconIdx: 4 },
  ];

  const menuItems = [
    { labelKey: 'myData',       screen: 'LogHistory', params: { initialTab: 'diary' } },
    { labelKey: 'myDiary',      screen: 'LogHistory', params: { initialTab: 'calendar' } },
    { labelKey: 'shareData',    screen: 'Profile' },
    { labelKey: 'myMedication', screen: 'Medications' },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>

      <LinearGradient
        colors={[theme.accent, theme.accentDark ?? '#2D4A6E']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={s.header}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={s.headerBtn}>
          <Text style={s.headerIcon}>⚙️</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.appName}>{t.appName}</Text>
          <Text style={s.tagline}>{t.tagline}</Text>
        </View>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={() => navigation.navigate('LogEntry', { date: today, log: todayLog })}
        >
          <ClipboardIcon />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={s.sectionTitle}>{t.last30days}</Text>
        <View style={s.statsList}>
          {statRows.map((row) => {
            const Icon = STAT_ICONS[row.iconIdx];
            return (
              <View key={row.labelKey} style={s.statRow}>
                <Icon color={theme.accent} size={32} />
                <Text style={s.statLabel}>{t[row.labelKey]}</Text>
                <Text style={s.statValue}>{row.value}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.gridWrap}>
          <WaveBackground color={theme.accent} />
          <View style={s.grid}>
            {menuItems.map((item, i) => {
              const Icon = GRID_ICONS[i];
              return (
                <TouchableOpacity
                  key={item.labelKey}
                  style={s.gridCard}
                  onPress={() => navigation.navigate(item.screen, item.params ?? {})}
                  activeOpacity={0.75}
                >
                  <Icon color={theme.accent} size={46} />
                  <Text style={s.gridLabel}>{t[item.labelKey]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={[s.bottomWrap, { paddingBottom: (insets.bottom || 16) + Spacing.md }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('LogEntry', { date: today, log: todayLog })}
          activeOpacity={0.88}
          style={s.dailyLogShadow}
        >
          <LinearGradient
            colors={[theme.accent, theme.accentDark ?? '#2D4A6E']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.dailyLogGradient}
          >
            <Text style={s.dailyLogText}>
              {todayLog ? `✏️  ${t.editTodayLog}` : t.dailyLog}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const makeStyles = (t, insets = { top: 44 }) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: insets.top + Spacing.sm,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerBtn:    { width: 40, alignItems: 'center' },
  headerIcon:   { fontSize: 22 },
  headerCenter: { alignItems: 'center', flex: 1 },
  appName:      { color: '#FFFFFF', fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 0.5 },
  tagline:      { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.xs, letterSpacing: 0.8, marginTop: 3 },

  scroll:        { flex: 1 },
  scrollContent: { paddingTop: Spacing.xl },

  sectionTitle: {
    color: '#111',
    fontSize: FontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },

  statsList: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  statRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  statLabel: { flex: 1, color: '#222', fontSize: FontSize.md, marginLeft: Spacing.md },
  statValue: { color: t.accent, fontSize: FontSize.lg, fontWeight: '700' },

  gridWrap: {
    position: 'relative',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  gridCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: t.accentLight ?? '#7AABDB',
    shadowColor: t.accent,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  gridLabel: {
    color: t.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },

  bottomWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: '#FFFFFF',
  },
  dailyLogShadow: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.accentLight ?? '#7AABDB',
    elevation: 0,
    overflow: 'hidden',
  },
  dailyLogGradient: {
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyLogText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 2,
  },
});