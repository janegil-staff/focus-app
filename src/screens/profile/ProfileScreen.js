import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { Spacing, FontSize, Radius } from "../../theme";
import api from "../../api/client";

const ALL_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "no", label: "Norsk", flag: "🇳🇴" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "da", label: "Dansk", flag: "🇩🇰" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "fi", label: "Suomi", flag: "🇫🇮" },
];

function FemaleIcon({ color }) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          borderWidth: 2.5,
          borderColor: color,
          marginBottom: 2,
        }}
      />
      <View
        style={{
          width: 28,
          height: 16,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          borderWidth: 2.5,
          borderColor: color,
          borderBottomWidth: 0,
        }}
      />
      <View
        style={{
          width: 36,
          height: 8,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          borderWidth: 2.5,
          borderColor: color,
          borderTopWidth: 0,
          marginTop: -1,
        }}
      />
    </View>
  );
}

function MaleIcon({ color }) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          borderWidth: 2.5,
          borderColor: color,
          marginBottom: 2,
        }}
      />
      <View
        style={{
          width: 28,
          height: 20,
          borderRadius: 4,
          borderWidth: 2.5,
          borderColor: color,
        }}
      />
    </View>
  );
}

function UndefinedIcon({ color }) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
      }}
    >
      <Text style={{ color, fontSize: 28, fontWeight: "300", lineHeight: 32 }}>
        ?
      </Text>
    </View>
  );
}

