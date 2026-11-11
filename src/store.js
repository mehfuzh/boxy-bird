// ---- persistence (localStorage) ----
const Store = {
  get best(){ return +(localStorage.getItem('boxyBest') || 0); },
  set best(v){ localStorage.setItem('boxyBest', v); },
};
