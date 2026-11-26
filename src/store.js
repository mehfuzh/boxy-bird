// ---- persistence (SafeStorage: localStorage with in-memory fallback) ----
// A stored theme is validated against the palettes in themes.js on read;
// unknown/stale values — or no stored choice yet — fall back to the season
// for the player's local timezone (seasonalThemeName in rules.js),
// e.g. winter in late November.
const Store = {
  get best(){ return +(SafeStorage.get('boxyBest') || 0); },
  set best(v){ SafeStorage.set('boxyBest', v); },
  get theme(){
    const t = SafeStorage.get('boxyTheme');
    return isThemeName(t, Object.keys(THEMES)) ? t : seasonalThemeName(new Date());
  },
  set theme(v){ SafeStorage.set('boxyTheme', v); },
};
