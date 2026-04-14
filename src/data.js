// data.js — Dialed Exercise Library & Achievements

export const MUSCLE_COLORS = {
  Chest: "#f472b6",
  Back: "#34d399",
  Shoulders: "#60a5fa",
  Biceps: "#a78bfa",
  Triceps: "#fb923c",
  Forearms: "#facc15",
  Core: "#f87171",
  Quads: "#38bdf8",
  Hamstrings: "#4ade80",
  Glutes: "#e879f9",
  Calves: "#2dd4bf",
  "Full Body": "#94a3b8",
};

export const MUSCLE_GROUPS = Object.keys(MUSCLE_COLORS);

export const EXERCISES = [
  // ── CHEST ──
  { id: "bench_press", name: "Bench Press", primary: ["Chest"], secondary: ["Triceps", "Shoulders"], type: "weighted" },
  { id: "incline_bench", name: "Incline Bench Press", primary: ["Chest"], secondary: ["Shoulders", "Triceps"], type: "weighted" },
  { id: "decline_bench", name: "Decline Bench Press", primary: ["Chest"], secondary: ["Triceps"], type: "weighted" },
  { id: "db_bench", name: "Dumbbell Bench Press", primary: ["Chest"], secondary: ["Triceps", "Shoulders"], type: "weighted" },
  { id: "db_incline_bench", name: "Incline DB Press", primary: ["Chest"], secondary: ["Shoulders"], type: "weighted" },
  { id: "db_fly", name: "Dumbbell Fly", primary: ["Chest"], secondary: [], type: "weighted" },
  { id: "cable_fly", name: "Cable Fly", primary: ["Chest"], secondary: [], type: "weighted" },
  { id: "chest_dip", name: "Chest Dip", primary: ["Chest"], secondary: ["Triceps", "Shoulders"], type: "bodyweight" },
  { id: "push_up", name: "Push Up", primary: ["Chest"], secondary: ["Triceps", "Shoulders"], type: "bodyweight" },
  { id: "machine_chest_press", name: "Machine Chest Press", primary: ["Chest"], secondary: ["Triceps"], type: "weighted" },
  { id: "pec_deck", name: "Pec Deck", primary: ["Chest"], secondary: [], type: "weighted" },
  // ── BACK ──
  { id: "deadlift", name: "Deadlift", primary: ["Back"], secondary: ["Hamstrings", "Glutes", "Forearms"], type: "weighted" },
  { id: "barbell_row", name: "Barbell Row", primary: ["Back"], secondary: ["Biceps", "Forearms"], type: "weighted" },
  { id: "pull_up", name: "Pull Up", primary: ["Back"], secondary: ["Biceps"], type: "bodyweight" },
  { id: "chin_up", name: "Chin Up", primary: ["Back"], secondary: ["Biceps"], type: "bodyweight" },
  { id: "lat_pulldown", name: "Lat Pulldown", primary: ["Back"], secondary: ["Biceps"], type: "weighted" },
  { id: "seated_row", name: "Seated Cable Row", primary: ["Back"], secondary: ["Biceps", "Forearms"], type: "weighted" },
  { id: "db_row", name: "Dumbbell Row", primary: ["Back"], secondary: ["Biceps"], type: "weighted" },
  { id: "t_bar_row", name: "T-Bar Row", primary: ["Back"], secondary: ["Biceps", "Forearms"], type: "weighted" },
  { id: "face_pull", name: "Face Pull", primary: ["Back"], secondary: ["Shoulders"], type: "weighted" },
  { id: "rack_pull", name: "Rack Pull", primary: ["Back"], secondary: ["Forearms", "Glutes"], type: "weighted" },
  { id: "cable_pullover", name: "Cable Pullover", primary: ["Back"], secondary: ["Chest"], type: "weighted" },
  // ── SHOULDERS ──
  { id: "ohp", name: "Overhead Press", primary: ["Shoulders"], secondary: ["Triceps"], type: "weighted" },
  { id: "db_shoulder_press", name: "DB Shoulder Press", primary: ["Shoulders"], secondary: ["Triceps"], type: "weighted" },
  { id: "lateral_raise", name: "Lateral Raise", primary: ["Shoulders"], secondary: [], type: "weighted" },
  { id: "front_raise", name: "Front Raise", primary: ["Shoulders"], secondary: [], type: "weighted" },
  { id: "reverse_fly", name: "Reverse Fly", primary: ["Shoulders"], secondary: ["Back"], type: "weighted" },
  { id: "arnold_press", name: "Arnold Press", primary: ["Shoulders"], secondary: ["Triceps"], type: "weighted" },
  { id: "upright_row", name: "Upright Row", primary: ["Shoulders"], secondary: ["Biceps"], type: "weighted" },
  { id: "cable_lateral_raise", name: "Cable Lateral Raise", primary: ["Shoulders"], secondary: [], type: "weighted" },
  // ── BICEPS ──
  { id: "barbell_curl", name: "Barbell Curl", primary: ["Biceps"], secondary: ["Forearms"], type: "weighted" },
  { id: "db_curl", name: "Dumbbell Curl", primary: ["Biceps"], secondary: ["Forearms"], type: "weighted" },
  { id: "hammer_curl", name: "Hammer Curl", primary: ["Biceps"], secondary: ["Forearms"], type: "weighted" },
  { id: "preacher_curl", name: "Preacher Curl", primary: ["Biceps"], secondary: [], type: "weighted" },
  { id: "incline_curl", name: "Incline DB Curl", primary: ["Biceps"], secondary: [], type: "weighted" },
  { id: "cable_curl", name: "Cable Curl", primary: ["Biceps"], secondary: [], type: "weighted" },
  { id: "concentration_curl", name: "Concentration Curl", primary: ["Biceps"], secondary: [], type: "weighted" },
  { id: "ez_bar_curl", name: "EZ Bar Curl", primary: ["Biceps"], secondary: ["Forearms"], type: "weighted" },
  // ── TRICEPS ──
  { id: "tricep_pushdown", name: "Tricep Pushdown", primary: ["Triceps"], secondary: [], type: "weighted" },
  { id: "overhead_extension", name: "Overhead Extension", primary: ["Triceps"], secondary: [], type: "weighted" },
  { id: "skull_crusher", name: "Skull Crusher", primary: ["Triceps"], secondary: [], type: "weighted" },
  { id: "close_grip_bench", name: "Close Grip Bench", primary: ["Triceps"], secondary: ["Chest"], type: "weighted" },
  { id: "dip", name: "Dip", primary: ["Triceps"], secondary: ["Chest", "Shoulders"], type: "bodyweight" },
  { id: "kickback", name: "Tricep Kickback", primary: ["Triceps"], secondary: [], type: "weighted" },
  { id: "rope_pushdown", name: "Rope Pushdown", primary: ["Triceps"], secondary: [], type: "weighted" },
  // ── FOREARMS ──
  { id: "wrist_curl", name: "Wrist Curl", primary: ["Forearms"], secondary: [], type: "weighted" },
  { id: "reverse_wrist_curl", name: "Reverse Wrist Curl", primary: ["Forearms"], secondary: [], type: "weighted" },
  { id: "farmer_walk", name: "Farmer's Walk", primary: ["Forearms"], secondary: ["Core", "Full Body"], type: "timed" },
  // ── CORE ──
  { id: "plank", name: "Plank", primary: ["Core"], secondary: [], type: "timed" },
  { id: "hanging_leg_raise", name: "Hanging Leg Raise", primary: ["Core"], secondary: [], type: "bodyweight" },
  { id: "cable_crunch", name: "Cable Crunch", primary: ["Core"], secondary: [], type: "weighted" },
  { id: "ab_wheel", name: "Ab Wheel Rollout", primary: ["Core"], secondary: ["Shoulders"], type: "bodyweight" },
  { id: "russian_twist", name: "Russian Twist", primary: ["Core"], secondary: [], type: "weighted" },
  { id: "side_plank", name: "Side Plank", primary: ["Core"], secondary: [], type: "timed" },
  { id: "crunch", name: "Crunch", primary: ["Core"], secondary: [], type: "bodyweight" },
  // ── QUADS ──
  { id: "squat", name: "Barbell Squat", primary: ["Quads"], secondary: ["Glutes", "Hamstrings", "Core"], type: "weighted" },
  { id: "front_squat", name: "Front Squat", primary: ["Quads"], secondary: ["Core", "Glutes"], type: "weighted" },
  { id: "leg_press", name: "Leg Press", primary: ["Quads"], secondary: ["Glutes"], type: "weighted" },
  { id: "leg_extension", name: "Leg Extension", primary: ["Quads"], secondary: [], type: "weighted" },
  { id: "hack_squat", name: "Hack Squat", primary: ["Quads"], secondary: ["Glutes"], type: "weighted" },
  { id: "goblet_squat", name: "Goblet Squat", primary: ["Quads"], secondary: ["Glutes", "Core"], type: "weighted" },
  { id: "lunge", name: "Lunge", primary: ["Quads"], secondary: ["Glutes", "Hamstrings"], type: "weighted" },
  { id: "bulgarian_split", name: "Bulgarian Split Squat", primary: ["Quads"], secondary: ["Glutes"], type: "weighted" },
  // ── HAMSTRINGS ──
  { id: "rdl", name: "Romanian Deadlift", primary: ["Hamstrings"], secondary: ["Glutes", "Back"], type: "weighted" },
  { id: "leg_curl", name: "Leg Curl", primary: ["Hamstrings"], secondary: [], type: "weighted" },
  { id: "nordic_curl", name: "Nordic Curl", primary: ["Hamstrings"], secondary: [], type: "bodyweight" },
  { id: "good_morning", name: "Good Morning", primary: ["Hamstrings"], secondary: ["Back", "Glutes"], type: "weighted" },
  { id: "stiff_leg_dl", name: "Stiff Leg Deadlift", primary: ["Hamstrings"], secondary: ["Glutes", "Back"], type: "weighted" },
  // ── GLUTES ──
  { id: "hip_thrust", name: "Hip Thrust", primary: ["Glutes"], secondary: ["Hamstrings"], type: "weighted" },
  { id: "cable_kickback", name: "Cable Kickback", primary: ["Glutes"], secondary: [], type: "weighted" },
  { id: "glute_bridge", name: "Glute Bridge", primary: ["Glutes"], secondary: ["Hamstrings"], type: "weighted" },
  // ── CALVES ──
  { id: "calf_raise", name: "Standing Calf Raise", primary: ["Calves"], secondary: [], type: "weighted" },
  { id: "seated_calf_raise", name: "Seated Calf Raise", primary: ["Calves"], secondary: [], type: "weighted" },
  // ── FULL BODY ──
  { id: "clean", name: "Power Clean", primary: ["Full Body"], secondary: ["Back", "Shoulders", "Quads"], type: "weighted" },
  { id: "snatch", name: "Snatch", primary: ["Full Body"], secondary: ["Shoulders", "Back", "Quads"], type: "weighted" },
  { id: "thruster", name: "Thruster", primary: ["Full Body"], secondary: ["Quads", "Shoulders"], type: "weighted" },
  { id: "burpee", name: "Burpee", primary: ["Full Body"], secondary: ["Chest", "Core"], type: "bodyweight" },
  { id: "kettlebell_swing", name: "Kettlebell Swing", primary: ["Full Body"], secondary: ["Glutes", "Hamstrings", "Core"], type: "weighted" },
];

