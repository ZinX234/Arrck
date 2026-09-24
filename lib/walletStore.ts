import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export interface TokenAsset {
  symbol: string;
  name: string;
  balance: number;
  usdPrice: number;
  icon: string;
  mint?: string;
}

export interface WalletTransaction {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: any | null;
  memo: string | null;
}

export interface ArrckCard {
  id?: string;
  user_address: string;
  card_name: string;
  card_type: string;
  last_four: string;
  network: string;
  status: string;
  theme: string;
}

const STORAGE_KEY = 'arrck_solana_address';
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

export const WalletService = {
  async getStoredAddress(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },

  async setStoredAddress(address: string | null): Promise<void> {
    try {
      if (address) {
        await AsyncStorage.setItem(STORAGE_KEY, address);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  },

  async fetchPrices(): Promise<Record<string, number>> {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin,bonk,jupiter-exchange-solana&vs_currencies=usd',
        { headers: { Accept: 'application/json' } }
      );
      if (!res.ok) throw new Error('Price fetch failed');
      const data = await res.json();
      return {
        SOL: data.solana?.usd || 180.0,
        USDC: data['usd-coin']?.usd || 1.0,
        BONK: data.bonk?.usd || 0.000025,
        JUP: data['jupiter-exchange-solana']?.usd || 1.15,
      };
    } catch {
      return { SOL: 0, USDC: 1, BONK: 0, JUP: 0 };
    }
  },

  async fetchSolBalance(address: string): Promise<number> {
    try {
      const res = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address],
        }),
      });
      const data = await res.json();
      if (data?.result?.value !== undefined) {
        return data.result.value / 1_000_000_000;
      }
      return 0;
    } catch {
      return 0;
    }
  },

  async fetchTransactions(address: string): Promise<WalletTransaction[]> {
    try {
      // 1. Fetch live signatures from Solana RPC
      const res = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [address, { limit: 10 }],
        }),
      });
      const data = await res.json();
      const rpcTxList: WalletTransaction[] = data?.result || [];

      // 2. Synchronize to Supabase asynchronously
      if (rpcTxList.length > 0 && supabase) {
        try {
          const rows = rpcTxList.map((tx) => ({
            wallet_address: address,
            signature: tx.signature,
            slot: tx.slot,
            block_time: tx.blockTime,
            err: tx.err,
            memo: tx.memo,
          }));
          await supabase.from('wallet_transactions').upsert(rows, { onConflict: 'signature' });
        } catch {
          // Silent fallback if offline
        }
      }

      return rpcTxList;
    } catch {
      // Fallback: Read stored transactions from Supabase
      if (supabase) {
        try {
          const { data } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('wallet_address', address)
            .order('slot', { ascending: false })
            .limit(10);
          if (data && data.length > 0) {
            return data.map((d) => ({
              signature: d.signature,
              slot: d.slot,
              blockTime: d.block_time,
              err: d.err,
              memo: d.memo,
            }));
          }
        } catch {}
      }
      return [];
    }
  },

  async connectPhantom(): Promise<void> {
    const redirectUrl = Linking.createURL('phantom-return');
    const phantomUrl = `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(
      'https://arrck.pay'
    )}&redirect_link=${encodeURIComponent(redirectUrl)}`;

    const supported = await Linking.canOpenURL('phantom://');
    if (supported) {
      await Linking.openURL('phantom://ul/v1/connect');
    } else {
      await Linking.openURL(phantomUrl);
    }
  },

  async launchGoogleWallet(): Promise<boolean> {
    const walletAppUrl = 'wallet://';
    const playStoreUrl = 'market://details?id=com.google.android.apps.walletnfcrel';
    const webFallback = 'https://pay.google.com';

    if (Platform.OS === 'android') {
      try {
        const canOpen = await Linking.canOpenURL(walletAppUrl);
        if (canOpen) {
          await Linking.openURL(walletAppUrl);
          return true;
        }
        await Linking.openURL(playStoreUrl);
        return true;
      } catch {
        await Linking.openURL(webFallback);
        return true;
      }
    }
    await Linking.openURL(webFallback);
    return true;
  },
};