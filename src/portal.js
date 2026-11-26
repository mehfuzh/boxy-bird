// ---- portal chrome: info panels around the game (web only) ----
// Reads the live game state (score/best/theme/...) and mirrors it into
// the surrounding page: stats panel, theme picker, sound toggle, play
// button. Hidden on native iOS (see style.css), harmless if absent.
(function(){
  const $ = id => document.getElementById(id);
  const statScore = $('statScore');
  if (!statScore) return; // no portal chrome (bare canvas)
  const statBest = $('statBest'), statPro = $('statPro'), statMode = $('statMode'),
        statusLabel = $('statusLabel');
  const themeList = $('themeList'), soundBtn = $('soundToggle'), playBtn = $('playBtn');

  const themeBtns = {};
  if (themeList){
    // one button per palette — new themes in THEMES join automatically
    for (const name of Object.keys(THEMES)){
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'theme-option';
      b.dataset.theme = name;
        const sw = document.createElement('span');
        sw.className = 'swatch';
        sw.style.background = THEMES[name].boxBody;
      b.appendChild(sw);
      b.appendChild(document.createTextNode(name));
      b.addEventListener('click', () => { theme = name; Store.theme = name; paint(); });
      themeList.appendChild(b);
      themeBtns[name] = b;
    }
  }
  if (soundBtn) soundBtn.addEventListener('click', () => { Sfx.setEnabled(!Sfx.isEnabled()); paint(); });
  if (playBtn) playBtn.addEventListener('click', () => {
    if (state === 'splash'){ state = 'start'; Sfx.flap(); }
    else flap(); // start / resume / play again, same as tapping the canvas
  });

  function statusText(){
    if (paused) return 'PAUSED';
    if (state === 'play') return proMode ? 'PRO MODE' : 'IN PLAY';
    if (state === 'dead') return 'GAME OVER';
    return 'READY';
  }

  let lastKey = '';
  function paint(){
    const key = [score, best, theme, proMode, state, paused, Sfx.isEnabled()].join('|');
    if (key === lastKey) return; // only touch the DOM when something changed
    lastKey = key;
    statScore.textContent = score;
    if (statBest) statBest.textContent = best;
    if (statPro) statPro.classList.toggle('on', proMode);
    if (statMode) statMode.textContent = proMode ? 'PRO' : 'EASY';
    if (statusLabel) statusLabel.textContent = statusText();
    for (const name in themeBtns) themeBtns[name].classList.toggle('active', name === theme);
    if (soundBtn) soundBtn.textContent = 'SOUND: ' + (Sfx.isEnabled() ? 'ON' : 'OFF');
    if (playBtn) playBtn.textContent = state === 'play' ? (paused ? 'RESUME' : 'FLAP') : 'PLAY NOW';
  }
  setInterval(paint, 150); // cheap poll; writes happen only on change
  paint();
})();
