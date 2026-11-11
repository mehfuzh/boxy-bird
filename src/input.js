// ---- input: flap, buttons, share, keyboard ----
function flap(){
  if (state==='start') state='play';
  if (state==='play'){ box.vy=FLAP_V; Sfx.flap(); }
  else if (state==='dead' && deadTimer>45) reset();
}
function shareScore(){
  const text = `I scored ${score} in Boxy Bird! 📦 Can you beat me?`;
  // link the deployed game (GitHub Pages), whose og:image is the Boxy
  // Bird share image — not the GitHub repo, which would show GitHub's card.
  const url = 'https://mehfuzh.github.io/boxy-bird/';
  const href = 'https://x.com/intent/tweet?text=' +
    encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
  // Mobile browsers often block window.open() popups. Use a real anchor
  // click instead, and fall back to navigating in the same tab.
  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => {
    if (!document.hidden) return; // new tab opened fine => we're backgrounded
    window.location.href = href;
  }, 400);
}
function inBtn(b, sx, sy){
  return sx >= b.x && sx <= b.x + b.w &&
    sy >= b.y && sy <= b.y + b.h;
}
function inShareBtn(sx, sy){
  return state==='dead' && inBtn(SHARE_BTN, sx, sy);
}
function initInput(){
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const sx = (e.clientX - r.left) * (W / r.width);
    const sy = (e.clientY - r.top) * (H / r.height);
    // splash screen buttons
    if (state==='splash'){
      if (inBtn(NEWGAME_BTN, sx, sy)) { state='start'; Sfx.flap(); return; }
      if (inBtn(SOUND_BTN, sx, sy)) { Sfx.setEnabled(!Sfx.isEnabled()); return; }
      return;
    }
    // share button hit area (game over only)
    if (inShareBtn(sx, sy)) { shareScore(); return; }
    flap();
  });
  // hand cursor when hovering the share button
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    const sx = (e.clientX - r.left) * (W / r.width);
    const sy = (e.clientY - r.top) * (H / r.height);
    const overBtn = inShareBtn(sx, sy) ||
      (state==='splash' && (inBtn(NEWGAME_BTN, sx, sy) || inBtn(SOUND_BTN, sx, sy)));
    canvas.style.cursor = overBtn ? 'pointer' : 'default';
  });
  canvas.addEventListener('pointerleave', () => { canvas.style.cursor = 'default'; });
  window.addEventListener('keydown', e => {
    if (e.code==='Escape'){
      e.preventDefault();
      if (state==='dead'){ reset(); state='splash'; return; }
      if (state==='splash'){ state='start'; return; }
      if (state==='start'){ state='splash'; return; }
      return;
    }
    if (e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'){ e.preventDefault(); flap(); }
  });
}
