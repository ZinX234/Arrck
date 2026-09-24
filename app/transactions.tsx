import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { WalletService, WalletTransaction } from '@/lib/walletStore';

export default function TransactionsScreen() {
  const [address, setAddress] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const addr = await WalletService.getStoredAddress();
    setAddress(addr);
    if (addr) {
      const txs = await WalletService.fetchTransactions(addr);
      setTransactions(txs);
    } else {
      setTransactions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openExplorer = (sig: string) => {
    WebBrowser.openBrowserAsync(`https://solscan.io/tx/${sig}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7800C8', '#35006F', '#170025', '#08000F']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>TRANSACTIONS</Text>
          <Pressable onPress={loadData} style={styles.refreshBtn}>
            <Ionicons name="reload" size={16} color="#FFF" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.banner}>
            <Ionicons name="finger-print" size={20} color="#FF008C" />
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerTitle}>Verified Solana History</Text>
              <Text style={styles.bannerSub}>
                {address
                  ? `Wallet: ${address.slice(0, 8)}...${address.slice(-6)}`
                  : 'No wallet connected. Tap Wallet to connect.'}
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#FF008C" />
              <Text style={styles.loadingText}>Fetching Solana RPC records...</Text>
            </View>
          ) : transactions.length > 0 ? (
            <View style={styles.list}>
              {transactions.map((tx) => (
                <Pressable
                  key={tx.signature}
                  onPress={() => openExplorer(tx.signature)}
                  style={styles.txCard}
                >
                  <View style={styles.txLeft}>
                    <View style={styles.txIcon}>
                      <Ionicons
                        name={tx.err ? 'close-circle' : 'checkmark-circle'}
                        size={20}
                        color={tx.err ? '#FF3B30' : '#00FF88'}
                      />
                    </View>
                    <View style={styles.txDetails}>
                      <Text style={styles.txSignature}>
                        {tx.signature.slice(0, 10)}...{tx.signature.slice(-8)}
                      </Text>
                      <Text style={styles.txSlot}>Slot #{tx.slot}</Text>
                    </View>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={styles.statusPill}>
                      {tx.err ? 'Failed' : 'Success'}
                    </Text>
                    <Ionicons name="open-outline" size={14} color="rgba(255,255,255,0.5)" />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="file-tray-outline" size={48} color="rgba(255, 255, 255, 0.2)" />
              <Text style={styles.emptyTitle}>Nothing here yet.</Text>
              <Text style={styles.emptySub}>
                {address
                  ? 'No on-chain transactions found for this account.'
                  : 'Connect your Phantom wallet on the main screen to display genuine activity.'}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08000F' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 0, 140, 0.1)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 140, 0.25)',
    marginBottom: 20,
  },
  bannerTextWrap: { flex: 1 },
  bannerTitle: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  bannerSub: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 },
  centerBox: { alignItems: 'center', marginTop: 60, gap: 12 },
  loadingText: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 12 },
  list: { gap: 10 },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDetails: { gap: 2 },
  txSignature: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  txSlot: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 11 },
  txRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusPill: { color: '#00FF88', fontSize: 11, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 10, paddingHorizontal: 30 },
  emptyTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  emptySub: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, textAlign: 'center', lineHeight: 18 },
});