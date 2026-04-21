// ── Configuration Supabase ────────────────────────────────────────────────
// Remplace ces deux valeurs après avoir créé ton projet Supabase
const SUPABASE_URL      = 'https://lekirecmfhewsnozgusm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9O8kw2OwMKT5Kw4PBlHnew_l44qd46X';

// ── Clés localStorage synchronisées avec le cloud ─────────────────────────
const SYNC_KEYS = [
  'tilawa_programme',
  'tilawa_last_page',
  'tilawa_done_days',
  'tilawa_khatmates_annee',
  'tilawa_meditated',
  'tilawa_bookmark',
  'tilawa_objectif_ramadan',
  'tilawa_langue',
  'tilawa_prenom',
];

// ── Client Supabase (chargé via <script> dans les pages) ──────────────────
const _sb = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ── Session ───────────────────────────────────────────────────────────────
async function getSession() {
  if (!_sb) return null;
  const { data } = await _sb.auth.getSession();
  return data.session || null;
}

// ── Sync cloud → localStorage ─────────────────────────────────────────────
async function syncFromCloud() {
  if (!_sb) return;
  try {
    const session = await getSession();
    if (!session) return;

    const { data, error } = await _sb
      .from('user_data')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error || !data) return;

    SYNC_KEYS.forEach(key => {
      const field = key.replace('tilawa_', '');
      const val   = data[field];
      if (val !== null && val !== undefined) {
        localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
      }
    });
  } catch (e) { console.warn('[Tilawa] syncFromCloud:', e); }
}

// ── Sync localStorage → cloud ─────────────────────────────────────────────
async function saveToCloud() {
  if (!_sb) return;
  try {
    const session = await getSession();
    if (!session) return;

    const payload = { user_id: session.user.id, updated_at: new Date().toISOString() };
    SYNC_KEYS.forEach(key => {
      const field = key.replace('tilawa_', '');
      const raw   = localStorage.getItem(key);
      if (raw !== null) {
        try { payload[field] = JSON.parse(raw); } catch { payload[field] = raw; }
      }
    });

    await _sb.from('user_data').upsert(payload, { onConflict: 'user_id' });
  } catch (e) { console.warn('[Tilawa] saveToCloud:', e); }
}

// Sauvegarde automatique quand l'utilisateur quitte la page / passe en arrière-plan
document.addEventListener('visibilitychange', () => {
  if (document.hidden) saveToCloud();
});
window.addEventListener('pagehide', saveToCloud);

// ── Guard : redirige vers login si non connecté ────────────────────────────
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.replace('login.html');
    return null;
  }
  return session;
}

// ── Déconnexion ───────────────────────────────────────────────────────────
async function tilawa_signOut() {
  if (_sb) await _sb.auth.signOut();
  window.location.replace('login.html');
}
