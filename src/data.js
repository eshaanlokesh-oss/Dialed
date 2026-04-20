// data.js — Dialed

export const THEMES = {
  Ice:     { p: '#7dd3fc', g: '#38bdf8' },
  Emerald: { p: '#34d399', g: '#10b981' },
  Crimson: { p: '#f43f5e', g: '#e11d48' },
  Violet:  { p: '#a78bfa', g: '#8b5cf6' },
  Blaze:   { p: '#fb923c', g: '#f97316' },
  Gold:    { p: '#facc15', g: '#eab308' },
  Rose:    { p: '#fb7185', g: '#f43f5e' },
};

export const MC = {
  Chest: '#f472b6', Back: '#34d399', Shoulders: '#60a5fa',
  Biceps: '#a78bfa', Triceps: '#fb923c', Forearms: '#facc15',
  Core: '#f87171', Quads: '#38bdf8', Hamstrings: '#4ade80',
  Glutes: '#e879f9', Calves: '#2dd4bf', 'Full Body': '#94a3b8',
};

export const TWEAK_DEFAULTS = {
  theme: 'Ice',
  beamIntensity: 36,
  unit: 'lbs',
  restTimerEnabled: true,
  restTimerDuration: 90,
};

export const DEFAULT_ROUTINES = [
  {
    id: 'r1', name: 'Push A', muscles: ['Chest', 'Shoulders', 'Triceps'],
    lastDone: '2 days ago', freq: 'Mon · Thu',
    exercises: [
      { name: 'Bench Press',      sets: 4, reps: '6–8',   last: '185 lbs' },
      { name: 'Incline DB Press', sets: 3, reps: '10',    last: '65 lbs' },
      { name: 'Cable Fly',        sets: 3, reps: '12–15', last: '35 lbs' },
      { name: 'OHP',              sets: 3, reps: '8',     last: '115 lbs' },
      { name: 'Lateral Raise',    sets: 3, reps: '15',    last: '20 lbs' },
      { name: 'Tricep Pushdown',  sets: 4, reps: '12',    last: '50 lbs' },
    ],
  },
  {
    id: 'r2', name: 'Pull B', muscles: ['Back', 'Biceps', 'Forearms'],
    lastDone: '4 days ago', freq: 'Tue · Fri',
    exercises: [
      { name: 'Deadlift',         sets: 3, reps: '5',     last: '275 lbs' },
      { name: 'Pull-Up',          sets: 4, reps: '8',     last: 'BW+25' },
      { name: 'Seated Cable Row', sets: 3, reps: '10–12', last: '120 lbs' },
      { name: 'Face Pull',        sets: 3, reps: '15',    last: '30 lbs' },
      { name: 'Hammer Curl',      sets: 3, reps: '12',    last: '35 lbs' },
    ],
  },
  {
    id: 'r3', name: 'Legs C', muscles: ['Quads', 'Hamstrings', 'Glutes'],
    lastDone: 'Yesterday', freq: 'Wed · Sat',
    exercises: [
      { name: 'Back Squat',    sets: 4, reps: '5',     last: '225 lbs' },
      { name: 'Romanian DL',   sets: 3, reps: '8–10',  last: '185 lbs' },
      { name: 'Leg Press',     sets: 3, reps: '12',    last: '360 lbs' },
      { name: 'Walking Lunge', sets: 3, reps: '10ea',  last: '50 lbs' },
      { name: 'Leg Curl',      sets: 3, reps: '12',    last: '80 lbs' },
      { name: 'Calf Raise',    sets: 4, reps: '15',    last: '135 lbs' },
      { name: 'Hip Thrust',    sets: 3, reps: '10',    last: '205 lbs' },
    ],
  },
  {
    id: 'r4', name: 'Upper D', muscles: ['Chest', 'Back', 'Shoulders'],
    lastDone: '5 days ago', freq: 'Sun',
    exercises: [
      { name: 'DB Bench Press', sets: 4, reps: '8–10', last: '75 lbs' },
      { name: 'Bent-Over Row',  sets: 4, reps: '8',    last: '155 lbs' },
      { name: 'Push-Up',        sets: 3, reps: '15',   last: 'BW' },
      { name: 'Lat Pulldown',   sets: 3, reps: '10',   last: '130 lbs' },
      { name: 'Arnold Press',   sets: 3, reps: '10',   last: '45 lbs' },
      { name: 'Rear Delt Fly',  sets: 3, reps: '15',   last: '15 lbs' },
      { name: 'Chest Dip',      sets: 3, reps: '10',   last: 'BW+35' },
      { name: 'Shrug',          sets: 3, reps: '12',   last: '100 lbs' },
    ],
  },
];

