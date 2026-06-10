import { supabase } from './supabase.js';

// ── Push all user data to Supabase ──────────────────────────────
export async function pushToCloud(userId, { tw, routines, historyData, progressionData, bwLog, schedules }) {
  try {
    await Promise.all([
      // Settings
      supabase.from('user_settings').upsert({ user_id: userId, data: tw, updated_at: new Date().toISOString() }),
      // Routines
      routines.length > 0 && supabase.from('routines').upsert(
        routines.map(r => ({ id: r.id, user_id: userId, data: r, updated_at: new Date().toISOString() }))
      ),
      // Workouts
      historyData.length > 0 && supabase.from('workouts').upsert(
        historyData.map(w => ({ id: w.id, user_id: userId, data: w, date_iso: w.dateISO, updated_at: new Date().toISOString() }))
      ),
      // Progression
      supabase.from('progression').upsert({ user_id: userId, data: progressionData, updated_at: new Date().toISOString() }),
      // Bodyweight
      bwLog.length > 0 && supabase.from('bodyweight').upsert({ user_id: userId, data: bwLog, updated_at: new Date().toISOString() }),
      // Schedules
      schedules.length > 0 && supabase.from('schedules').upsert(
        schedules.map(s => ({ id: s.id, user_id: userId, data: s, updated_at: new Date().toISOString() }))
      ),
    ].filter(Boolean));
  } catch(e) {
    console.error('Cloud sync error:', e);
  }
}

// ── Pull all user data from Supabase ────────────────────────────
export async function pullFromCloud(userId) {
  try {
    const [settings, routines, workouts, progression, bodyweight, schedules] = await Promise.all([
      supabase.from('user_settings').select('data').eq('user_id', userId).single(),
      supabase.from('routines').select('data').eq('user_id', userId),
      supabase.from('workouts').select('data').eq('user_id', userId).order('date_iso', { ascending: false }),
      supabase.from('progression').select('data').eq('user_id', userId).single(),
      supabase.from('bodyweight').select('data').eq('user_id', userId).single(),
      supabase.from('schedules').select('data').eq('user_id', userId),
    ]);

    return {
      tw: settings.data?.data || null,
      routines: routines.data?.map(r => r.data) || [],
      historyData: workouts.data?.map(w => w.data) || [],
      progressionData: progression.data?.data || {},
      bwLog: bodyweight.data?.data || [],
      schedules: schedules.data?.map(s => s.data) || [],
    };
  } catch(e) {
    console.error('Cloud pull error:', e);
    return null;
  }
}