import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

// Curated Pexels architectural & interior imagery
const PEXELS_PHOTO_INTERIOR = 'https://images.pexels.com/photos/8146213/pexels-photo-8146213.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200';
const PEXELS_PHOTO_LOUNGE = 'https://images.pexels.com/photos/10267196/pexels-photo-10267196.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200';

export default function ApplyScreen() {
  const handleApplyNow = () => {
    WebBrowser.openBrowserAsync('https://makeform.ai/f/UnLi25b6');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#004D40', '#00242C', '#0B0014', '#040008']}
        locations={[0, 0.25, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>EXCLUSIVE MEMBERSHIP</Text>
          </View>
          <Text style={styles.headline}>The Arrck Card</Text>
          <Text style={styles.subheadline}>
            Zero cross-border friction. Settle global fiat payments straight from your Solana wallet with ultra-high limits.
          </Text>

          {/* Green-to-Blue Holographic Card Graphic */}
          <View style={styles.holoCardWrapper}>
            <LinearGradient
              colors={['#00F5A0', '#00D9F5', '#0A2540', '#010E1B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.holoCard}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.holoBrand}>ARRCK</Text>
                  <Text style={styles.holoTier}>FOUNDERS EDITION</Text>
                </View>
                <Ionicons name="wifi" size={24} color="#FFF" />
              </View>

              <View style={styles.cardMid}>
                <View style={styles.chipGlow}>
                  <Ionicons name="hardware-chip-outline" size={26} color="#FFF" />
                </View>
                <Text style={styles.visaMark}>VISA</Text>
              </View>

              <View style={styles.cardFoot}>
                <Text style={styles.cardUser}>PREMIUM CRYPTO TIER</Text>
                <Text style={styles.cardExp}>12/29</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Apply CTA */}
          <Pressable onPress={handleApplyNow} style={styles.applyBtn}>
            <LinearGradient
              colors={['#00F5A0', '#00D9F5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyBtnGradient}
            >
              <Text style={styles.applyBtnText}>APPLY NOW</Text>
              <Ionicons name="arrow-forward" size={18} color="#000" />
            </LinearGradient>
          </Pressable>

          {/* Curated Lifestyle Imagery 1 */}
          <View style={styles.featureCard}>
            <Image
              source={{ uri: PEXELS_PHOTO_INTERIOR }}
              style={styles.curatedImage}
              resizeMode="cover"
            />
            <View style={styles.featureBody}>
              <Text style={styles.featureTitle}>Private Concierge & Architecture</Text>
              <Text style={styles.featureDesc}>
                Complimentary access to luxury accommodations, private charter settlements, and bespoke concierge desks worldwide.
              </Text>
            </View>
          </View>

          {/* Curated Lifestyle Imagery 2 */}
          <View style={styles.featureCard}>
            <Image
              source={{ uri: PEXELS_PHOTO_LOUNGE }}
              style={styles.curatedImage}
              resizeMode="cover"
            />
            <View style={styles.featureBody}>
              <Text style={styles.featureTitle}>Global VIP Lounges</Text>
              <Text style={styles.featureDesc}>
                Instant lounge validation at over 1,400 airports across 140 countries with your contactless Arrck virtual card.
              </Text>
            </View>
          </View>

          {/* Compliance & Disclaimers */}
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              • Arrck is not a licensed payment provider.{'\n'}
              • Card/payment data may be routed through trusted partners.{'\n'}
              • Arrck does not sell or share data except on the user's behalf.{'\n'}
              • Arrck does not have access to the user's money.{'\n'}
              • Physical cards will be supported soon.
            </Text>
            <Text style={styles.attributionText}>Photos provided by Pexels</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#040008' },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  badgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 245, 160, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 160, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgeText: { color: '#00F5A0', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  headline: { color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  subheadline: { color: 'rgba(255, 255, 255, 0.65)', fontSize: 13, lineHeight: 20, marginBottom: 20 },
  holoCardWrapper: {
    width: '100%',
    height: 200,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 160, 0.5)',
    shadowColor: '#00F5A0',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: 20,
  },
  holoCard: { flex: 1, padding: 20, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  holoBrand: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 3 },
  holoTier: { color: '#00F5A0', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  cardMid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chipGlow: {
    width: 42,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaMark: { color: '#FFF', fontSize: 22, fontWeight: '900', fontStyle: 'italic' },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardUser: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  cardExp: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  applyBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  applyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  applyBtnText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  curatedImage: { width: '100%', height: 160 },
  featureBody: { padding: 14 },
  featureTitle: { color: '#FFF', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  featureDesc: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, lineHeight: 18 },
  disclaimerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 8,
  },
  disclaimerText: { color: 'rgba(255, 255, 255, 0.45)', fontSize: 11, lineHeight: 18 },
  attributionText: { color: 'rgba(255, 255, 255, 0.3)', fontSize: 10, marginTop: 10 },
});