export const DEMO_HISTORY = [
  {
    id: 'h1', date: 'Today, Apr 19', routine: 'Push A',
    muscles: ['Chest', 'Shoulders', 'Triceps'], duration: '48 min',
    volume: 12840, sets: 18,
    exercises: [
      { name: 'Bench Press',      sets: [{ w: 185, r: 6 }, { w: 185, r: 6 }, { w: 175, r: 7 }, { w: 175, r: 6 }], pr: true },
      { name: 'Incline DB Press', sets: [{ w: 65, r: 10 }, { w: 65, r: 9 }, { w: 60, r: 10 }] },
      { name: 'Cable Fly',        sets: [{ w: 35, r: 14 }, { w: 35, r: 13 }, { w: 35, r: 12 }] },
      { name: 'OHP',              sets: [{ w: 115, r: 8 }, { w: 115, r: 7 }, { w: 105, r: 8 }] },
      { name: 'Lateral Raise',    sets: [{ w: 20, r: 15 }, { w: 20, r: 14 }, { w: 20, r: 13 }] },
      { name: 'Tricep Pushdown',  sets: [{ w: 50, r: 12 }, { w: 50, r: 11 }, { w: 45, r: 12 }, { w: 45, r: 12 }] },
    ],
  },
  {
    id: 'h2', date: 'Fri, Apr 17', routine: 'Legs C',
    muscles: ['Quads', 'Hamstrings', 'Glutes'], duration: '61 min',
    volume: 18320, sets: 22,
    exercises: [
      { name: 'Back Squat',    sets: [{ w: 225, r: 5 }, { w: 225, r: 5 }, { w: 215, r: 5 }, { w: 215, r: 5 }], pr: true },
      { name: 'Romanian DL',   sets: [{ w: 185, r: 8 }, { w: 185, r: 8 }, { w: 185, r: 7 }] },
      { name: 'Leg Press',     sets: [{ w: 360, r: 12 }, { w: 360, r: 11 }, { w: 340, r: 12 }] },
      { name: 'Walking Lunge', sets: [{ w: 50, r: 10 }, { w: 50, r: 10 }, { w: 45, r: 10 }] },
      { name: 'Leg Curl',      sets: [{ w: 80, r: 12 }, { w: 80, r: 11 }, { w: 75, r: 12 }] },
      { name: 'Calf Raise',    sets: [{ w: 135, r: 15 }, { w: 135, r: 15 }, { w: 135, r: 14 }, { w: 125, r: 15 }] },
      { name: 'Hip Thrust',    sets: [{ w: 205, r: 10 }, { w: 205, r: 9 }, { w: 195, r: 10 }] },
    ],
  },
  {
    id: 'h3', date: 'Thu, Apr 16', routine: 'Pull B',
    muscles: ['Back', 'Biceps', 'Forearms'], duration: '52 min',
    volume: 14200, sets: 16,
    exercises: [
      { name: 'Deadlift',         sets: [{ w: 275, r: 5 }, { w: 275, r: 4 }, { w: 265, r: 5 }], pr: true },
      { name: 'Pull-Up',          sets: [{ w: 25, r: 8 }, { w: 25, r: 7 }, { w: 20, r: 8 }, { w: 20, r: 7 }] },
      { name: 'Seated Cable Row', sets: [{ w: 120, r: 11 }, { w: 120, r: 10 }, { w: 115, r: 11 }] },
      { name: 'Face Pull',        sets: [{ w: 30, r: 15 }, { w: 30, r: 14 }, { w: 30, r: 13 }] },
      { name: 'Hammer Curl',      sets: [{ w: 35, r: 12 }, { w: 35, r: 11 }, { w: 35, r: 10 }] },
    ],
  },
  {
    id: 'h4', date: 'Tue, Apr 15', routine: 'Push A',
    muscles: ['Chest', 'Shoulders', 'Triceps'], duration: '45 min',
    volume: 11900, sets: 17,
    exercises: [
      { name: 'Bench Press',      sets: [{ w: 180, r: 6 }, { w: 180, r: 6 }, { w: 175, r: 6 }, { w: 175, r: 5 }] },
      { name: 'Incline DB Press', sets: [{ w: 65, r: 9 }, { w: 60, r: 10 }, { w: 60, r: 9 }] },
      { name: 'OHP',              sets: [{ w: 115, r: 7 }, { w: 110, r: 8 }, { w: 110, r: 7 }] },
      { name: 'Lateral Raise',    sets: [{ w: 20, r: 14 }, { w: 20, r: 13 }, { w: 18, r: 15 }] },
      { name: 'Tricep Pushdown',  sets: [{ w: 50, r: 11 }, { w: 50, r: 11 }, { w: 45, r: 12 }] },
    ],
  },
  {
    id: 'h5', date: 'Mon, Apr 14', routine: 'Legs C',
    muscles: ['Quads', 'Hamstrings', 'Glutes'], duration: '58 min',
    volume: 17640, sets: 21,
    exercises: [
      { name: 'Back Squat',  sets: [{ w: 220, r: 5 }, { w: 220, r: 5 }, { w: 215, r: 5 }, { w: 210, r: 5 }] },
      { name: 'Romanian DL', sets: [{ w: 185, r: 8 }, { w: 185, r: 7 }, { w: 180, r: 8 }] },
      { name: 'Leg Press',   sets: [{ w: 340, r: 12 }, { w: 340, r: 11 }, { w: 320, r: 12 }] },
      { name: 'Leg Curl',    sets: [{ w: 80, r: 11 }, { w: 75, r: 12 }, { w: 75, r: 11 }] },
      { name: 'Hip Thrust',  sets: [{ w: 205, r: 9 }, { w: 195, r: 10 }, { w: 195, r: 9 }] },
      { name: 'Calf Raise',  sets: [{ w: 135, r: 14 }, { w: 135, r: 14 }, { w: 125, r: 15 }, { w: 125, r: 14 }] },
    ],
  },
  {
    id: 'h6', date: 'Sat, Apr 12', routine: 'Upper D',
    muscles: ['Chest', 'Back', 'Shoulders'], duration: '66 min',
    volume: 15800, sets: 24,
    exercises: [
      { name: 'DB Bench Press', sets: [{ w: 75, r: 10 }, { w: 75, r: 9 }, { w: 70, r: 10 }, { w: 70, r: 9 }] },
      { name: 'Bent-Over Row',  sets: [{ w: 155, r: 8 }, { w: 155, r: 8 }, { w: 150, r: 8 }, { w: 150, r: 7 }] },
      { name: 'OHP',            sets: [{ w: 115, r: 7 }, { w: 110, r: 8 }, { w: 110, r: 7 }] },
      { name: 'Lat Pulldown',   sets: [{ w: 130, r: 10 }, { w: 130, r: 9 }, { w: 125, r: 10 }] },
      { name: 'Arnold Press',   sets: [{ w: 45, r: 10 }, { w: 45, r: 9 }, { w: 40, r: 10 }] },
      { name: 'Rear Delt Fly',  sets: [{ w: 15, r: 15 }, { w: 15, r: 14 }, { w: 15, r: 13 }] },
    ],
  },
];

