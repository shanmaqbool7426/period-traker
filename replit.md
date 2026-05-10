# LunaSync

A premium, emotionally engaging AI-powered Period & Women Wellness App built with React Native (Expo) running as a web app.

## Overview

LunaSync is a Gen Z wellness app focused on:
- Smart AI cycle prediction and phase tracking
- AI Mood & Symptom Coach with personalized advice
- Daily journaling with flow, symptom, and energy tracking
- Gamification with XP, streaks, and achievements
- Beautiful premium UI with soft gradients, glassmorphism cards

## Tech Stack

- **Framework**: React Native (Expo) with expo-router
- **State**: React Context (AppContext) + Zustand
- **Fonts**: Nunito (Google Fonts via @expo-google-fonts)
- **Animations**: react-native-reanimated
- **Styling**: StyleSheet with semantic color tokens (constants/colors.ts)
- **Navigation**: Tab-based with 5 screens

## App Structure

```
app/
  _layout.tsx          # Root layout with all providers
  (tabs)/
    index.tsx          # Home dashboard
    calendar.tsx       # Cycle calendar
    journal.tsx        # Daily journal
    coach.tsx          # AI wellness coach chat
    profile.tsx        # Profile, achievements, settings
  modal/
    log.tsx            # Log modal
    insights.tsx       # Insights modal
components/
  ui/                  # Shared UI components (GlassCard, MoonIcon, etc.)
  home/                # Home screen components
contexts/
  AppContext.tsx        # Global app state
constants/
  colors.ts            # Semantic color tokens (light & dark)
hooks/
  useColors.ts         # Color scheme hook
```

## Running

```
npm start
```

Runs Expo web on port 5000.

## User Preferences

- Premium feminine aesthetic with lavender/blush/purple palette
- Glassmorphism UI cards with gradient backgrounds
- Animated moon icon that changes with cycle phase
- No emojis in UI (except affirmations for warmth)
