import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch,
  ActivityIndicator, Alert, Clipboard, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect, Line, Polyline } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import { FontSize, Spacing } from '../../theme';
import api from '../../api/client';

const TOTAL_SECONDS = 10 * 60;
const SHARE_DOMAIN  = 'focusapp.no';

// ── Arc timer ──────────────────────────────────────────────────────────────────
function ArcTimer({ secondsLeft, total = TOTAL_SECONDS, color }) {
  const SIZE = 200, STROKE = 10;
  const R = (SIZE - STROKE) / 2, CX = SIZE / 2, CY = SIZE / 2;
  const START_DEG = 160, SPAN = 220;
  const fraction = Math.max(0, secondsLeft / total);
  const arcDeg = fraction * SPAN;

  function polarToXY(deg) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
  }
  function arcPath(fromDeg, toDeg) {
    const from = polarToXY(fromDeg), to = polarToXY(toDeg);
    const span = ((toDeg - fromDeg) + 360) % 360;
    return `M ${from.x} ${from.y} A ${R} ${R} 0 ${span > 180 ? 1 : 0} 1 ${to.x} ${to.y}`;
  }

  const bgPath = arcPath(START_DEG, START_DEG + SPAN);
  const fgPath = arcDeg > 1 ? arcPath(START_DEG, START_DEG + arcDeg) : null;
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE}>
        <Path d={bgPath} stroke="#e8eef5" strokeWidth={STROKE} fill="none" strokeLinecap="round" />
        {fgPath && <Path d={fgPath} stroke={color} strokeWidth={STROKE} fill="none" strokeLinecap="round" />}
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: '800', color, letterSpacing: 2 }}>{mins}:{secs}</Text>
      </View>
    </View>
  );
}

// ── Tab icons ──────────────────────────────────────────────────────────────────
function IconCode({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.8"/>
      <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.5"/>
      <Line x1="7" y1="13" x2="10" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="7" y1="16" x2="14" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </Svg>
  );
}

function IconASRS({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="1.8"/>
      <Line x1="8" y1="8"  x2="16" y2="8"  stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="8" y1="16" x2="12" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <Circle cx="19" cy="19" r="4" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5"/>
      <Line x1="19" y1="17" x2="19" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <Circle cx="19" cy="20.5" r="0.6" fill={color}/>
    </Svg>
  );
}