export const DEMO_WEEKS = [
  { label: 'This Week', ids: ['h1', 'h2', 'h3', 'h4'], vol: 63360, workouts: 4 },
  { label: 'Last Week', ids: ['h5', 'h6'], vol: 33440, workouts: 2 },
];

export const DEMO_WEEK_CHART = [
  { d: 'M', v: 5200 }, { d: 'T', v: 0 }, { d: 'W', v: 4800 },
  { d: 'T', v: 6100 }, { d: 'F', v: 2320 }, { d: 'S', v: 0, today: true }, { d: 'S', v: 0 },
];

export const DEMO_MUSCLE_SETS = [
  { n: 'Chest', s: 18 }, { n: 'Back', s: 15 }, { n: 'Shoulders', s: 12 },
  { n: 'Triceps', s: 10 }, { n: 'Biceps', s: 8 }, { n: 'Core', s: 6 },
];

export const DEMO_CAL_WORKOUTS = {
  '2026-04-19': { routine: 'Push A',  muscles: ['Chest', 'Shoulders', 'Triceps'], volume: 12840, duration: '48 min', sets: 18, pr: true },
  '2026-04-17': { routine: 'Legs C',  muscles: ['Quads', 'Hamstrings', 'Glutes'], volume: 18320, duration: '61 min', sets: 22, pr: true },
  '2026-04-16': { routine: 'Pull B',  muscles: ['Back', 'Biceps', 'Forearms'],    volume: 14200, duration: '52 min', sets: 16, pr: true },
  '2026-04-15': { routine: 'Push A',  muscles: ['Chest', 'Shoulders', 'Triceps'], volume: 11900, duration: '45 min', sets: 17 },
  '2026-04-14': { routine: 'Legs C',  muscles: ['Quads', 'Hamstrings', 'Glutes'], volume: 17640, duration: '58 min', sets: 21 },
  '2026-04-12': { routine: 'Upper D', muscles: ['Chest', 'Back', 'Shoulders'],    volume: 15800, duration: '66 min', sets: 24 },
  '2026-04-10': { routine: 'Pull B',  muscles: ['Back', 'Biceps', 'Forearms'],    volume: 13600, duration: '50 min', sets: 15 },
  '2026-04-07': { routine: 'Legs C',  muscles: ['Quads', 'Hamstrings', 'Glutes'], volume: 16900, duration: '57 min', sets: 20 },
  '2026-04-05': { routine: 'Upper D', muscles: ['Chest', 'Back', 'Shoulders'],    volume: 14800, duration: '62 min', sets: 22 },
  '2026-04-03': { routine: 'Pull B',  muscles: ['Back', 'Biceps', 'Forearms'],    volume: 13100, duration: '49 min', sets: 15 },
  '2026-04-01': { routine: 'Push A',  muscles: ['Chest', 'Shoulders', 'Triceps'], volume: 10800, duration: '43 min', sets: 15 },
  '2026-03-31': { routine: 'Legs C',  muscles: ['Quads', 'Hamstrings', 'Glutes'], volume: 16200, duration: '55 min', sets: 19 },
  '2026-03-28': { routine: 'Upper D', muscles: ['Chest', 'Back', 'Shoulders'],    volume: 14200, duration: '60 min', sets: 21 },
  '2026-03-26': { routine: 'Pull B',  muscles: ['Back', 'Biceps', 'Forearms'],    volume: 12900, duration: '48 min', sets: 14 },
  '2026-03-24': { routine: 'Push A',  muscles: ['Chest', 'Shoulders', 'Triceps'], volume: 10500, duration: '42 min', sets: 15 },
};

