import { createClient } from '@supabase/supabase-js'

// On native (Capacitor), localStorage isn't reliable across app launches.
// Use Capacitor Preferences as the auth storage so sessions persist.
// On web, fall back to localStorage.
const isNative = () => !!(window.Capacitor?.isNativePlatform?.());

// An async storage adapter backed by Capacitor Preferences.
// Supabase accepts async storage (getItem/setItem/removeItem may return promises).
const capacitorStorage = {
  async getItem(key) {
    try {
      const Prefs = window.Capacitor?.Plugins?.Preferences;
      if (!Prefs) return null;
      const { value } = await Prefs.get({ key });
      return value ?? null;
    } catch (e) {
      return null;
    }
  },
  async setItem(key, value) {
    try {
      const Prefs = window.Capacitor?.Plugins?.Preferences;
      if (!Prefs) return;
      await Prefs.set({ key, value });
    } catch (e) {}
  },
  async removeItem(key) {
    try {
      const Prefs = window.Capacitor?.Plugins?.Preferences;
      if (!Prefs) return;
      await Prefs.remove({ key });
    } catch (e) {}
  },
};

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
  {
    auth: {
      storage: isNative() ? capacitorStorage : window.localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  }
)