function IconStudies({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3 L22 8 L12 13 L2 8 Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Path d="M6 10.5 L6 16 C6 16 9 19 12 19 C15 19 18 16 18 16 L18 10.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <Line x1="22" y1="8" x2="22" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

// ── Code tab content ───────────────────────────────────────────────────────────
function CodeTab({ theme, t, insets }) {
  const PRIMARY = theme?.accent ?? '#4a7ab5';
  const [code,         setCode]         = useState(null);
  const [expiresAt,    setExpiresAt]    = useState(null);
  const [secondsLeft,  setSecondsLeft]  = useState(TOTAL_SECONDS);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [loading,      setLoading]      = useState(false);
  const timerRef = useRef(null);
  const expired  = secondsLeft === 0;

  const startTimer = useCallback((expiry) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const tick = () => {
      const remaining = Math.max(0, Math.round((new Date(expiry) - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) clearInterval(timerRef.current);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  const generateCode = useCallback(async (notes = includeNotes) => {
    setLoading(true);
    try {
      const res = await api.post('/api/patient/share-code', { includeNotes: notes });
      const { code: newCode, expiresAt: expiry } = res.data.data;
      setCode(newCode);
      setExpiresAt(expiry);
      startTimer(expiry);
    } catch (err) {
      Alert.alert('Error', 'Could not generate share code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [includeNotes, startTimer]);

  useEffect(() => {
    generateCode();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const copyCode = () => {
    if (code) { Clipboard.setString(code); Alert.alert('Copied', 'Code copied to clipboard'); }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, alignItems: 'center', paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
      {/* Code card */}
      <TouchableOpacity style={styles.codeCard} onPress={copyCode} activeOpacity={0.8}>
        {loading ? <ActivityIndicator color={PRIMARY} size="large" /> : (
          <>
            <Text style={[styles.codeText, { color: expired ? '#ccc' : PRIMARY }]}>
              {code ? code.split('').join(' ') : '— — — — — —'}
            </Text>
            <View style={styles.brandRow}>
              <Svg width="20" height="20" viewBox="0 0 24 24">
                <Path d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z" fill="none" stroke={PRIMARY} strokeWidth="1.5"/>
                <Path d="M12 6 L16 8.5 L16 13.5 L12 16 L8 13.5 L8 8.5 Z" fill={PRIMARY} opacity="0.3"/>
              </Svg>
              <Text style={styles.brandText}>
                <Text style={{ fontWeight: '700' }}>FOCUS</Text>
                <Text style={{ color: '#999' }}>App</Text>
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.description}>{t.shareDescription ?? 'Secure access to your own report on this website:'}</Text>
      {code && (
        <TouchableOpacity onPress={copyCode}>
          <Text style={[styles.shareUrl, { color: PRIMARY }]}>{SHARE_DOMAIN}/share/{code}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.toggleRow}>
        <Switch
          value={includeNotes}
          onValueChange={(val) => { setIncludeNotes(val); generateCode(val); }}
          trackColor={{ false: '#D1D5DB', true: PRIMARY }}
          thumbColor="#fff"
          ios_backgroundColor="#D1D5DB"
        />
        <Text style={[styles.toggleLabel, { color: PRIMARY }]}>{t.sharePersonalNotes ?? 'Share personal notes'}</Text>
      </View>

      <View style={styles.timerCard}>
        <View style={styles.timerHeader}>
          <Svg width="18" height="18" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="9" fill="none" stroke={expired ? '#ccc' : PRIMARY} strokeWidth="1.5"/>
            <Path d="M12 7 L12 12 L15 14" stroke={expired ? '#ccc' : PRIMARY} strokeWidth="1.5" strokeLinecap="round"/>
          </Svg>
          <Text style={[styles.timerLabel, { color: expired ? '#ccc' : PRIMARY }]}>
            {expired ? (t.codeExpired ?? 'Code has expired') : (t.codeValidFor ?? 'The code is valid for 10 minutes')}
          </Text>
        </View>
        <ArcTimer secondsLeft={secondsLeft} color={expired ? '#D1D5DB' : PRIMARY} />
        <View style={styles.divider} />
        <TouchableOpacity onPress={() => generateCode()} disabled={loading} style={styles.generateBtn}>
          {loading
            ? <ActivityIndicator color={PRIMARY} />
            : <Text style={[styles.generateText, { color: PRIMARY }]}>{t.generateNewCode ?? 'GENERATE NEW CODE'}</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── ASRS tab content ───────────────────────────────────────────────────────────
function ASRSTab({ theme, t }) {
  const PRIMARY = theme?.accent ?? '#4a7ab5';
  const NAVY = '#2d4a6e';
  const MUTED = '#8fa8c8';

  // ASRS v1.1 Part A — 6 questions
  const questions = [
    'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
    'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
    'How often do you have problems remembering appointments or obligations?',
    'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
    'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
    'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
  ];
  const options = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'];
  const [answers, setAnswers] = useState({});

  const score = Object.values(answers).filter(v => v >= 3).length; // Often/Very often = 3/4
  const completed = Object.keys(answers).length === questions.length;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
        <Text style={{ color: NAVY, fontSize: 15, fontWeight: '700', marginBottom: 4 }}>ASRS v1.1 Screener</Text>
        <Text style={{ color: MUTED, fontSize: 13, lineHeight: 18 }}>
          Adult ADHD Self-Report Scale — Part A. Answer based on how you have felt over the past 6 months.
        </Text>
      </View>

      {questions.map((q, qi) => (
        <View key={qi} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
          <Text style={{ color: NAVY, fontSize: 13, fontWeight: '600', marginBottom: 12 }}>
            {qi + 1}. {q}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              return (
                <TouchableOpacity
                  key={oi}
                  onPress={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: selected ? PRIMARY : '#dde8f0',
                    backgroundColor: selected ? PRIMARY + '22' : '#f8fafc',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: selected ? PRIMARY : MUTED }}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      {completed && (
        <View style={{
          backgroundColor: score >= 4 ? '#FEF9C3' : '#BBF7D0',
          borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 4,
        }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: score >= 4 ? '#854D0E' : '#14532D' }}>{score}/6</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: score >= 4 ? '#854D0E' : '#14532D', marginTop: 4 }}>
            {score >= 4 ? 'Consistent with ADHD symptoms — discuss with your doctor' : 'Below threshold for ADHD screening'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ── Studies tab content ────────────────────────────────────────────────────────
function StudiesTab({ theme, t }) {
  const PRIMARY = theme?.accent ?? '#4a7ab5';
  const NAVY = '#2d4a6e';
  const MUTED = '#8fa8c8';

  const studies = [
    {
      title: 'ADHD in Adults: Diagnosis and Treatment',
      journal: 'New England Journal of Medicine',
      year: '2023',
      summary: 'Comprehensive review of diagnostic criteria and treatment outcomes for adult ADHD, including medication efficacy and behavioral interventions.',
      tag: 'Treatment',
      tagColor: '#4a7ab5',
    },
    {
      title: 'Long-term Effects of Stimulant Medication on ADHD',
      journal: 'JAMA Psychiatry',
      year: '2022',
      summary: 'Multi-year study following adults on methylphenidate and amphetamine-based treatments, assessing quality of life and symptom control.',
      tag: 'Medication',
      tagColor: '#22C55E',
    },
    {
      title: 'Sleep Disorders and ADHD Comorbidity',
      journal: 'Sleep Medicine Reviews',
      year: '2023',
      summary: 'Meta-analysis showing strong correlation between sleep disruption and ADHD symptom severity across 47 studies.',
      tag: 'Sleep',
      tagColor: '#7AABDB',
    },
    {
      title: 'Digital Self-Monitoring in ADHD Management',
      journal: 'Journal of Attention Disorders',
      year: '2024',
      summary: 'Study demonstrating that daily mood and focus tracking apps improve treatment adherence and clinician communication.',
      tag: 'Digital Health',
      tagColor: '#FBBF24',
    },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
        <Text style={{ color: NAVY, fontSize: 15, fontWeight: '700', marginBottom: 4 }}>Research & Studies</Text>
        <Text style={{ color: MUTED, fontSize: 13, lineHeight: 18 }}>
          Recent peer-reviewed research relevant to ADHD tracking and treatment.
        </Text>
      </View>

      {studies.map((study, i) => (
        <View key={i} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <View style={{ backgroundColor: study.tagColor + '22', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ color: study.tagColor, fontSize: 11, fontWeight: '700' }}>{study.tag}</Text>
            </View>
            <Text style={{ color: MUTED, fontSize: 11 }}>{study.year}</Text>
          </View>
          <Text style={{ color: NAVY, fontSize: 14, fontWeight: '700', marginBottom: 4 }}>{study.title}</Text>
          <Text style={{ color: PRIMARY, fontSize: 12, fontWeight: '500', marginBottom: 8 }}>{study.journal}</Text>
          <Text style={{ color: '#555', fontSize: 13, lineHeight: 19 }}>{study.summary}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function ShareScreen({ navigation }) {
  const { theme }  = useTheme();
  const { t }      = useLang();
  const insets     = useSafeAreaInsets();
  const PRIMARY    = theme?.accent ?? '#4a7ab5';
  const [activeTab, setActiveTab] = useState('code');

  const tabs = [
    { key: 'code',    label: t.shareTabCode    ?? 'Code',    Icon: IconCode    },
    { key: 'asrs',    label: t.shareTabASRS    ?? 'ASRS',    Icon: IconASRS    },
    { key: 'studies', label: t.shareTabStudies ?? 'Studies', Icon: IconStudies },
  ];

  return (
    <View style={[ss.root, { backgroundColor: theme.bgSecondary ?? '#F0F4F8' }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.accent, theme.accentDark ?? '#2D4A6E']}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={[ss.header, { paddingTop: insets.top + Spacing.sm }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={ss.headerBtn}>
          <Text style={ss.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={ss.headerTitle}>{t.shareData ?? 'Share Data'}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'code'    && <CodeTab    theme={theme} t={t} insets={insets} />}
        {activeTab === 'asrs'    && <ASRSTab    theme={theme} t={t} />}
        {activeTab === 'studies' && <StudiesTab theme={theme} t={t} />}
      </View>

      {/* Bottom tab bar */}
      <View style={[ss.tabBar, { paddingBottom: insets.bottom + 8 }]}>
        {tabs.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <TouchableOpacity
              key={key}
              style={ss.tabBtn}
              onPress={() => setActiveTab(key)}
              activeOpacity={0.7}
            >
              <Icon color={active ? PRIMARY : '#a0b8d0'} size={24} />
              <Text style={[ss.tabLabel, { color: active ? PRIMARY : '#a0b8d0', fontWeight: active ? '700' : '500' }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  codeCard: {
    backgroundColor: '#fff', borderRadius: 24, width: '100%',
    paddingVertical: 32, paddingHorizontal: 20, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 4, marginBottom: 20,
  },
  codeText:     { fontSize: 40, fontWeight: '800', letterSpacing: 6, marginBottom: 16 },
  brandRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText:    { fontSize: 15, color: '#333' },
  description:  { fontSize: FontSize.sm, color: '#888', textAlign: 'center', marginBottom: 4, lineHeight: 20 },
  shareUrl:     { fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  toggleRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  toggleLabel:  { fontSize: FontSize.md, fontWeight: '600' },
  timerCard: {
    backgroundColor: '#fff', borderRadius: 24, width: '100%',
    paddingVertical: 20, paddingHorizontal: 20, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  timerHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginBottom: 12 },
  timerLabel:   { fontSize: FontSize.sm, fontWeight: '600' },
  divider:      { width: '100%', height: 1, backgroundColor: '#e8eef5', marginVertical: 16 },
  generateBtn:  { paddingVertical: 4 },
  generateText: { fontSize: FontSize.sm, fontWeight: '800', letterSpacing: 1.5 },
});

const ss = StyleSheet.create({
  root:       { flex: 1 },
  header:     { paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, flexDirection: 'row', alignItems: 'center' },
  headerBtn:  { width: 40 },
  headerBack: { color: '#fff', fontSize: 28, lineHeight: 34 },
  headerTitle:{ flex: 1, color: '#fff', fontSize: FontSize.lg, fontWeight: '600', textAlign: 'center' },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e8eef5',
    paddingTop: 10,
  },
  tabBtn:  { flex: 1, alignItems: 'center', gap: 4 },
  tabLabel:{ fontSize: 11 },
});