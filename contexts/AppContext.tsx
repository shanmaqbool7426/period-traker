import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';

export interface CycleLog {
  id: string;
  date: string;
  flow: 'none' | 'light' | 'medium' | 'heavy';
  mood: string;
  symptoms: string[];
  energy: number;
  notes: string;
}

export interface UserProfile {
  name: string;
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string;
  onboardingComplete: boolean;
}

interface PartnerState {
  linked: boolean;
  partnerName: string;
  syncCode: string;
}

interface AppContextType {
  profile: UserProfile;
  logs: CycleLog[];
  todayMood: string;
  hydration: number;
  streak: number;
  xp: number;
  partner: PartnerState;
  updateProfile: (p: Partial<UserProfile>) => void;
  addLog: (log: CycleLog) => void;
  setTodayMood: (mood: string) => void;
  setHydration: (h: number) => void;
  incrementStreak: () => void;
  addXP: (amount: number) => void;
  linkPartner: (name: string, code: string) => void;
  unlinkPartner: () => void;
  currentPhase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  daysUntilNextPeriod: number;
  cycleDay: number;
}

const defaultProfile: UserProfile = {
  name: 'Luna',
  cycleLength: 28,
  periodLength: 5,
  lastPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  onboardingComplete: true,
};

function generateSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    if (i === 3) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const PROFILE_KEY = 'lunasync_profile';
const PARTNER_KEY = 'lunasync_partner';

function load<T>(key: string, fallback: T): T {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) return { ...fallback, ...JSON.parse(raw) } as T;
    } catch {}
  }
  return fallback;
}

function save(key: string, value: unknown) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
}

const defaultPartner: PartnerState = {
  linked: false,
  partnerName: '',
  syncCode: generateSyncCode(),
};

const AppContext = createContext<AppContextType | null>(null);

function computePhase(
  lastPeriodStart: string,
  cycleLength: number,
  periodLength: number
): { phase: AppContextType['currentPhase']; cycleDay: number; daysUntil: number } {
  const start = new Date(lastPeriodStart);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const cycleDay = (diffDays % cycleLength) + 1;
  const daysUntil = cycleLength - cycleDay + 1;
  let phase: AppContextType['currentPhase'];
  if (cycleDay <= periodLength) phase = 'menstrual';
  else if (cycleDay <= 13) phase = 'follicular';
  else if (cycleDay <= 16) phase = 'ovulation';
  else phase = 'luteal';
  return { phase, cycleDay, daysUntil };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => load(PROFILE_KEY, defaultProfile));
  const [partner, setPartner] = useState<PartnerState>(() => {
    const saved = load<Partial<PartnerState>>(PARTNER_KEY, {});
    return { ...defaultPartner, ...saved };
  });
  const [logs, setLogs] = useState<CycleLog[]>([]);
  const [todayMood, setTodayMood] = useState('calm');
  const [hydration, setHydration] = useState(4);
  const [streak, setStreak] = useState(7);
  const [xp, setXP] = useState(320);

  const { phase, cycleDay, daysUntil } = computePhase(
    profile.lastPeriodStart,
    profile.cycleLength,
    profile.periodLength
  );

  const updateProfile = useCallback((p: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...p };
      save(PROFILE_KEY, next);
      return next;
    });
  }, []);

  const linkPartner = useCallback((name: string, code: string) => {
    setPartner(prev => {
      const next = { ...prev, linked: true, partnerName: name };
      save(PARTNER_KEY, next);
      return next;
    });
  }, []);

  const unlinkPartner = useCallback(() => {
    setPartner(prev => {
      const next = { ...prev, linked: false, partnerName: '' };
      save(PARTNER_KEY, next);
      return next;
    });
  }, []);

  const addLog = useCallback((log: CycleLog) =>
    setLogs(prev => [log, ...prev.filter(l => l.date !== log.date)]), []);

  const incrementStreak = useCallback(() => setStreak(s => s + 1), []);
  const addXP = useCallback((amount: number) => setXP(x => x + amount), []);

  return (
    <AppContext.Provider value={{
      profile, logs, todayMood, hydration, streak, xp, partner,
      updateProfile, addLog, setTodayMood, setHydration,
      incrementStreak, addXP, linkPartner, unlinkPartner,
      currentPhase: phase, daysUntilNextPeriod: daysUntil, cycleDay,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