export const ACHIEVEMENTS = [
  // ── Milestones ──
  { id: "first_workout", title: "Day One", desc: "Complete your first workout", icon: "🏁", percentile: 100, cat: "milestone" },
  { id: "workouts_10", title: "Getting Consistent", desc: "Complete 10 workouts", icon: "📈", percentile: 70, cat: "milestone" },
  { id: "workouts_25", title: "Quarter Century", desc: "Complete 25 workouts", icon: "💪", percentile: 45, cat: "milestone" },
  { id: "workouts_50", title: "Dedicated", desc: "Complete 50 workouts", icon: "🎯", percentile: 30, cat: "milestone" },
  { id: "workouts_100", title: "Centurion", desc: "Complete 100 workouts", icon: "🏆", percentile: 12, cat: "milestone" },
  { id: "workouts_200", title: "Iron Will", desc: "Complete 200 workouts", icon: "⚔️", percentile: 5, cat: "milestone" },
  // ── Consistency ──
  { id: "streak_7", title: "Week Warrior", desc: "Hit weekly goal 1 week", icon: "🔥", percentile: 35, cat: "consistency" },
  { id: "streak_30", title: "Month of Pain", desc: "Hit weekly goal 4 weeks straight", icon: "💀", percentile: 8, cat: "consistency" },
  { id: "streak_52", title: "Year Round", desc: "Hit weekly goal 12 weeks straight", icon: "🗓️", percentile: 3, cat: "consistency" },
  // ── Bench ──
  { id: "bench_135", title: "First Plate", desc: "Bench press 135 lbs", icon: "🥈", percentile: 60, cat: "strength" },
  { id: "bench_225", title: "Two Wheels", desc: "Bench press 225 lbs", icon: "🥇", percentile: 20, cat: "strength" },
  { id: "bench_315", title: "Three Plates", desc: "Bench press 315 lbs", icon: "💎", percentile: 3, cat: "strength" },
  // ── Squat ──
  { id: "squat_225", title: "Quarter Ton Squat", desc: "Squat 225 lbs", icon: "🦵", percentile: 25, cat: "strength" },
  { id: "squat_315", title: "Squat God", desc: "Squat 315 lbs", icon: "👑", percentile: 8, cat: "strength" },
  // ── Deadlift ──
  { id: "deadlift_315", title: "Pull Heavy", desc: "Deadlift 315 lbs", icon: "⚡", percentile: 18, cat: "strength" },
  { id: "deadlift_405", title: "Four Plates", desc: "Deadlift 405 lbs", icon: "🔱", percentile: 6, cat: "strength" },
  // ── Volume ──
  { id: "vol_100k", title: "100K Club", desc: "Lift 100,000 lbs total", icon: "🏋️", percentile: 50, cat: "volume" },
  { id: "vol_500k", title: "Half Mil", desc: "Lift 500,000 lbs total", icon: "🚀", percentile: 20, cat: "volume" },
  { id: "vol_1m", title: "Millionaire", desc: "Lift 1,000,000 lbs total", icon: "💰", percentile: 8, cat: "volume" },
  // ── Variety ──
  { id: "variety_all", title: "Well Rounded", desc: "Train all 12 muscle groups in one week", icon: "🌐", percentile: 15, cat: "variety" },
  { id: "exercises_20", title: "Explorer", desc: "Use 20 different exercises", icon: "🧭", percentile: 40, cat: "variety" },
  // ── PRs ──
  { id: "prs_5", title: "Record Breaker", desc: "Hit 5 personal records", icon: "📊", percentile: 55, cat: "pr" },
  { id: "prs_25", title: "PR Machine", desc: "Hit 25 personal records", icon: "🔥", percentile: 20, cat: "pr" },
  { id: "prs_50", title: "Unstoppable", desc: "Hit 50 personal records", icon: "⭐", percentile: 8, cat: "pr" },
];

export function getExerciseById(id) {
  return EXERCISES.find((e) => e.id === id);
}

export function getExercisesByMuscle(muscle) {
  if (muscle === "All") return EXERCISES;
  return EXERCISES.filter((e) => e.primary.includes(muscle) || e.secondary.includes(muscle));
}

export function getPrimaryColor(exercise) {
  if (!exercise || !exercise.primary || exercise.primary.length === 0) return "#94a3b8";
  return MUSCLE_COLORS[exercise.primary[0]] || "#94a3b8";
}
