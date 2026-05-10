import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface AppContextType {
  profile: UserProfile;
  logs: CycleLog[];
  todayMood: string;
  hydration: number;
  streak: number;
  xp: number;
  updateProfile: (p: Partial<UserProfile>) => void;
  addLog: (log: CycleLog) => void;
  setTodayMood: (mood: string) => void;
  setHydration: (h: number) => void;
  incrementStreak: () => void;
  addXP: (amount: number) => void;
  currentPhase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  daysUntilNextPeriod: number;
  cycleDay: number;
}

const defaultProfile: UserProfile = {
  name: 'Luna',
  cycleLength: 28,
  periodLength: 5,
  lastPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  onboardingComplete: false,
};

const AppContext = createContext<AppContextType | null>(null);

function computePhase(
  lastPeriodStart: string,
  cycleLength: number,
  periodLength: number
): { phase: AppContextType['currentPhase']; cycleDay: number; daysUntil: number } {
  const start = new Date(lastPeriodStart);
  const today = new Date();
  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
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
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
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

  const updateProfile = (p: Partial<UserProfile>) =>
    setProfile(prev => ({ ...prev, ...p }));

  const addLog = (log: CycleLog) =>
    setLogs(prev => [log, ...prev.filter(l => l.date !== log.date)]);

  const incrementStreak = () => setStreak(s => s + 1);
  const addXP = (amount: number) => setXP(x => x + amount);

  return (
    <AppContext.Provider
      value={{
        profile,
        logs,
        todayMood,
        hydration,
        streak,
        xp,
        updateProfile,
        addLog,
        setTodayMood,
        setHydration,
        incrementStreak,
        addXP,
        currentPhase: phase,
        daysUntilNextPeriod: daysUntil,
        cycleDay,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
