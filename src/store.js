// ---- persistence (SafeStorage: localStorage with in-memory fallback) ----
const Store = {
  get best(){ return +(SafeStorage.get('boxyBest') || 0); },
  set best(v){ SafeStorage.set('boxyBest', v); },
  get theme(){ return SafeStorage.get('boxyTheme') || 'default'; },
  set theme(v){ SafeStorage.set('boxyTheme', v); },
};
