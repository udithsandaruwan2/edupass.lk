import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  checkIn,
  listTickets,
  login,
  type AuthUser,
  type Ticket,
} from './src/api';

type Tab = 'tickets' | 'scan';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tab, setTab] = useState<Tab>('tickets');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const orgId = user?.memberships[0]?.organisationId;
  const role = user?.memberships[0]?.role?.toUpperCase();
  const canScan = Boolean(
    orgId &&
      (role === 'SCANNER' ||
        role === 'OWNER' ||
        role === 'ADMIN' ||
        role === 'TEACHER' ||
        user?.isPlatformAdmin),
  );

  const onLogin = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await login(email.trim(), password);
      setToken(res.accessToken);
      setUser(res.user);
      const list = await listTickets(res.accessToken).catch(() => []);
      setTickets(list);
      setTab(
        res.user.memberships[0]?.role?.toUpperCase() === 'SCANNER'
          ? 'scan'
          : 'tickets',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const refreshTickets = async () => {
    if (!token) return;
    setBusy(true);
    try {
      setTickets(await listTickets(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load tickets');
    } finally {
      setBusy(false);
    }
  };

  const onBarcode = async ({ data }: { data: string }) => {
    if (!token || !orgId || busy) return;
    setBusy(true);
    setScanMessage(null);
    try {
      const code = data.replace(/^EDUPASS-DEMO:/, '');
      const result = await checkIn(token, orgId, code);
      setScanMessage(
        result.admitted ? `Admitted — ${result.message}` : result.message,
      );
    } catch (e) {
      setScanMessage(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setBusy(false);
    }
  };

  const validTickets = useMemo(
    () => tickets.filter((t) => t.status !== 'CANCELLED' && t.status !== 'cancelled'),
    [tickets],
  );

  if (!token || !user) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <View style={styles.card}>
          <Text style={styles.brand}>EduPass</Text>
          <Text style={styles.sub}>Sign in for tickets or gate scan</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.btn} onPress={() => void onLogin()} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign in</Text>}
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.brand}>EduPass</Text>
        <Text style={styles.sub}>{user.name}</Text>
        <Pressable
          onPress={() => {
            setToken(null);
            setUser(null);
            setTickets([]);
          }}
        >
          <Text style={styles.link}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === 'tickets' && styles.tabOn]}
          onPress={() => setTab('tickets')}
        >
          <Text style={styles.tabText}>My tickets</Text>
        </Pressable>
        {canScan ? (
          <Pressable
            style={[styles.tab, tab === 'scan' && styles.tabOn]}
            onPress={() => setTab('scan')}
          >
            <Text style={styles.tabText}>Scanner</Text>
          </Pressable>
        ) : null}
      </View>

      {tab === 'tickets' ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Pressable style={styles.secondary} onPress={() => void refreshTickets()}>
            <Text style={styles.secondaryText}>Refresh</Text>
          </Pressable>
          {validTickets.length === 0 ? (
            <Text style={styles.muted}>No tickets yet. Book on the web app.</Text>
          ) : (
            validTickets.map((t) => (
              <View key={t.id} style={styles.ticket}>
                <Text style={styles.ticketCode}>{t.code}</Text>
                <Text style={styles.muted}>{t.holderName}</Text>
                <View style={styles.qrWrap}>
                  <QRCode value={t.code} size={160} />
                </View>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <View style={styles.scanPane}>
          {!permission?.granted ? (
            <Pressable style={styles.btn} onPress={() => void requestPermission()}>
              <Text style={styles.btnText}>Allow camera</Text>
            </Pressable>
          ) : (
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={busy ? undefined : onBarcode}
            />
          )}
          {scanMessage ? <Text style={styles.scanMsg}>{scanMessage}</Text> : null}
          {busy ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4f7f5' },
  card: { margin: 24, padding: 20, borderRadius: 12, backgroundColor: '#fff', gap: 12 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 4 },
  brand: { fontSize: 28, fontWeight: '800', color: '#0f3d2e' },
  sub: { color: '#4a6358' },
  link: { color: '#1a7a55', fontWeight: '600', marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#c9d5ce',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: '#1a7a55',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
  error: { color: '#b00020' },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e4ebe7',
    alignItems: 'center',
  },
  tabOn: { backgroundColor: '#c5e6d6' },
  tabText: { fontWeight: '700', color: '#0f3d2e' },
  scroll: { padding: 16, gap: 16 },
  ticket: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  ticketCode: { fontFamily: 'monospace', fontSize: 16, fontWeight: '700' },
  qrWrap: { marginTop: 8, padding: 12, backgroundColor: '#fff' },
  muted: { color: '#6b7f75', textAlign: 'center' },
  secondary: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  secondaryText: { color: '#1a7a55', fontWeight: '600' },
  scanPane: { flex: 1, padding: 16 },
  camera: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  scanMsg: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
