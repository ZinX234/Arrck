import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Rect } from 'react-native-svg';
import { WalletService, TokenAsset, WalletTransaction } from '@/lib/walletStore';

export default function WalletScreen() {
  const [address, setAddress] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  
  // Modals
  const [modalType, setModalType] = useState<'send' | 'receive' | 'addCard' | 'connect' | null>(null);
  const [inputAddress, setInputAddress] = useState('');
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const syncWallet = async (addr: string | null) => {
    setSyncing(true);
    const p = await WalletService.fetchPrices();
    setPrices(p);
    if (addr) {
      const bal = await WalletService.fetchSolBalance(addr);
      setSolBalance(bal);
      const txs = await WalletService.fetchTransactions(addr);
      setTransactions(txs);
    } else {
      setSolBalance(0);
      setTransactions([]);
    }
    setSyncing(false);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const saved = await WalletService.getStoredAddress();
      setAddress(saved);
      await syncWallet(saved);
      setLoading(false);
    })();
  }, []);

  const totalBalanceUsd = useMemo(() => {
    if (!address) return 0;
    return solBalance * (prices.SOL || 0);
  }, [address, solBalance, prices]);

  const handleConnect = async () => {
    if (inputAddress.trim().length >= 32) {
      const clean = inputAddress.trim();
      await WalletService.setStoredAddress(clean);
      setAddress(clean);
      setInputAddress('');
      setModalType(null);
      await syncWallet(clean);
    } else {
      await WalletService.connectPhantom();
    }
  };

  const handleDisconnect = async () => {
    await WalletService.setStoredAddress(null);
    setAddress(null);
    await syncWallet(null);
  };

  const handlePay = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActionNotice('Launching Google Wallet Contactless...');
    await WalletService.launchGoogleWallet();
    setTimeout(() => setActionNotice(null), 3000);
  };

  const tokens: TokenAsset[] = [
    { symbol: 'SOL', name: 'Solana', balance: solBalance, usdPrice: prices.SOL || 0, icon: 'logo-bitcoin' },
    { symbol: 'USDC', name: 'USD Coin', balance: address ? 0 : 0, usdPrice: prices.USDC || 1, icon: 'cash-outline' },
    { symbol: 'BONK', name: 'Bonk', balance: address ? 0 : 0, usdPrice: prices.BONK || 0, icon: 'flame-outline' },
    { symbol: 'JUP', name: 'Jupiter', balance: address ? 0 : 0, usdPrice: prices.JUP || 0, icon: 'planet-outline' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF0066', '#7800C8', '#35006F', '#170025', '#08000F']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoLetter}>A</Text>
            </View>
            <Text style={styles.wordmark}>ARRCK</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              onPress={() => syncWallet(address)}
              style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
            >
              {syncing ? (
                <ActivityIndicator size="small" color="#FF008C" />
              ) : (
                <Ionicons name="refresh" size={18} color="#FFF" />
              )}
            </Pressable>
            <Pressable
              onPress={() => setModalType('connect')}
              style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
            >
              <Ionicons name="person-circle-outline" size={20} color="#FFF" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {actionNotice && (
            <View style={styles.noticeBanner}>
              <Ionicons name="radio-outline" size={16} color="#FF008C" />
              <Text style={styles.noticeText}>{actionNotice}</Text>
            </View>
          )}

          {/* ARRCK Black Card */}
          <View style={styles.cardContainer}>
            <LinearGradient
              colors={['#1F0328', '#0D0014', '#040008']}
              style={styles.cardGlass}
            >
              <LinearGradient
                colors={[
                  'rgba(255, 0, 140, 0.35)',
                  'rgba(120, 0, 200, 0.1)',
                  'rgba(0, 240, 255, 0.25)',
                  'rgba(255, 215, 0, 0.2)',
                  'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardTopRow}>
                <View style={styles.cardBrandGroup}>
                  <Text style={styles.cardLogo}>ARRCK</Text>
                  <Text style={styles.cardTier}>BLACK</Text>
                </View>
                <Ionicons name="wifi" size={24} color="rgba(255, 255, 255, 0.85)" />
              </View>

              <View style={styles.chipRow}>
                <View style={styles.emvChip}>
                  <View style={styles.chipLine} />
                </View>
                <Text style={styles.cardVirtualBadge}>SOLANA VIRTUAL</Text>
              </View>

              <View style={styles.cardBottomRow}>
                <View>
                  <Text style={styles.cardHolderLabel}>MEMBER SINCE</Text>
                  <Text style={styles.cardHolder}>2025</Text>
                </View>
                <View style={styles.cardNumGroup}>
                  <Text style={styles.cardDots}>•••• •••• ••••</Text>
                  <Text style={styles.cardLastFour}>
                    {address ? address.slice(-4) : '0000'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Total Balance */}
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
            <View style={styles.balanceRow}>
              {loading ? (
                <ActivityIndicator size="small" color="#FF008C" />
              ) : (
                <Text style={styles.balanceValue}>
                  ${totalBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              )}
              <View style={styles.primaryPill}>
                <Text style={styles.primaryPillText}>{solBalance.toFixed(3)} SOL</Text>
                <Ionicons name="chevron-forward" size={14} color="rgba(255, 255, 255, 0.6)" />
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsRow}>
            <Pressable onPress={handlePay} style={styles.actionBtn}>
              <View style={styles.actionIconRing}>
                <Ionicons name="radio" size={22} color="#FF008C" />
              </View>
              <Text style={styles.actionLabel}>PAY</Text>
            </Pressable>

            <Pressable onPress={() => setModalType('send')} style={styles.actionBtn}>
              <View style={styles.actionIconRing}>
                <Ionicons name="arrow-up" size={22} color="#D900A8" />
              </View>
              <Text style={styles.actionLabel}>SEND</Text>
            </Pressable>

            <Pressable onPress={() => setModalType('receive')} style={styles.actionBtn}>
              <View style={styles.actionIconRing}>
                <Ionicons name="arrow-down" size={22} color="#00E5FF" />
              </View>
              <Text style={styles.actionLabel}>RECEIVE</Text>
            </Pressable>

            <Pressable onPress={() => setModalType('addCard')} style={styles.actionBtn}>
              <View style={styles.actionIconRing}>
                <Ionicons name="add" size={22} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>ADD CARD</Text>
            </Pressable>
          </View>

          {/* Phantom Connection Status */}
          <Pressable
            onPress={() => setModalType('connect')}
            style={styles.phantomCard}
          >
            <View style={styles.phantomLeft}>
              <View style={styles.phantomIconWrap}>
                <Ionicons name="shield-checkmark" size={20} color="#AB9FF2" />
              </View>
              <View>
                <View style={styles.phantomStatusRow}>
                  <Text style={styles.phantomTitle}>
                    {address ? 'Phantom Connected' : 'Connect Phantom'}
                  </Text>
                  {address && <View style={styles.greenDot} />}
                </View>
                <Text style={styles.phantomSub} numberOfLines={1}>
                  {address ? `${address.slice(0, 6)}...${address.slice(-6)}` : 'Sync Solana balances & keys'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255, 255, 255, 0.5)" />
          </Pressable>

          {/* Crypto Assets */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CRYPTO ASSETS</Text>
          </View>
          <View style={styles.assetsList}>
            {tokens.map((token) => {
              const usdVal = token.balance * token.usdPrice;
              return (
                <View key={token.symbol} style={styles.assetRow}>
                  <View style={styles.assetLeft}>
                    <View style={styles.tokenIcon}>
                      <Ionicons name={token.icon as any} size={20} color="#FF008C" />
                    </View>
                    <View>
                      <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                      <Text style={styles.tokenName}>{token.name}</Text>
                    </View>
                  </View>
                  <View style={styles.assetRight}>
                    <Text style={styles.assetBalance}>{token.balance.toFixed(4)}</Text>
                    <Text style={styles.assetUsd}>
                      ${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
            <Pressable onPress={() => router.push('/transactions')}>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </Pressable>
          </View>

          <View style={styles.activityBox}>
            {transactions.length > 0 ? (
              transactions.slice(0, 3).map((tx) => (
                <View key={tx.signature} style={styles.activityRow}>
                  <View style={styles.activityLeft}>
                    <Ionicons name="swap-horizontal" size={18} color="#00E5FF" />
                    <View style={styles.activityMeta}>
                      <Text style={styles.txSig}>
                        {tx.signature.slice(0, 8)}...{tx.signature.slice(-6)}
                      </Text>
                      <Text style={styles.txStatus}>Confirmed on Solana</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
                </View>
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <Ionicons name="file-tray-outline" size={24} color="rgba(255,255,255,0.3)" />
                <Text style={styles.emptyText}>Nothing here yet.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Modal: Connect Phantom / Solana Address */}
        <Modal visible={modalType === 'connect'} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Phantom & Solana Wallet</Text>
              <Text style={styles.modalSub}>
                Connect via Phantom app or enter your Solana mainnet public address for real balance synchronization.
              </Text>
              {address ? (
                <View style={styles.connectedBox}>
                  <Text style={styles.connectedLabel}>CONNECTED ADDRESS</Text>
                  <Text style={styles.connectedAddress}>{address}</Text>
                  <Pressable onPress={handleDisconnect} style={styles.disconnectBtn}>
                    <Text style={styles.disconnectBtnText}>Disconnect Wallet</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <Pressable
                    onPress={() => WalletService.connectPhantom()}
                    style={styles.phantomDeepBtn}
                  >
                    <Ionicons name="shield-checkmark" size={18} color="#FFF" />
                    <Text style={styles.phantomDeepText}>Launch Phantom App</Text>
                  </Pressable>

                  <Text style={styles.orDivider}>— OR PASTE ADDRESS —</Text>

                  <TextInput
                    style={styles.textInput}
                    placeholder="Solana Public Address"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={inputAddress}
                    onChangeText={setInputAddress}
                    autoCapitalize="none"
                  />

                  <Pressable onPress={handleConnect} style={styles.modalPrimaryBtn}>
                    <Text style={styles.modalPrimaryText}>Confirm & Synchronize</Text>
                  </Pressable>
                </>
              )}
              <Pressable onPress={() => setModalType(null)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Modal: Receive */}
        <Modal visible={modalType === 'receive'} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Receive Crypto</Text>
              <Text style={styles.modalSub}>
                Send SOL or SPL tokens to your verified on-chain address.
              </Text>

              {address ? (
                <>
                  <View style={styles.qrPlaceholder}>
                    <Svg height="140" width="140">
                      <Rect x="10" y="10" width="40" height="40" fill="#FF008C" />
                      <Rect x="90" y="10" width="40" height="40" fill="#FF008C" />
                      <Rect x="10" y="90" width="40" height="40" fill="#FF008C" />
                      <Rect x="60" y="60" width="20" height="20" fill="#00E5FF" />
                      <Rect x="60" y="20" width="20" height="20" fill="#FFF" />
                      <Rect x="20" y="60" width="20" height="20" fill="#FFF" />
                    </Svg>
                  </View>
                  <Text style={styles.addressPill}>{address}</Text>

                  <Pressable
                    onPress={() => Share.share({ message: address })}
                    style={styles.modalPrimaryBtn}
                  >
                    <Text style={styles.modalPrimaryText}>Share Address</Text>
                  </Pressable>
                </>
              ) : (
                <View style={styles.emptyModalWrap}>
                  <Text style={styles.emptyText}>Connect wallet first to view your address.</Text>
                </View>
              )}

              <Pressable onPress={() => setModalType(null)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Modal: Send */}
        <Modal visible={modalType === 'send'} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Send Crypto</Text>
              <Text style={styles.modalSub}>Available: {solBalance.toFixed(4)} SOL</Text>

              <TextInput
                style={styles.textInput}
                placeholder="Recipient Solana Address"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={sendRecipient}
                onChangeText={setSendRecipient}
                autoCapitalize="none"
              />

              <TextInput
                style={styles.textInput}
                placeholder="Amount (SOL)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="numeric"
                value={sendAmount}
                onChangeText={setSendAmount}
              />

              <Pressable
                onPress={async () => {
                  if (!address) {
                    alert('Please connect Phantom first.');
                    return;
                  }
                  if (parseFloat(sendAmount || '0') > solBalance) {
                    alert('Insufficient balance.');
                    return;
                  }
                  await WalletService.connectPhantom();
                  setModalType(null);
                }}
                style={styles.modalPrimaryBtn}
              >
                <Text style={styles.modalPrimaryText}>Review & Sign in Phantom</Text>
              </Pressable>

              <Pressable onPress={() => setModalType(null)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Modal: Add Card */}
        <Modal visible={modalType === 'addCard'} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Add Payment Card</Text>
              <Text style={styles.modalSub}>
                Link your Google Wallet card or apply for an official Arrck Black Visa.
              </Text>

              <Pressable
                onPress={() => {
                  setModalType(null);
                  router.push('/apply');
                }}
                style={styles.modalPrimaryBtn}
              >
                <Text style={styles.modalPrimaryText}>Apply for Arrck Card</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  await WalletService.launchGoogleWallet();
                  setModalType(null);
                }}
                style={styles.phantomDeepBtn}
              >
                <Ionicons name="card-outline" size={18} color="#FFF" />
                <Text style={styles.phantomDeepText}>Link Google Wallet</Text>
              </Pressable>

              <Pressable onPress={() => setModalType(null)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
    paddingVertical: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FF008C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF008C',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  logoLetter: { color: '#FFF', fontWeight: '900', fontSize: 18 },
  wordmark: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
  },
  headerRight: { flexDirection: 'row', gap: 10 },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 140, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 0, 140, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 140, 0.4)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  noticeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  cardContainer: {
    width: '100%',
    height: 200,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 140, 0.4)',
    shadowColor: '#FF008C',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: 20,
  },
  cardGlass: { flex: 1, padding: 20, justifyContent: 'space-between' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBrandGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLogo: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 3 },
  cardTier: { color: '#FF008C', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  chipRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emvChip: {
    width: 40,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.8)',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipLine: { height: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  cardVirtualBadge: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardHolderLabel: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  cardHolder: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  cardNumGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardDots: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, letterSpacing: 2 },
  cardLastFour: { color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 2 },
  balanceSection: { marginBottom: 20 },
  balanceLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceValue: { color: '#FFF', fontSize: 34, fontWeight: '900' },
  primaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  primaryPillText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionBtn: { alignItems: 'center', gap: 6, width: '22%' },
  actionIconRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 140, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF008C',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  actionLabel: { color: '#FFF', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  phantomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(171, 159, 242, 0.1)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(171, 159, 242, 0.3)',
    marginBottom: 20,
  },
  phantomLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  phantomIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(171, 159, 242, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phantomStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phantomTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  greenDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#00FF88' },
  phantomSub: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, maxWidth: 200 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  viewAllText: { color: '#FF008C', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  assetsList: { gap: 8, marginBottom: 20 },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  assetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tokenIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 0, 140, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenSymbol: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  tokenName: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 },
  assetRight: { alignItems: 'flex-end' },
  assetBalance: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  assetUsd: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 },
  activityBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activityMeta: { gap: 2 },
  txSig: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  txStatus: { color: '#00E5FF', fontSize: 10, fontWeight: '600' },
  emptyActivity: { alignItems: 'center', paddingVertical: 18, gap: 6 },
  emptyText: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#12001F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 140, 0.3)',
  },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  modalSub: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginBottom: 16 },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 14,
    color: '#FFF',
    fontSize: 14,
    marginBottom: 12,
  },
  modalPrimaryBtn: {
    backgroundColor: '#FF008C',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalPrimaryText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  modalCloseBtn: { padding: 10, alignItems: 'center' },
  modalCloseText: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 13, fontWeight: '600' },
  phantomDeepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#5243AA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  phantomDeepText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  orDivider: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 10, textAlign: 'center', marginVertical: 8 },
  connectedBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  connectedLabel: { color: '#00FF88', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  connectedAddress: { color: '#FFF', fontSize: 12, fontWeight: '500' },
  disconnectBtn: { marginTop: 10, alignItems: 'flex-start' },
  disconnectBtnText: { color: '#FF3B30', fontSize: 12, fontWeight: '700' },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 14,
  },
  addressPill: {
    color: '#FFF',
    fontSize: 11,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  emptyModalWrap: { paddingVertical: 20, alignItems: 'center' },
});