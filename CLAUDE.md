# Dialed — Workout Logger App

## Project Overview
React + Vite workout logging app. PWA-enabled, deployed on Vercel via GitHub auto-deploy. All data stored in localStorage (Supabase client wired but not actively used).

## Tech Stack
- **Framework**: React + Vite (v8)
- **Font**: Outfit (Google Fonts, weights 200-800)
- **Styling**: All inline styles in JSX, no CSS framework
- **Data**: localStorage (keys below)
- **Supabase**: Client in `src/supabase.js`, not used for data yet
- **PWA**: Service worker + manifest for Add to Home Screen
- **Deployment**: Vercel auto-deploys on push to `main` branch
- **Repo**: https://github.com/eshaanlokesh-oss/dialed.git

## Project Structure
```
C:\Users\eshaa\finance-tracker\     (never renamed from original project)
├── public/
│   ├── manifest.json               # PWA manifest
│   ├── sw.js                       # Service worker
│   ├── icon-192.png                # PWA icon
│   ├── icon-512.png                # PWA icon
│   └── favicon.svg
├── src/
│   ├── App.jsx                     # Main app (ALL screens, ~360 lines)
│   ├── data.js                     # Exercise library (195 exercises) + 24 achievements
│   ├── icons.jsx                   # 79 custom SVG exercise icons with fallback
│   ├── pwa.js                      # Service worker registration
│   ├── supabase.js                 # Supabase client (not actively used)
│   ├── main.jsx                    # Entry point, imports pwa.js
│   └── index.css                   # Minimal base styles
├── index.html                      # Has PWA meta tags + manifest link
├── vite.config.js
└── package.json
```

## localStorage Keys
- `dialed_profile` — {name, goal, onboarded, theme, weeklyGoal, unit}
- `dialed_routines` — Array of routine objects
- `dialed_history` — Array of completed workout objects
- `dialed_bodyweight` — Array of {date, weight} entries
- `dialed_weekly_template` — {mon, tue, wed, thu, fri, sat, sun} with routineId + time
- `dialed_plans` — One-off workout plans by date key (YYYY-MM-DD)
- `dialed_custom_exercises` — Array of user-created exercise objects
- `dialed_rpt_dis` — Date string for dismissing weekly report

## Current Design (v6 — Liquid Glass)
- **Background**: Gradient (#0a1a14 → #0d1510 → #0b1210 → #091110) with asymmetric accent glows
- **Cards**: Liquid glass — backdrop-filter blur(40px), rgba(255,255,255,0.035) bg, 0.14 border, inset box-shadows
- **Font**: Outfit throughout (replaced DM Sans in v6)
- **Theme system**: 7 accent colors (Emerald, Crimson, Ice, Violet, Blaze, Gold, Rose)
- **Glows adapt** to chosen accent color

### Design Direction (in progress)
We're redesigning the home screen. The latest approved direction:
- Big volume number as hero (68px weight 800), no card wrapper
- Today's Plan card with accent gradient + internal glow (only card on screen)
- Freestyle (Quick Start) as its own separate tile
- Stats as plain numbers with dividers, no cards
- Routines as a flat list with colored icons + chevrons, muscle names in their colors
- Thin 4px muscle bars
- Film grain texture overlay
- Glows distributed top AND bottom

## Features (ALL BUILT)
- Onboarding (4 steps: welcome, name, goal, frequency → auto-generates routines + template)
- Starter routines: Full Body A/B (2x), PPL (3x/5x/6x), Upper/Lower (4x)
- Home screen with weekly volume chart, stats, muscle volume tracker, body weight
- Routine builder (add/remove/reorder exercises, set counts)
- Exercise picker with search, muscle filters, recent exercises, custom exercise creation
- Live workout with timer, progress bar, PR detection (gold flash), set/rep/weight logging
- Previous performance as placeholder text in inputs
- Remove sets / remove exercises during workout
- Cancel workout confirmation
- Workout summary with shareable graphic (html2canvas)
- History with expandable workout details
- Delete workouts from history
- Calendar with month grid, workout dots, planned workout names
- Weekly template editor (assign routines to Mon-Sun with times)
- One-off event planning (tap future day → assign routine)
- Custom time picker (hour grid + minute grid + AM/PM toggle)
- Exercise progress charts (Weight/Volume/Est 1RM, 1M/3M/6M/1Y/All)
- Body weight tracking (log modal, sparkline, full chart view)
- Weekly report card (auto Monday, dismissable)
- Muscle group volume tracker (sets/volume toggle)
- 24 achievements (milestone/consistency/strength/volume/variety/PR)
- Settings (name, accent color, weekly goal, weight unit)
- PWA setup (manifest, service worker, icons)

## Known Bugs
1. **Custom exercise not adding to routine/workout** — The exercise saves to localStorage correctly (`dialed_custom_exercises`) but doesn't get added when selected from the picker. Regular exercises work fine. The issue is likely in how `onSelect` flows back to the parent component's `addEx` function. `getExerciseById` in data.js already checks localStorage for custom exercises.

2. **Search ranking** — Fixed in code but may not be deployed. Search should sort: exact match first, starts-with second, contains third.

## Column Order
- Live workout grid: SET | WEIGHT | REPS | CHECK (weight left, reps right)

## Exercise Library (195 exercises)
Includes: barbell, dumbbell, cable, machine, smith machine, bodyweight, and timed variations across all 12 muscle groups (Chest, Back, Shoulders, Biceps, Triceps, Forearms, Core, Quads, Hamstrings, Glutes, Calves, Full Body).

## Key User Preferences
- Username: Hi (sophomore aerospace engineering student at CU Boulder)
- Communication: casual, direct
- Design taste: Opal app aesthetic, iOS-native feel, dark atmospheric backgrounds, NOT AI-looking
- Wants Quick Start to always have its own separate tile/button
- Weight column LEFT, Reps column RIGHT in live workout
- Prefers Outfit font

## Future Roadmap (NOT YET BUILT)
- Supabase sync (auth + tables + offline-first)
- Native app via Capacitor (needs $99 Apple Developer account)
- Native push notifications
- Rest timer between sets
- Workout templates/sharing
- Google Calendar integration
- Premium tier / monetization
- Social features / leaderboard
