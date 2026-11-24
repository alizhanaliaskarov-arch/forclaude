import { Preferences } from '@capacitor/preferences';

const KEY = 'zvezdopad.best';
let cached = 0;

export async function loadBest() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    cached = parseInt(value || '0', 10) || 0;
  } catch { cached = 0; }
  return cached;
}
export function getBest() { return cached; }
export async function saveBest(score) {
  if (score <= cached) return false;
  cached = score;
  try { await Preferences.set({ key: KEY, value: String(score) }); } catch {}
  return true;
}
