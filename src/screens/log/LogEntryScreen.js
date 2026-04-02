import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogs } from '../../context/LogsContext';
import { ScoreRow, PrimaryButton } from '../../components';
import { Colors, Spacing, FontSize, Radius } from '../../theme';

export default function LogEntryScreen({ route, navigation }) {
  const { date, log: existing } = route.params ?? {};
  const { saveLog } = useLogs();

  const [mood,        setMood]        = useState(existing?.mood        ?? 3);
  const [focus,       setFocus]       = useState(existing?.focus       ?? 3);
  const [sleep,       setSleep]       = useState(existing?.sleep       ?? 3);
  const [energy,      setEnergy]      = useState(existing?.energy      ?? 3);
  const [impulsivity, setImpulsivity] = useState(existing?.impulsivity ?? 3);
  const [tasks,       setTasks]       = useState(existing?.tasksCompleted   ?? 0);
  const [screenTime,  setScreenTime]  = useState(existing?.screenTimeHours  ?? 0);
  const [medTaken,    setMedTaken]    = useState(existing?.medicationTaken  ?? false);
  const [note,        setNote]        = useState(existing?.note ?? '');
  const [loading,     setLoading]     = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await saveLog({
        date,
        mood, focus, sleep, energy, impulsivity,
        tasksCompleted: tasks,
        screenTimeHours: screenTime,
        medicationTaken: medTaken,
        note: note.trim() || undefined,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{date}</Text>
        <TouchableOpacity onPress={save} disabled={loading}>
          <Text style={[styles.save, loading && { opacity: 0.5 }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Section title="How did you feel?">
          <ScoreRow label="Mood"   value={mood}   onChange={setMood}   labels={['Very low','Low','Okay','Good','Great']} />
          <ScoreRow label="Energy" value={energy} onChange={setEnergy} labels={['Exhausted','Tired','Okay','Energetic','Pumped']} />
        </Section>

        <Section title="ADHD symptoms">
          <ScoreRow label="Focus"       value={focus}       onChange={setFocus}       labels={["Can't focus",'Distracted','Okay','Focused','In the zone']} />
          <ScoreRow label="Impulsivity" value={impulsivity} onChange={setImpulsivity} labels={['Very calm','Calm','Some urges','Impulsive','Very impulsive']} />
        </Section>

        <Section title="Sleep & tasks">
          <ScoreRow label="Sleep quality" value={sleep} onChange={setSleep} labels={['Terrible','Poor','Okay','Good','Great']} />

          <View style={styles.counterRow}>
            <Text style={styles.counterLabel}>Tasks completed</Text>
            <View style={styles.counter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setTasks(Math.max(0, tasks - 1))}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{tasks}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setTasks(Math.min(20, tasks + 1))}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.counterRow}>
            <Text style={styles.counterLabel}>Screen time</Text>
            <View style={styles.counter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setScreenTime(Math.max(0, +(screenTime - 0.5).toFixed(1)))}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{screenTime}h</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setScreenTime(Math.min(16, +(screenTime + 0.5).toFixed(1)))}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Section>

        <Section title="Medication">
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Took medication today</Text>
            <Switch
              value={medTaken}
              onValueChange={setMedTaken}
              trackColor={{ true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>
        </Section>

        <Section title="Notes">
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="How was your day?"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
          />
        </Section>

        <View style={{ height: Spacing.lg }}>
          <PrimaryButton label="Save log" onPress={save} loading={loading} />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancel: { color: Colors.textMuted, fontSize: FontSize.md },
  title:  { color: Colors.text,      fontSize: FontSize.md, fontWeight: '600' },
  save:   { color: Colors.accent,    fontSize: FontSize.md, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, gap: Spacing.md },
  section: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: Spacing.lg,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  counterLabel: { color: Colors.text, fontSize: FontSize.md, fontWeight: '500' },
  counter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  counterBtn: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceDim,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: { color: Colors.accent, fontSize: FontSize.lg, fontWeight: '300' },
  counterValue: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700', minWidth: 40, textAlign: 'center' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { color: Colors.text, fontSize: FontSize.md },
  noteInput: {
    color: Colors.text,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: Colors.surface,
  },
});
