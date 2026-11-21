// ---- safe storage: localStorage with in-memory fallback ----
// In sandboxed iframes, some webviews, or browsers with site data blocked,
// even touching window.localStorage throws a SecurityError. Probe once and
// fall back to a session-only Map so the game always boots. Writes always
// mirror into the Map, so values survive if storage starts failing later
// (e.g. quota exceeded mid-session).
const SafeStorage = (() => {
  const mem = new Map();
  let ls = null;
  try {
    ls = window.localStorage;
    const probe = '__boxy_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
  } catch (e) { ls = null; }
  return {
    get(key) {
      if (ls) {
        try { return ls.getItem(key); } catch (e) { ls = null; }
      }
      return mem.has(key) ? mem.get(key) : null;
    },
    set(key, value) {
      const v = String(value);
      mem.set(key, v);
      if (ls) {
        try { ls.setItem(key, v); } catch (e) { ls = null; }
      }
    },
  };
})();