const GENDERS = [
  { value: "female", labelKey: "female", Icon: FemaleIcon },
  { value: "male", labelKey: "male", Icon: MaleIcon },
  { value: "undefined", labelKey: "undefined", Icon: UndefinedIcon },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout, logoutAndClearPin, updateUser } = useAuth();
  const { theme, override, setTheme } = useTheme();
  const { t } = useLang();
  const insets = useSafeAreaInsets();

  const [gender, setGender] = useState(user?.gender ?? "undefined");
  const [ageVal, setAgeVal] = useState(String(user?.age ?? ""));
  const [saving, setSaving] = useState(false);

  const originalAge = String(user?.age ?? "");
  const originalGender = user?.gender ?? "undefined";
  const isDirty = ageVal !== originalAge || gender !== originalGender;

  const currentLang =
    ALL_LANGUAGES.find((l) => l.code === (user?.language ?? "no")) ??
    ALL_LANGUAGES[1];
  const email = user?.email ?? "—";

  useEffect(() => {
    api
      .get("/api/patient/profile")
      .then((res) => {
        if (res.data?.data) {
          updateUser(res.data.data);
          setGender(res.data.data.gender ?? "undefined");
          setAgeVal(String(res.data.data.age ?? ""));
        }
      })
      .catch(() => {});
  }, []);

  const saveChanges = async () => {
    setSaving(true);
    try {
      const body = {};
      if (ageVal) body.age = parseInt(ageVal);
      if (gender && gender !== "undefined") body.gender = gender;
      const res = await api.put("/api/patient/profile", body);
      if (res.data?.data) updateUser(res.data.data);
      Alert.alert(t.saved, t.profileUpdated);
    } catch {
      Alert.alert("Error", "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      Alert.alert(t.saveChanges, t.unsavedChanges, [
        {
          text: t.discard,
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
        {
          text: t.save,
          style: "default",
          onPress: async () => {
            await saveChanges();
            navigation.goBack();
          },
        },
        { text: t.cancel, style: "cancel" },
      ]);
    } else {
      navigation.goBack();
    }
  };

  const themeLabel =
    override === "dark"
      ? "🌙 Dark"
      : override === "light"
        ? "☀️ Light"
        : "⚙️ System";
  const cycleTheme = () => {
    if (!override || override === "system") setTheme("light");
    else if (override === "light") setTheme("dark");
    else setTheme("system");
  };

  const handleLogout = () =>
    Alert.alert(t.signOut, t.signOutMsg, [
      { text: t.cancel, style: "cancel" },
      { text: t.signOut, style: "destructive", onPress: logout },
    ]);

  const handleClearPin = () =>
    Alert.alert(t.signOutClearPin, t.clearPinMsg, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.signOutClearPin,
        style: "destructive",
        onPress: logoutAndClearPin,
      },
    ]);

  const s = makeStyles(theme, insets);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={handleBack} style={s.headerBtn}>
          <Text style={s.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.settings}</Text>
        <TouchableOpacity style={s.headerBtn} onPress={handleLogout}>
          <Text style={s.headerLogout}>⎋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Gender */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.chooseGender}</Text>
          <View style={s.genderRow}>
            {GENDERS.map(({ value, labelKey, Icon }) => {
              const isSelected = gender === value;
              const iconColor = isSelected ? "#FFFFFF" : theme.accent;
              return (
                <TouchableOpacity
                  key={value}
                  style={s.genderItem}
                  onPress={() => setGender(value)}
                >
                  <View
                    style={[s.genderCircle, isSelected && s.genderCircleActive]}
                  >
                    <Icon color={iconColor} />
                  </View>
                  <Text
                    style={[s.genderLabel, isSelected && s.genderLabelActive]}
                  >
                    {t[labelKey]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.gap} />

        {/* Age + Email */}
        <View style={s.section}>
          <View style={s.editFieldWrap}>
            <Text style={s.fieldLabel}>{t.age}</Text>
            <TextInput
              style={s.editFieldInput}
              value={ageVal}
              onChangeText={(v) => setAgeVal(v.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              placeholder="—"
              placeholderTextColor={theme.textMuted}
              selectionColor={theme.accent}
            />
          </View>
          <View style={s.fieldLineFull} />

          <View style={s.fieldWrap}>
            <View>
              <Text style={s.fieldLabel}>{t.email}</Text>
              <Text style={s.fieldValue}>{email}</Text>
            </View>
            <TouchableOpacity>
              <Text style={s.fieldChange}>{t.change} ›</Text>
            </TouchableOpacity>
          </View>
          <View style={s.fieldLine} />
        </View>

        <View style={s.gap} />

        {/* Settings rows */}
        <View style={s.section}>
          <Row
            label={t.personalSettings}
            value={t.change}
            onPress={() => {}}
            theme={theme}
          />
          <Row
            label={t.appearance}
            value={themeLabel}
            onPress={cycleTheme}
            theme={theme}
          />
          <Row
            label={t.language}
            value={`${currentLang.flag} ${currentLang.label}`}
            onPress={() => navigation.navigate("Language")}
            theme={theme}
          />
          <Row
            label={t.pin}
            value={t.change}
            onPress={() => navigation.navigate("PinSetup")}
            theme={theme}
          />
          <Row
            label={t.termsConditions}
            value={t.view}
            onPress={() => {}}
            theme={theme}
          />
          <Row
            label={t.about}
            value={t.readMore}
            onPress={() => {}}
            theme={theme}
            last
          />
        </View>

        <View style={s.gap} />

        {/* Sign out */}
        <View style={s.section}>
          <TouchableOpacity style={s.signOutRow} onPress={handleLogout}>
            <Text style={s.signOutText}>{t.signOut}</Text>
          </TouchableOpacity>
          <View style={s.fieldLine} />
          <TouchableOpacity style={s.signOutRow} onPress={handleClearPin}>
            <Text style={s.clearText}>{t.signOutClearPin}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, onPress, theme, last }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <Text style={{ color: theme.text, fontSize: FontSize.md }}>{label}</Text>
      <Text style={{ color: theme.textMuted, fontSize: FontSize.md }}>
        {value} ›
      </Text>
    </TouchableOpacity>
  );
}

const makeStyles = (t, insets) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.bgSecondary },

    header: {
      backgroundColor: t.accent,
      paddingTop: insets.top + Spacing.sm,
      paddingBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      flexDirection: "row",
      alignItems: "center",
    },
    headerBtn: { width: 40 },
    headerBack: { color: "#FFFFFF", fontSize: 28, lineHeight: 34 },
    headerLogout: { color: "#FFFFFF", fontSize: 22, textAlign: "right" },
    headerTitle: {
      flex: 1,
      color: "#FFFFFF",
      fontSize: FontSize.lg,
      fontWeight: "600",
      textAlign: "center",
    },

    section: { backgroundColor: t.bg },
    gap: { height: Spacing.lg, backgroundColor: t.bgSecondary },

    sectionTitle: {
      color: t.text,
      fontSize: FontSize.md,
      fontWeight: "500",
      paddingHorizontal: 20,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.md,
    },

    genderRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingHorizontal: 20,
      paddingBottom: Spacing.xl,
    },
    genderItem: { alignItems: "center", gap: 8 },
    genderCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: t.accentBg,
      justifyContent: "center",
      alignItems: "center",
    },
    genderCircleActive: { backgroundColor: t.accent },
    genderLabel: { color: t.textSecondary, fontSize: FontSize.md },
    genderLabelActive: { color: t.text, fontWeight: "700" },

    fieldWrap: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 10,
    },
    fieldLabel: { color: t.textMuted, fontSize: FontSize.sm, marginBottom: 2 },
    editFieldWrap: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 0 },
    editFieldInput: {
      color: t.text,
      fontSize: FontSize.lg,
      fontWeight: "500",
      paddingBottom: 10,
      paddingHorizontal: 0,
    },
    fieldLineFull: { height: 1.5, backgroundColor: t.border, width: "100%" },
    fieldValue: { color: t.text, fontSize: FontSize.lg, fontWeight: "500" },
    fieldLine: { height: 1, backgroundColor: t.border, marginLeft: 20 },
    fieldChange: { color: t.textMuted, fontSize: FontSize.md },

    signOutRow: { paddingVertical: 15, paddingHorizontal: 20 },
    signOutText: { color: t.accent, fontSize: FontSize.md, fontWeight: "500" },
    clearText: { color: "#EF4444", fontSize: FontSize.md },
  });