export const DEMO_PRS = [
  { exercise: 'Bench Press',  weight: 185, reps: 6,  date: 'Apr 19', muscle: 'Chest' },
  { exercise: 'Back Squat',   weight: 225, reps: 5,  date: 'Apr 17', muscle: 'Quads' },
  { exercise: 'Deadlift',     weight: 275, reps: 5,  date: 'Apr 16', muscle: 'Back' },
  { exercise: 'OHP',          weight: 115, reps: 8,  date: 'Mar 28', muscle: 'Shoulders' },
  { exercise: 'Pull-Up',      weight: 25,  reps: 8,  date: 'Mar 15', muscle: 'Back' },
  { exercise: 'Hip Thrust',   weight: 205, reps: 10, date: 'Feb 22', muscle: 'Glutes' },
  { exercise: 'Leg Press',    weight: 360, reps: 12, date: 'Feb 14', muscle: 'Quads' },
  { exercise: 'Hammer Curl',  weight: 35,  reps: 12, date: 'Jan 30', muscle: 'Biceps' },
];

export const DEMO_PROGRESSION = {
  'Bench Press': [
    { date: '2025-10-05', weight: 135, reps: 8, volume: 3240 },
    { date: '2025-11-02', weight: 155, reps: 7, volume: 3255 },
    { date: '2025-12-14', weight: 165, reps: 8, volume: 3960 },
    { date: '2026-01-11', weight: 175, reps: 6, volume: 3150 },
    { date: '2026-01-25', weight: 175, reps: 8, volume: 4200 },
    { date: '2026-02-08', weight: 180, reps: 6, volume: 3240 },
    { date: '2026-02-22', weight: 180, reps: 7, volume: 3780 },
    { date: '2026-03-08', weight: 182, reps: 6, volume: 3276 },
    { date: '2026-03-22', weight: 185, reps: 6, volume: 3330 },
    { date: '2026-04-15', weight: 185, reps: 6, volume: 3330 },
    { date: '2026-04-19', weight: 185, reps: 6, volume: 3330 },
  ],
  'Back Squat': [
    { date: '2025-10-07', weight: 155, reps: 5, volume: 2325 },
    { date: '2025-11-18', weight: 185, reps: 5, volume: 2775 },
    { date: '2025-12-30', weight: 205, reps: 5, volume: 3075 },
    { date: '2026-01-27', weight: 215, reps: 5, volume: 3225 },
    { date: '2026-02-24', weight: 220, reps: 5, volume: 3300 },
    { date: '2026-03-24', weight: 225, reps: 5, volume: 3375 },
    { date: '2026-04-14', weight: 220, reps: 5, volume: 3300 },
    { date: '2026-04-17', weight: 225, reps: 5, volume: 3375 },
  ],
  'Deadlift': [
    { date: '2025-10-09', weight: 185, reps: 5, volume: 2775 },
    { date: '2025-11-06', weight: 225, reps: 5, volume: 3375 },
    { date: '2025-12-04', weight: 245, reps: 5, volume: 3675 },
    { date: '2026-01-15', weight: 260, reps: 5, volume: 3900 },
    { date: '2026-02-12', weight: 265, reps: 5, volume: 3975 },
    { date: '2026-03-12', weight: 270, reps: 5, volume: 4050 },
    { date: '2026-03-26', weight: 275, reps: 5, volume: 4125 },
    { date: '2026-04-16', weight: 275, reps: 5, volume: 4125 },
  ],
  'OHP': [
    { date: '2025-10-05', weight: 75,  reps: 8, volume: 1800 },
    { date: '2025-11-16', weight: 90,  reps: 7, volume: 1890 },
    { date: '2025-12-28', weight: 100, reps: 7, volume: 2100 },
    { date: '2026-01-25', weight: 105, reps: 7, volume: 2205 },
    { date: '2026-02-22', weight: 110, reps: 7, volume: 2310 },
    { date: '2026-03-22', weight: 115, reps: 7, volume: 2415 },
    { date: '2026-04-19', weight: 115, reps: 8, volume: 2760 },
  ],
};

