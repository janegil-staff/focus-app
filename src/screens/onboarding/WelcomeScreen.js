import React from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Dimensions, SafeAreaView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { FontSize, Spacing } from '../../theme';

const { width, height } = Dimensions.get('window');
const ACCENT = '#1A56DB';
const DARK   = '#111111';
const MUTED  = 'rgba(0,0,0,0.5)';

export default function WelcomeScreen({ navigation, standalone }) {
  const { setIsNewUser } = useAuth();

  const handleStart = () => {
    setIsNewUser(false);
    // If used inside AppStack, navigate to Home
    if (!standalone && navigation) {
      navigation.replace('Home');
    }
    // If standalone (rendered by RootNavigator), setIsNewUser(false)
    // automatically causes RootNavigator to render AppStack
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Image
            source={require('../../../assets/images/focus_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>FocusApp</Text>
          <Text style={styles.tagline}>ADHD Daily Tracker</Text>
        </View>

        <View style={styles.mid}>
          <Image
            source={require('../../../assets/images/welcome.png')}
            style={styles.illustration}
            resizeMode="contain"
            onError={() => {}}
          />
        </View>

        <View style={styles.bottom}>
          <Text style={styles.welcomeTitle}>Welcome! 👋</Text>
          <Text style={styles.welcomeText}>
            FocusApp helps you track your daily mood, focus, sleep and energy —
            giving you and your doctor a clear picture of how ADHD affects your
            everyday life.
          </Text>
          <Text style={styles.welcomeText}>
            Log once a day, see your patterns over time, and share insights with
            your clinician.
          </Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleStart} activeOpacity={0.85}>
          <Text style={styles.btnText}>LET'S GET STARTED</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 30, paddingTop: 20, paddingBottom: 36, justifyContent: 'space-between' },
  top:       { alignItems: 'center' },
  logo:      { width: 80, height: 80, borderRadius: 0, marginBottom: 8 },
  appName:   { color: DARK, fontSize: FontSize.xl, fontWeight: '700', letterSpacing: 0.5 },
  tagline:   { color: MUTED, fontSize: FontSize.xs, letterSpacing: 2, marginTop: 2 },
  mid:       { alignItems: 'center' },
  illustration: { width: width * 0.75, height: height * 0.25 },
  bottom:    { gap: 12 },
  welcomeTitle: { color: DARK, fontSize: FontSize.xl, fontWeight: '700', marginBottom: 4 },
  welcomeText:  { color: MUTED, fontSize: FontSize.md, lineHeight: 24 },
  btn: {
    width: '100%', height: 56,
    backgroundColor: ACCENT, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: ACCENT, shadowOpacity: 0.4,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  btnText: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '800', letterSpacing: 2 },
});