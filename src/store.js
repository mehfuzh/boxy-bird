// ---- persistence (localStorage) ----
const Store = {
  get best(){ return +(localStorage.getItem('boxyBest') || 0); },
  set best(v){ localStorage.setItem('boxyBest', v); },
  get theme(){ return localStorage.getItem('boxyTheme') || 'default'; },
  set theme(v){ localStorage.setItem('boxyTheme', v); },
};