export const DEMO_BODYWEIGHT = [
  { date: '2025-10-01', weight: 182 },
  { date: '2025-11-01', weight: 180 },
  { date: '2025-12-01', weight: 178 },
  { date: '2026-01-01', weight: 177 },
  { date: '2026-02-01', weight: 176 },
  { date: '2026-03-01', weight: 174 },
  { date: '2026-04-01', weight: 173 },
  { date: '2026-04-10', weight: 172 },
  { date: '2026-04-19', weight: 172 },
];

export const ALL_EXERCISES = [
  { name: 'Bench Press',      muscle: 'Chest',      isTime: false },
  { name: 'Incline DB Press', muscle: 'Chest',      isTime: false },
  { name: 'Cable Fly',        muscle: 'Chest',      isTime: false },
  { name: 'Chest Dip',        muscle: 'Chest',      isTime: false },
  { name: 'Push-Up',          muscle: 'Chest',      isTime: false },
  { name: 'Pull-Up',          muscle: 'Back',       isTime: false },
  { name: 'Deadlift',         muscle: 'Back',       isTime: false },
  { name: 'Bent-Over Row',    muscle: 'Back',       isTime: false },
  { name: 'Lat Pulldown',     muscle: 'Back',       isTime: false },
  { name: 'Seated Cable Row', muscle: 'Back',       isTime: false },
  { name: 'Face Pull',        muscle: 'Back',       isTime: false },
  { name: 'OHP',              muscle: 'Shoulders',  isTime: false },
  { name: 'Lateral Raise',    muscle: 'Shoulders',  isTime: false },
  { name: 'Arnold Press',     muscle: 'Shoulders',  isTime: false },
  { name: 'Rear Delt Fly',    muscle: 'Shoulders',  isTime: false },
  { name: 'Barbell Curl',     muscle: 'Biceps',     isTime: false },
  { name: 'Hammer Curl',      muscle: 'Biceps',     isTime: false },
  { name: 'Incline DB Curl',  muscle: 'Biceps',     isTime: false },
  { name: 'Tricep Pushdown',  muscle: 'Triceps',    isTime: false },
  { name: 'Skull Crusher',    muscle: 'Triceps',    isTime: false },
  { name: 'Back Squat',       muscle: 'Quads',      isTime: false },
  { name: 'Leg Press',        muscle: 'Quads',      isTime: false },
  { name: 'Walking Lunge',    muscle: 'Quads',      isTime: false },
  { name: 'Romanian DL',      muscle: 'Hamstrings', isTime: false },
  { name: 'Leg Curl',         muscle: 'Hamstrings', isTime: false },
  { name: 'Hip Thrust',       muscle: 'Glutes',     isTime: false },
  { name: 'Calf Raise',       muscle: 'Calves',     isTime: false },
  { name: 'Plank',            muscle: 'Core',       isTime: true  },
  { name: 'Cable Crunch',     muscle: 'Core',       isTime: false },
  { name: 'Ab Wheel',         muscle: 'Core',       isTime: false },
  { name: 'Shrug',            muscle: 'Forearms',   isTime: false },
];

export const EXERCISE_TYPES = ['Barbell','Dumbbell','Cable','Machine','Bodyweight','Timed','Other'];
export const EXERCISE_TYPE_COLORS = {
  Barbell: '#f472b6', Dumbbell: '#60a5fa', Cable: '#34d399',
  Machine: '#fb923c', Bodyweight: '#a78bfa', Timed: '#facc15', Other: '#94a3b8',
};
