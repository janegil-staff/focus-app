import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Switch, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useLogs } from '../../context/LogsContext';
import { useLang } from '../../context/LangContext';
import { useTheme } from '../../context/ThemeContext';

const NAVY  = '#2d4a6e';
const BG    = '#f0f4f8';
const CARD  = '#ffffff';
const MUTED = '#8fa8c8';

const SCORE_COLORS = ['#b3cde8', '#6aaed6', '#4a7ab5', '#2d5f8a', '#1a3a5c'];

const TRIGGER_KEYS = [
  'triggerStress', 'triggerPoorSleep', 'triggerCaffeine', 'triggerAlcohol',
  'triggerScreenOverload', 'triggerNoExercise', 'triggerSkippedMed',
  'triggerNoise', 'triggerSocialOverload', 'triggerDiet',
];

function ScoreSelector({ label, value, onChange, primary }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.scoreRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            style={[
              styles.scoreBtn,
              { backgroundColor: value === n ? SCORE_COLORS[n - 1] : '#e8eef5' },
            ]}
            onPress={() => onChange(n)}
            activeOpacity={0.7}
          >
            <Text style={[styles.scoreBtnText, { color: value === n ? '#fff' : MUTED }]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function LogFormScreen({ navigation, route }) {
  const today    = new Date().toISOString().split('T')[0];
  const dateParam = route?.params?.date ?? today;

  const { saveLog } = useLogs();
  const { t }       = useLang();
  const { theme }   = useTheme();
  const PRIMARY     = theme?.accent ?? '#4a7ab5';

  const [mood,        setMood]        = useState(null);
  const [focus,       setFocus]       = useState(null);
  const [sleep,       setSleep]       = useState(null);
  const [energy,      setEnergy]      = useState(null);
  const [impulsivity, setImpulsivity] = useState(null);

  const [tasksCompleted,  setTasksCompleted]  = useState('0');
  const [screenTimeHours, setScreenTimeHours] = useState('0');
  const [medicationTaken, setMedicationTaken] = useState(false);
  const [medicationNotes, setMedicationNotes] = useState('');
  const [note,            setNote]            = useState('');
  const [triggers,        setTriggers]        = useState([]);
  const [saving,          setSaving]          = useState(false);

  const toggleTrigger = (key) =>
    setTriggers((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
    );

  const handleSave = async () => {
    if (!mood || !focus || !sleep || !energy || !impulsivity) {
      Alert.alert(
        t.missingFields     ?? 'Missing fields',
        t.missingFieldsMsg  ?? 'Please rate mood, focus, sleep, energy and impulsivity before saving.',
      );
      return;
    }

    setSaving(true);
    try {
      await saveLog({
        date:            dateParam,
        mood,
        focus,
        sleep,
        energy,
        impulsivity,
        tasksCompleted:  parseInt(tasksCompleted,  10) || 0,
        screenTimeHours: parseFloat(screenTimeHours) || 0,
        medicationTaken,
        medicationNotes: medicationTaken ? medicationNotes : '',
        note,
        triggers: triggers.map((key) => t[key] ?? key),
      });
      navigation?.goBack?.();
    } catch (err) {
      const msg = err?.response?.data?.message ?? (t.errorSave ?? 'Failed to save log');
      Alert.alert(t.missingFields ?? 'Error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { backgroundColor: PRIMARY }]}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.logDay ?? 'Log day'}</Text>
        <Text style={styles.headerDate}>{dateParam}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Required fields */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.howWasYourDay ?? 'How was your day?'}</Text>
          <ScoreSelector label={t.mood        ?? 'Mood'}         value={mood}        onChange={setMood}        primary={PRIMARY} />
          <ScoreSelector label={t.focus       ?? 'Focus'}        value={focus}       onChange={setFocus}       primary={PRIMARY} />
          <ScoreSelector label={t.sleepQuality?? 'Sleep quality'}value={sleep}       onChange={setSleep}       primary={PRIMARY} />
          <ScoreSelector label={t.energy      ?? 'Energy'}       value={energy}      onChange={setEnergy}      primary={PRIMARY} />
          <ScoreSelector label={t.impulsivity ?? 'Impulsivity'}  value={impulsivity} onChange={setImpulsivity} primary={PRIMARY} />
        </View>

        {/* Activity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.activity ?? 'Activity'}</Text>
          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>{t.tasksCompleted ?? 'Tasks completed'}</Text>
              <TextInput
                style={styles.numInput}
                keyboardType="number-pad"
                value={tasksCompleted}
                onChangeText={setTasksCompleted}
                maxLength={2}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>{t.screenTimeH ?? 'Screen time (h)'}</Text>
              <TextInput
                style={styles.numInput}
                keyboardType="decimal-pad"
                value={screenTimeHours}
                onChangeText={setScreenTimeHours}
                maxLength={4}
              />
            </View>
          </View>
        </View>

        {/* Medication */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.sectionTitle}>{t.medicationTaken ?? 'Medication taken'}</Text>
            <Switch
              value={medicationTaken}
              onValueChange={setMedicationTaken}
              trackColor={{ false: '#dde5ee', true: MUTED }}
              thumbColor={medicationTaken ? PRIMARY : '#fff'}
            />
          </View>
          {medicationTaken && (
            <TextInput
              style={[styles.textArea, { marginTop: 10 }]}
              placeholder={t.medicationNotes ?? 'Notes about medication…'}
              placeholderTextColor={MUTED}
              value={medicationNotes}
              onChangeText={setMedicationNotes}
              multiline
              numberOfLines={2}
            />
          )}
        </View>

        {/* Triggers */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.triggers ?? 'Triggers'}</Text>
          <View style={styles.chipWrap}>
            {TRIGGER_KEYS.map((key) => {
              const active = triggers.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.chip, active && { backgroundColor: PRIMARY, borderColor: PRIMARY }]}
                  onPress={() => toggleTrigger(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {t[key] ?? key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Note */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.notes ?? 'Notes'}</Text>
          <TextInput
            style={styles.textArea}
            placeholder={t.writeAboutDay ?? 'Write something about your day…'}
            placeholderTextColor={MUTED}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{note.length}/1000</Text>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: PRIMARY }, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>{t.saveLog ?? 'Save log'}</Text>
          }
        </TouchableOpacity>

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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn:     { marginRight: 8 },
  backArrow:   { color: '#fff', fontSize: 28, lineHeight: 30 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
  headerDate:  { color: 'rgba(255,255,255,0.75)', fontSize: 13 },

  card: {
    backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: NAVY, marginBottom: 12 },

  fieldBlock:   { marginBottom: 14 },
  fieldLabel:   { fontSize: 13, color: NAVY, fontWeight: '600', marginBottom: 6 },
  scoreRow:     { flexDirection: 'row', gap: 8 },
  scoreBtn:     { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  scoreBtnText: { fontSize: 15, fontWeight: '700' },

  rowFields:    { flexDirection: 'row', gap: 12 },
  halfField:    { flex: 1 },
  numInput: {
    backgroundColor: BG, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 16, color: NAVY, fontWeight: '600', textAlign: 'center',
  },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  textArea: {
    backgroundColor: BG, borderRadius: 10, padding: 12,
    fontSize: 14, color: NAVY, minHeight: 70, textAlignVertical: 'top',
  },
  charCount: { textAlign: 'right', fontSize: 11, color: MUTED, marginTop: 4 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: BG, borderWidth: 1, borderColor: '#dde5ee',
  },
  chipText:       { fontSize: 12, color: NAVY, fontWeight: '500' },
  chipTextActive: { color: '#fff' },

  saveBtn: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4,
    shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});