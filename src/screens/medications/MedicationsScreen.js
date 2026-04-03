import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Spacing, FontSize } from "../../theme";
import { medsApi } from "../../api";

const ADHD_MEDICATIONS = [
  {
    id: "methylphenidate",
    name: "Methylphenidate",
    brand: "Ritalin, Concerta",
  },
  {
    id: "lisdexamfetamine",
    name: "Lisdexamfetamine",
    brand: "Vyvanse, Elvanse",
  },
  { id: "amphetamine", name: "Amphetamine", brand: "Adderall" },
  { id: "dextroamphetamine", name: "Dextroamphetamine", brand: "Dexedrine" },
  { id: "atomoxetine", name: "Atomoxetine", brand: "Strattera" },
  { id: "guanfacine", name: "Guanfacine", brand: "Intuniv" },
  { id: "clonidine", name: "Clonidine", brand: "Kapvay" },
  { id: "bupropion", name: "Bupropion", brand: "Wellbutrin" },
  { id: "viloxazine", name: "Viloxazine", brand: "Qelbree" },
  { id: "modafinil", name: "Modafinil", brand: "Provigil" },
  { id: "dexmethylphenidate", name: "Dexmethylphenidate", brand: "Focalin" },
  { id: "other", name: "Other / Not listed", brand: "" },
];

export default function MedicationsScreen({ navigation }) {
  const { theme } = useTheme(); // ← theme, not colors
  const { user, updateUser } = useAuth();

  const [selected, setSelected] = useState(new Set(user?.medications ?? []));
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ADHD_MEDICATIONS;
    return ADHD_MEDICATIONS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q),
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
      const client = (await import("../../api/client")).default;
      const res = await client.patch("/api/patient/medications/bulk", {
        medications: [...selected],
      });
      console.log("Save response:", res.data);
      updateUser({ ...user, medications: [...selected] });
      navigation.goBack();
    } catch (e) {
      console.log("Save error full:", JSON.stringify(e?.response?.data));
      console.log("Save error status:", e?.response?.status);
      console.log("Save error message:", e?.message);
      Alert.alert(
        "Error",
        e?.response?.data?.message ||
          e?.message ||
          "Could not save medications.",
      );
    } finally {
      setSaving(false);
    }
  };

  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Medications</Text>
        <TouchableOpacity onPress={save} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={theme.accent} />
          ) : (
            <Text style={s.saveBtn}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <Text style={s.subtitle}>
        Select all medications you are currently using
      </Text>

      {/* Search */}
      <View style={s.searchRow}>
        <Ionicons
          name="search-outline"
          size={18}
          color={theme.textMuted}
          style={{ marginRight: 8 }}
        />
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

      {/* Selected count */}
      {selected.size > 0 && (
        <Text style={s.selectedCount}>{selected.size} selected</Text>
      )}

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: 32,
        }}
        renderItem={({ item }) => {
          const active = selected.has(item.id);
          return (
            <TouchableOpacity
              style={[s.row, active && s.rowActive]}
              onPress={() => toggle(item.id)}
              activeOpacity={0.7}
            >
              <View style={s.rowText}>
                <Text style={[s.medName, active && s.medNameActive]}>
                  {item.name}
                </Text>
                {item.brand ? (
                  <Text style={s.medBrand}>{item.brand}</Text>
                ) : null}
              </View>
              <View style={[s.check, active && s.checkActive]}>
                {active && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    back: { color: t.text, fontSize: 30, marginRight: 8 },
    title: { color: t.text, fontSize: FontSize.lg, fontWeight: "600", flex: 1 },
    saveBtn: { color: t.accent, fontSize: FontSize.md, fontWeight: "600" },
    subtitle: {
      color: t.textMuted,
      fontSize: FontSize.sm,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.xs,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: Spacing.lg,
      marginVertical: Spacing.sm,
      backgroundColor: t.surface,
      borderRadius: 10,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderWidth: 1,
      borderColor: t.border,
    },
    searchInput: { flex: 1, color: t.text, fontSize: FontSize.md, padding: 0 },
    selectedCount: {
      color: t.accent,
      fontSize: FontSize.sm,
      fontWeight: "600",
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xs,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      marginBottom: Spacing.xs,
      borderRadius: 12,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
    },
    rowActive: { borderColor: t.accent, backgroundColor: t.accentBg },
    rowText: { flex: 1 },
    medName: { color: t.text, fontSize: FontSize.md, fontWeight: "500" },
    medNameActive: { color: t.accent, fontWeight: "600" },
    medBrand: { color: t.textMuted, fontSize: FontSize.sm, marginTop: 2 },
    check: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: t.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkActive: { backgroundColor: t.accent, borderColor: t.accent },
  });
}
