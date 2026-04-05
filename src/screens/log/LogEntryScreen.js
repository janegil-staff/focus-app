import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLogs } from "../../context/LogsContext";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { useAuth } from "../../context/AuthContext";
import { FontSize, Spacing, Radius } from "../../theme";
import client from "../../api/client";

const { width } = Dimensions.get("window");

const ADHD_MEDICATIONS = [
  { id: "methylphenidate",    name: "Methylphenidate",    brand: "Ritalin, Concerta" },
  { id: "lisdexamfetamine",   name: "Lisdexamfetamine",   brand: "Vyvanse, Elvanse" },
  { id: "amphetamine",        name: "Amphetamine",        brand: "Adderall" },
  { id: "dextroamphetamine",  name: "Dextroamphetamine",  brand: "Dexedrine" },
  { id: "atomoxetine",        name: "Atomoxetine",        brand: "Strattera" },
  { id: "guanfacine",         name: "Guanfacine",         brand: "Intuniv" },
  { id: "clonidine",          name: "Clonidine",          brand: "Kapvay" },
  { id: "bupropion",          name: "Bupropion",          brand: "Wellbutrin" },
  { id: "viloxazine",         name: "Viloxazine",         brand: "Qelbree" },
  { id: "modafinil",          name: "Modafinil",          brand: "Provigil" },
  { id: "dexmethylphenidate", name: "Dexmethylphenidate", brand: "Focalin" },
  { id: "other",              name: "Other / Not listed", brand: "" },
];

const SCORE_COLORS = {
  1: "#22C55E",
  2: "#7AABDB",
  3: "#FBBF24",
  4: "#FB923C",
  5: "#EF4444",
};

function scoreColor(score) {
  return SCORE_COLORS[score] ?? "#D1D5DB";
}

