import React, { useState, useMemo, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, ActivityIndicator, Alert, Modal, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Spacing, FontSize } from "../../theme";
import client from "../../api/client";

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

const FREQUENCIES = [
  { id: "daily",             label: "Once daily" },
  { id: "twice_daily",       label: "Twice daily" },
  { id: "three_times_daily", label: "3× daily" },
  { id: "weekly",            label: "Weekly" },
  { id: "as_needed",         label: "As needed" },
];

const EMPTY_FORM = {
  name: "", dosage: "", frequency: "daily",
  startDate: new Date().toISOString().split("T")[0],
  prescribedBy: "", notes: "",
};

export default function MedicationsScreen({ navigation }) {
  const { theme }            = useTheme();
  const { user, updateUser } = useAuth();

  const [selected, setSelected]     = useState(new Set());
  const [custom, setCustom]         = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // ── Load both preset selections and custom meds ───────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, medsRes] = await Promise.all([
          client.get("/api/patient/profile", { params: { _t: Date.now() } }),
          client.get("/api/patient/medications?active=true"),
        ]);
        const bulkIds = profileRes.data?.data?.medications ?? [];
        const dbMeds  = medsRes.data?.data ?? [];
        setSelected(new Set(bulkIds));
        setCustom(dbMeds);
      } catch (e) {
        console.log("Load error:", e?.response?.data ?? e?.message);
        setSelected(new Set(user?.medications ?? []));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ADHD_MEDICATIONS;
    return ADHD_MEDICATIONS.filter(
      (m) => m.name.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q)
    );
  }, [search]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await client.patch("/api/patient/medications/bulk", { medications: [...selected] });
      updateUser({ ...user, medications: [...selected] });
      navigation.goBack();
    } catch (e) {
      console.log("Save error:", e?.response?.data ?? e?.message);
      Alert.alert("Error", e?.response?.data?.error || "Could not save medications.");
    } finally {
      setSaving(false);
    }
  };

  const submitCustom = async () => {
    if (!form.name.trim())   return Alert.alert("Required", "Please enter a medication name.");
    if (!form.dosage.trim()) return Alert.alert("Required", "Please enter a dosage.");
    setSubmitting(true);
    try {
      const res = await client.post("/api/patient/medications", {
        name:         form.name.trim(),
        dosage:       form.dosage.trim(),
        frequency:    form.frequency,
        startDate:    form.startDate,
        prescribedBy: form.prescribedBy.trim(),
        notes:        form.notes.trim(),
      });
      setCustom((prev) => [res.data.data, ...prev]);
      setForm(EMPTY_FORM);
      setShowModal(false);
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.error || "Could not add medication.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCustom = (id, name) => {
    Alert.alert("Remove medication", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          try {
            await client.delete(`/api/patient/medications/${id}`);
            setCustom((prev) => prev.filter((m) => m._id !== id));
          } catch {
            Alert.alert("Error", "Could not remove medication.");
          }
        },
      },
    ]);
  };

  const s = makeStyles(theme);

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>‹</Text>
          </TouchableOpacity>
          <Text style={s.title}>Medications</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Medications</Text>
        <TouchableOpacity onPress={save} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color={theme.accent} />
            : <Text style={s.saveBtn}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Custom medications ──────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>My Medications</Text>
            <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={s.addBtnText}>Add custom</Text>
            </TouchableOpacity>
          </View>

          {custom.length === 0 ? (
            <View style={s.emptyCustom}>
              <Ionicons name="medkit-outline" size={28} color={theme.textMuted} />
              <Text style={s.emptyCustomText}>No custom medications yet</Text>
            </View>
          ) : (
            custom.map((med) => (
              <View key={med._id} style={s.customRow}>
                <View style={s.customIcon}>
                  <Ionicons name="medkit" size={16} color={theme.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.customName}>{med.name}</Text>
                  <Text style={s.customMeta}>
                    {med.dosage}
                    {med.frequency ? ` · ${FREQUENCIES.find(f => f.id === med.frequency)?.label ?? med.frequency}` : ""}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteCustom(med._id, med.name)} style={{ padding: 4 }}>
                  <Ionicons name="trash-outline" size={18} color={theme.scoreLow ?? "#EF4444"} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* ── Preset medications ──────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Common ADHD Medications</Text>
          <Text style={s.subtitle}>Select all medications you are currently using</Text>

          {/* Search */}
          <View style={s.searchRow}>
            <Ionicons name="search-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={s.searchInput}
              placeholder="Search medications..."
              placeholderTextColor={theme.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {selected.size > 0 && (
            <Text style={s.selectedCount}>{selected.size} selected</Text>
          )}

          {filtered.map((item) => {
            const active = selected.has(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[s.row, active && s.rowActive]}
                onPress={() => toggle(item.id)}
                activeOpacity={0.7}
              >
                <View style={s.rowText}>
                  <Text style={[s.medName, active && s.medNameActive]}>{item.name}</Text>
                  {item.brand ? <Text style={s.medBrand}>{item.brand}</Text> : null}
                </View>
                <View style={[s.check, active && s.checkActive]}>
                  {active && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* ── Add custom medication modal ─────────────────────────────────────── */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Medication</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); setForm(EMPTY_FORM); }}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.fieldLabel}>Medication name *</Text>
              <TextInput
                style={s.fieldInput}
                placeholder="e.g. Ritalin"
                placeholderTextColor={theme.textMuted}
                value={form.name}
                onChangeText={(v) => setForm(f => ({ ...f, name: v }))}
              />

              <Text style={s.fieldLabel}>Dosage *</Text>
              <TextInput
                style={s.fieldInput}
                placeholder="e.g. 10mg"
                placeholderTextColor={theme.textMuted}
                value={form.dosage}
                onChangeText={(v) => setForm(f => ({ ...f, dosage: v }))}
              />

              <Text style={s.fieldLabel}>Frequency</Text>
              <View style={s.freqRow}>
                {FREQUENCIES.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={[s.freqChip, form.frequency === f.id && s.freqChipActive]}
                    onPress={() => setForm(prev => ({ ...prev, frequency: f.id }))}
                  >
                    <Text style={[s.freqChipText, form.frequency === f.id && s.freqChipTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.fieldLabel}>Start date</Text>
              <TextInput
                style={s.fieldInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
                value={form.startDate}
                onChangeText={(v) => setForm(f => ({ ...f, startDate: v }))}
              />

              <Text style={s.fieldLabel}>Prescribed by</Text>
              <TextInput
                style={s.fieldInput}
                placeholder="Doctor's name (optional)"
                placeholderTextColor={theme.textMuted}
                value={form.prescribedBy}
                onChangeText={(v) => setForm(f => ({ ...f, prescribedBy: v }))}
              />

              <Text style={s.fieldLabel}>Notes</Text>
              <TextInput
                style={[s.fieldInput, { height: 80, textAlignVertical: "top" }]}
                placeholder="Any additional notes..."
                placeholderTextColor={theme.textMuted}
                value={form.notes}
                onChangeText={(v) => setForm(f => ({ ...f, notes: v }))}
                multiline
              />

              <TouchableOpacity style={s.submitBtn} onPress={submitCustom} disabled={submitting}>
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.submitBtnText}>Save Medication</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    safe:     { flex: 1, backgroundColor: t.bg },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
      borderBottomWidth: 1, borderBottomColor: t.border,
    },
    back:    { color: t.text, fontSize: 30, marginRight: 8 },
    title:   { color: t.text, fontSize: FontSize.lg, fontWeight: "600", flex: 1 },
    saveBtn: { color: t.accent, fontSize: FontSize.md, fontWeight: "600" },

    section:       { marginHorizontal: Spacing.lg, marginTop: Spacing.lg },
    sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.sm },
    sectionTitle:  { color: t.text, fontSize: FontSize.md, fontWeight: "700" },
    subtitle:      { color: t.textMuted, fontSize: FontSize.sm, marginBottom: Spacing.sm },

    addBtn:     { flexDirection: "row", alignItems: "center", backgroundColor: t.accent, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
    addBtnText: { color: "#fff", fontSize: FontSize.sm, fontWeight: "600" },

    emptyCustom:     { alignItems: "center", paddingVertical: Spacing.lg, gap: 8 },
    emptyCustomText: { color: t.textMuted, fontSize: FontSize.sm },

    customRow:  { flexDirection: "row", alignItems: "center", backgroundColor: t.surface, borderRadius: 12, borderWidth: 1, borderColor: t.border, padding: Spacing.md, marginBottom: Spacing.xs, gap: Spacing.sm },
    customIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: t.accentBg, alignItems: "center", justifyContent: "center" },
    customName: { color: t.text, fontSize: FontSize.md, fontWeight: "600" },
    customMeta: { color: t.textMuted, fontSize: FontSize.sm, marginTop: 2 },

    searchRow:     { flexDirection: "row", alignItems: "center", backgroundColor: t.surface, borderRadius: 10, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: t.border, marginBottom: Spacing.sm },
    searchInput:   { flex: 1, color: t.text, fontSize: FontSize.md, padding: 0 },
    selectedCount: { color: t.accent, fontSize: FontSize.sm, fontWeight: "600", marginBottom: Spacing.xs },

    row:           { flexDirection: "row", alignItems: "center", paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, marginBottom: Spacing.xs, borderRadius: 12, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border },
    rowActive:     { borderColor: t.accent, backgroundColor: t.accentBg },
    rowText:       { flex: 1 },
    medName:       { color: t.text, fontSize: FontSize.md, fontWeight: "500" },
    medNameActive: { color: t.accent, fontWeight: "600" },
    medBrand:      { color: t.textMuted, fontSize: FontSize.sm, marginTop: 2 },
    check:         { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: t.border, alignItems: "center", justifyContent: "center" },
    checkActive:   { backgroundColor: t.accent, borderColor: t.accent },

    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalSheet:   { backgroundColor: t.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, maxHeight: "90%", paddingBottom: 40 },
    modalHeader:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.lg },
    modalTitle:   { color: t.text, fontSize: FontSize.lg, fontWeight: "700" },

    fieldLabel: { color: t.textMuted, fontSize: FontSize.sm, fontWeight: "600", marginBottom: 6, marginTop: Spacing.sm },
    fieldInput: { backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 10, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, color: t.text, fontSize: FontSize.md },

    freqRow:           { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: Spacing.xs },
    freqChip:          { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface },
    freqChipActive:    { backgroundColor: t.accent, borderColor: t.accent },
    freqChipText:      { color: t.textMuted, fontSize: FontSize.sm },
    freqChipTextActive:{ color: "#fff", fontWeight: "600" },

    submitBtn:     { backgroundColor: t.accent, borderRadius: 12, padding: Spacing.md, alignItems: "center", marginTop: Spacing.lg },
    submitBtnText: { color: "#fff", fontSize: FontSize.md, fontWeight: "700" },
  });
}