function ScoreRow({ label, subtitle, value, onChange, labels, theme }) {
  return (
    <View style={[sr.wrap, { borderBottomColor: theme.border }]}>
      <View style={sr.top}>
        <Text style={[sr.label, { color: theme.text }]}>{label}</Text>
        {value ? (
          <Text style={[sr.badge, { backgroundColor: scoreColor(value) }]}>
            {labels ? labels[value - 1] : value}
          </Text>
        ) : null}
      </View>
      {subtitle ? (
        <Text style={[sr.sub, { color: theme.textSecondary }]}>{subtitle}</Text>
      ) : null}
      <View style={sr.dots}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => onChange(value === n ? null : n)}
            style={[sr.dot, {
              backgroundColor: value === n ? scoreColor(n) : (theme.bgSecondary ?? "#F0F4F8"),
              borderColor: value === n ? scoreColor(n) : theme.border,
            }]}
          >
            <Text style={[sr.dotNum, { color: value === n ? "#FFF" : theme.textMuted }]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const sr = StyleSheet.create({
  wrap:   { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  top:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  label:  { fontSize: FontSize.md, fontWeight: "500", flex: 1 },
  badge:  { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2, color: "#FFF", fontSize: FontSize.xs, fontWeight: "700", overflow: "hidden" },
  sub:    { fontSize: FontSize.xs, marginBottom: Spacing.sm },
  dots:   { flexDirection: "row", gap: 8, marginTop: Spacing.sm },
  dot:    { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  dotNum: { fontSize: FontSize.sm, fontWeight: "600" },
});

function SectionHeader({ title, theme }) {
  return (
    <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm, backgroundColor: theme.bgSecondary ?? "#F0F4F8" }}>
      <Text style={{ color: theme.textMuted, fontSize: FontSize.sm, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" }}>
        {title}
      </Text>
    </View>
  );
}

function ToggleRow({ label, subtitle, value, onChange, theme }) {
  return (
    <View style={[sr.wrap, { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: Spacing.md, borderBottomColor: theme.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.text, fontSize: FontSize.md, fontWeight: "500" }}>{label}</Text>
        {subtitle ? <Text style={{ color: theme.textSecondary, fontSize: FontSize.xs, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={!!value}
        onValueChange={onChange}
        trackColor={{ false: "#D1D5DB", true: "#22C55E" }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#D1D5DB"
      />
    </View>
  );
}

// ── Medication selector — shows both preset and custom meds ──────────────────
function MedicationSelector({ userMedIds, customMeds, selected, onToggle, theme }) {
  // Preset meds the user has selected in their profile
  const presetMeds = ADHD_MEDICATIONS.filter((m) => userMedIds.includes(m.id));

  // All available meds combined
  const allMeds = [
    ...presetMeds.map(m => ({ id: m.id, name: m.name, brand: m.brand, isCustom: false })),
    ...customMeds.map(m => ({ id: m._id, name: m.name, brand: m.dosage, isCustom: true })),
  ];

  if (allMeds.length === 0) {
    return (
      <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
        <Text style={{ color: theme.textMuted, fontSize: FontSize.sm }}>
          No medications saved. Add them in My Medication.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md }}>
      {allMeds.map((med) => {
        const active = selected.includes(med.id);
        return (
          <TouchableOpacity
            key={med.id}
            style={[medSel.row, {
              backgroundColor: active ? (theme.accentBg ?? "#EBF4FF") : (theme.surface ?? theme.bg),
              borderColor: active ? theme.accent : theme.border,
            }]}
            onPress={() => onToggle(med.id)}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[medSel.name, { color: active ? theme.accent : theme.text }]}>
                  {med.name}
                </Text>
                {med.isCustom && (
                  <View style={[medSel.customBadge, { backgroundColor: theme.accentBg, borderColor: theme.accentBorder }]}>
                    <Text style={[medSel.customBadgeText, { color: theme.accent }]}>custom</Text>
                  </View>
                )}
              </View>
              {med.brand ? (
                <Text style={[medSel.brand, { color: theme.textMuted }]}>{med.brand}</Text>
              ) : null}
            </View>
            <View style={[medSel.check, {
              borderColor: active ? theme.accent : theme.border,
              backgroundColor: active ? theme.accent : "transparent",
            }]}>
              {active && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const medSel = StyleSheet.create({
  row:             { flexDirection: "row", alignItems: "center", padding: Spacing.md, marginBottom: Spacing.xs, borderRadius: 12, borderWidth: 1 },
  name:            { fontSize: FontSize.md, fontWeight: "500" },
  brand:           { fontSize: FontSize.sm, marginTop: 2 },
  check:           { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  customBadge:     { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, borderWidth: 1 },
  customBadgeText: { fontSize: 10, fontWeight: "600" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LogEntryScreen({ navigation, route }) {
  const { date, log: existingLog } = route.params ?? {};
  const { theme }  = useTheme();
  const { t }      = useLang();
  const { user }   = useAuth();
  const { saveLog, deleteLog } = useLogs();
  const insets     = useSafeAreaInsets();
  const scrollRef  = useRef(null);

  const isEdit = !!existingLog;

  const [mood,        setMood]        = useState(existingLog?.mood            ?? null);
  const [energy,      setEnergy]      = useState(existingLog?.energy          ?? null);
  const [focus,       setFocus]       = useState(existingLog?.focus           ?? null);
  const [impulsivity, setImpulsivity] = useState(existingLog?.impulsivity     ?? null);
  const [sleep,       setSleep]       = useState(existingLog?.sleep           ?? null);
  const [tasks,       setTasks]       = useState(existingLog?.tasksCompleted  ?? null);
  const [tookMed,     setTookMed]     = useState(existingLog?.medicationTaken ?? false);
  const [selectedMeds, setSelectedMeds] = useState(existingLog?.medicationNames ?? []);
  const [note,        setNote]        = useState(existingLog?.note            ?? "");
  const [saving,      setSaving]      = useState(false);

  // ── Custom medications from DB ─────────────────────────────────────────────
  const [customMeds, setCustomMeds] = useState([]);

  useEffect(() => {
    client.get("/api/patient/medications?active=true")
      .then(res => setCustomMeds(res.data?.data ?? []))
      .catch(() => {});
  }, []);

  const userMedIds = user?.medications ?? [];

  const toggleMed = (id) =>
    setSelectedMeds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const displayDate = (() => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  })();

  const hasAnyData = mood || energy || focus || impulsivity || sleep || tasks || tookMed || note;

  const handleSave = async () => {
    if (!hasAnyData) {
      Alert.alert("Nothing to save", "Please fill in at least one field.");
      return;
    }
    setSaving(true);
    try {
      const payload = { date };
      if (mood        != null) payload.mood           = mood;
      if (energy      != null) payload.energy         = energy;
      if (focus       != null) payload.focus          = focus;
      if (impulsivity != null) payload.impulsivity    = impulsivity;
      if (sleep       != null) payload.sleep          = sleep;
      if (tasks       != null) payload.tasksCompleted = tasks;
      payload.medicationTaken = tookMed;
      payload.medicationNames = tookMed ? selectedMeds : [];
      payload.note = note.trim();

      await saveLog(payload);
      navigation.goBack();
    } catch (e) {
      Alert.alert(
        t.errorSave ?? "Error",
        e?.response?.data?.error ?? e?.message ?? "Could not save log. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete log", "Are you sure you want to delete this log?", [
      { text: t.cancel ?? "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteLog(date);
            navigation.goBack();
          } catch {
            Alert.alert("Error", "Could not delete log.");
          }
        },
      },
    ]);
  };

  const s = makeStyles(theme, insets);

  const moodLabels        = t.scores?.mood        ?? ["Very good", "Good", "OK", "Bad", "Very bad"];
  const focusLabels       = t.scores?.focus       ?? ["Excellent", "Good", "OK", "Distracted", "Can't focus"];
  const sleepLabels       = t.scores?.sleep       ?? ["Great", "Good", "OK", "Poor", "Terrible"];
  const energyLabels      = t.scores?.energy      ?? ["Pumped", "Energetic", "OK", "Tired", "Exhausted"];
  const impulsivityLabels = t.scores?.impulsivity ?? ["Very calm", "Calm", "Some urges", "Impulsive", "Very impulsive"];

  return (
    <SafeAreaView style={s.root} edges={["bottom"]}>

      <LinearGradient
        colors={[theme.accent, theme.accentDark ?? "#2D4A6E"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={s.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <Text style={s.headerBack}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>
            {isEdit ? (t.editTodayLog ?? "Edit log") : (t.howWasYourDay ?? "How was your day?")}
          </Text>
          <Text style={s.headerDate}>{displayDate}</Text>
        </View>
        {isEdit ? (
          <TouchableOpacity onPress={handleDelete} style={s.headerBtn}>
            <Text style={s.headerDelete}>🗑</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.headerBtn} />
        )}
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title={t.howDidYouFeel ?? "How did you feel?"} theme={theme} />
        <View style={s.section}>
          <ScoreRow label={t.mood ?? "Mood"}     value={mood}   onChange={setMood}   labels={moodLabels}   theme={theme} />
          <ScoreRow label={t.energy ?? "Energy"} value={energy} onChange={setEnergy} labels={energyLabels} theme={theme} />
        </View>

        <SectionHeader title={t.adhdSymptoms ?? "ADHD symptoms"} theme={theme} />
        <View style={s.section}>
          <ScoreRow label={t.focus ?? "Focus"} subtitle="1 = excellent focus, 5 = cannot focus at all" value={focus} onChange={setFocus} labels={focusLabels} theme={theme} />
          <ScoreRow label={t.impulsivity ?? "Impulsivity"} subtitle="1 = very calm, 5 = very impulsive" value={impulsivity} onChange={setImpulsivity} labels={impulsivityLabels} theme={theme} />
        </View>

        <SectionHeader title={t.sleepTasks ?? "Sleep & tasks"} theme={theme} />
        <View style={s.section}>
          <ScoreRow label={t.sleepQuality ?? "Sleep quality"} subtitle="How well did you sleep last night?" value={sleep} onChange={setSleep} labels={sleepLabels} theme={theme} />
          <ScoreRow label={t.tasksCompleted ?? "Tasks completed"} subtitle="How productive were you today?" value={tasks} onChange={setTasks} labels={["All done", "Most", "Some", "Few", "None"]} theme={theme} />
        </View>

        <SectionHeader title={t.medicationSec ?? "Medication"} theme={theme} />
        <View style={s.section}>
          <ToggleRow
            label={t.tookMedToday ?? "Took medication today"}
            value={tookMed}
            onChange={setTookMed}
            theme={theme}
          />
          {tookMed && (
            <MedicationSelector
              userMedIds={userMedIds}
              customMeds={customMeds}
              selected={selectedMeds}
              onToggle={toggleMed}
              theme={theme}
            />
          )}
        </View>

        <SectionHeader title={t.notes ?? "Notes"} theme={theme} />
        <View style={[s.section, { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }]}>
          <TextInput
            style={[s.noteInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg ?? "#FFF" }]}
            value={note}
            onChangeText={setNote}
            placeholder={t.howWasYourDay ?? "How was your day?"}
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            selectionColor={theme.accent}
          />
        </View>

        <View style={s.legend}>
          <Text style={[s.legendText, { color: theme.textMuted }]}>{t.scoreBest ?? "1 = Best"}</Text>
          <View style={s.legendDots}>
            {[1, 2, 3, 4, 5].map((n) => (
              <View key={n} style={[s.legendDot, { backgroundColor: scoreColor(n) }]} />
            ))}
          </View>
          <Text style={[s.legendText, { color: theme.textMuted }]}>{t.scoreWorst ?? "5 = Worst"}</Text>
        </View>
      </ScrollView>

      <View style={[s.bottomWrap, { paddingBottom: (insets.bottom || 16) + Spacing.md }]}>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.88} style={s.saveBtn} disabled={saving}>
          <LinearGradient
            colors={[theme.accent, theme.accentDark ?? "#2D4A6E"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.saveBtnGradient}
          >
            {saving
              ? <ActivityIndicator color="#FFF" />
              : <Text style={s.saveBtnText}>{t.saveLog ?? "Save log"}</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (t, insets) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bgSecondary ?? "#F0F4F8" },
  header: {
    paddingTop: insets.top + Spacing.sm,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn:    { width: 40 },
  headerBack:   { color: "#FFF", fontSize: 28, lineHeight: 34 },
  headerDelete: { fontSize: 20, textAlign: "right" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle:  { color: "#FFF", fontSize: FontSize.lg, fontWeight: "600" },
  headerDate:   { color: "rgba(255,255,255,0.75)", fontSize: FontSize.xs, marginTop: 2 },
  section:      { backgroundColor: t.bg ?? "#FFFFFF" },
  noteInput:    { borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, minHeight: 100, lineHeight: 22 },
  legend:       { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.lg },
  legendDots:   { flexDirection: "row", gap: 4 },
  legendDot:    { width: 12, height: 12, borderRadius: 6 },
  legendText:   { fontSize: FontSize.xs },
  bottomWrap:   { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, backgroundColor: t.bg ?? "#FFFFFF", borderTopWidth: 1, borderTopColor: t.border },
  saveBtn:      { width: "100%", height: 46, borderRadius: 8, borderWidth: 1, borderColor: t.accentLight ?? "#7AABDB", overflow: "hidden" },
  saveBtnGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  saveBtnText:  { color: "#FFF", fontSize: FontSize.md, fontWeight: "800", letterSpacing: 1.5 },
});