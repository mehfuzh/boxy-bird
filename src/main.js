const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const hint = document.getElementById("hint");
const Sfx = window.BoxySound;

// ---- Easy-mode tuning ----
const GRAVITY=0.32, FLAP_V=-6.0, PIPE_SPEED=2.0, PIPE_GAP=220;
const PIPE_W=72, PIPE_SPACING=270, GROUND_H=90, BOX_X=130, BOX_SIZE=46, HIT_INSET=7;
// game-over share button (below the game-over card)
const SHARE_BTN = { x:(W-190)/2, y:395, w:190, h:44 };
// splash screen buttons
const NEWGAME_BTN = { x:(W-220)/2, y:390, w:220, h:52 };
const SOUND_BTN   = { x:(W-220)/2, y:456, w:220, h:52 };

let state, box, pipes, score, frames, groundX, clouds, deadTimer, flash;
let best = +(localStorage.getItem('boxyBest') || 0);

function reset(){
  state='start'; box={y:H/2-60, vy:0, rot:0}; pipes=[]; score=0;
  frames=0; deadTimer=0; flash=0; groundX=0; clouds=[];
  for (let i=0;i<5;i++) clouds.push({x:Math.random()*W, y:40+Math.random()*180, s:30+Math.random()*40});
}

// ---- Input ----
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
  if (e.code==='Escape' && state==='dead'){ e.preventDefault(); reset(); state='splash'; return; }
  if (e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'){ e.preventDefault(); flap(); }
});

// ---- Update ----
function spawnPipe(){
  const minTop=70, maxTop=H-GROUND_H-PIPE_GAP-70;
  pipes.push({x:W+20, gapTop:minTop+Math.random()*(maxTop-minTop), scored:false});
}
function die(){
  if (state!=='play') return;
  state='dead'; deadTimer=0; flash=0.7; Sfx.crash();
  if (score>best){ best=score; localStorage.setItem('boxyBest', best); }
}
function update(){
  frames++;
  if (flash>0) flash=Math.max(0, flash-0.06);
  for (const c of clouds){ c.x-=0.35; if (c.x<-90){ c.x=W+40; c.y=40+Math.random()*180; } }

  if (state==='splash'){
    box.y = 265; box.rot = Math.sin(frames*0.05)*0.08;
    return;
  }
  if (state==='start'){
    box.y = H/2-60 + Math.sin(frames*0.08)*10;
    box.rot = Math.sin(frames*0.08)*0.06;
    return;
  }
  if (state==='dead'){
    deadTimer++;
    box.vy+=GRAVITY; box.y+=box.vy;
    box.rot=Math.min(box.rot+0.08, Math.PI/2);
    const fl=H-GROUND_H-BOX_SIZE/2;
    if (box.y>fl){ box.y=fl; box.rot=Math.PI/2; }
    return;
  }

  box.vy+=GRAVITY; box.y+=box.vy;
  const tr=Math.max(-0.35, Math.min(1.25, box.vy/9));
  box.rot += (tr-box.rot)*0.15;
  if (box.y<24){ box.y=24; box.vy=Math.max(box.vy,0); } // no ceiling death

  if (pipes.length===0 || pipes[pipes.length-1].x < W-PIPE_SPACING) spawnPipe();
  for (const p of pipes){
    p.x-=PIPE_SPEED;
    if (!p.scored && p.x+PIPE_W < BOX_X){ p.scored=true; score++; Sfx.score(); }
  }
  pipes = pipes.filter(p => p.x > -PIPE_W-10);
  groundX = (groundX-PIPE_SPEED)%48;

  // collisions (forgiving hitbox)
  const bx=BOX_X-BOX_SIZE/2+HIT_INSET, by=box.y-BOX_SIZE/2+HIT_INSET, bs=BOX_SIZE-HIT_INSET*2;
  const floor=H-GROUND_H;
  if (box.y+BOX_SIZE/2>=floor){ box.y=floor-BOX_SIZE/2; die(); return; }
  for (const p of pipes){
    if (bx+bs>p.x && bx<p.x+PIPE_W){
      if (by<p.gapTop || by+bs>p.gapTop+PIPE_GAP){ die(); return; }
    }
  }
}

// ---- Draw ----
function rr(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
function drawPipes(){
  for (const p of pipes){
    const bt=p.gapTop+PIPE_GAP;
    // top pipe
    ctx.fillStyle='#73BF2E'; ctx.fillRect(p.x,0,PIPE_W,p.gapTop-26);
    ctx.fillStyle='#96D955'; ctx.fillRect(p.x+6,0,10,p.gapTop-26);
    ctx.fillStyle='#73BF2E'; ctx.fillRect(p.x-5,p.gapTop-26,PIPE_W+10,26);
    ctx.strokeStyle='#2e5b0e'; ctx.lineWidth=2;
    ctx.strokeRect(p.x-4,p.gapTop-25,PIPE_W+8,24);
    // bottom pipe
    ctx.fillStyle='#73BF2E'; ctx.fillRect(p.x-5,bt,PIPE_W+10,26);
    ctx.fillStyle='#96D955'; ctx.fillRect(p.x+1,bt+3,10,20);
    ctx.strokeStyle='#2e5b0e'; ctx.strokeRect(p.x-4,bt+1,PIPE_W+8,24);
    ctx.fillStyle='#73BF2E'; ctx.fillRect(p.x,bt+26,PIPE_W,H-GROUND_H-bt-26);
    ctx.fillStyle='#96D955'; ctx.fillRect(p.x+6,bt+26,10,H-GROUND_H-bt-26);
  }
}
function drawGround(){
  const y=H-GROUND_H;
  ctx.fillStyle='#ded895'; ctx.fillRect(0,y,W,GROUND_H);
  ctx.fillStyle='#5ee270'; ctx.fillRect(0,y,W,14);
  ctx.fillStyle='#45c855'; ctx.fillRect(0,y+12,W,3);
  ctx.save(); ctx.beginPath(); ctx.rect(0,y+14,W,GROUND_H-14); ctx.clip();
  ctx.fillStyle='rgba(202,190,110,0.65)';
  for (let x=groundX-48; x<W+48; x+=48){
    ctx.beginPath();
    ctx.moveTo(x,y+14); ctx.lineTo(x+24,y+14); ctx.lineTo(x+4,H); ctx.lineTo(x-20,H);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function drawBox(size=BOX_SIZE){
  const s=size;
  ctx.save(); ctx.translate(BOX_X, box.y); ctx.rotate(box.rot);
  rr(-s/2,-s/2,s,s,7);
  ctx.fillStyle='#D9A15E'; ctx.fill();
  ctx.strokeStyle='#8a5a24'; ctx.lineWidth=2.5; ctx.stroke();
  const seamY=-s/2+s*0.28;
  ctx.fillStyle='#c99022'; ctx.fillRect(-s/2,seamY-4,s,8);
  ctx.strokeStyle='rgba(0,0,0,0.18)'; ctx.lineWidth=1.5;
  ctx.strokeRect(-s/2,seamY-4,s,8);
  const ey=seamY+9;
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.arc(-8,ey,5,0,Math.PI*2); ctx.arc(8,ey,5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#222';
  ctx.beginPath(); ctx.arc(-7,ey+1,2.2,0,Math.PI*2); ctx.arc(9,ey+1,2.2,0,Math.PI*2); ctx.fill();
  const sy=ey+11;
  ctx.strokeStyle='#3d2b14'; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(-12,sy); ctx.quadraticCurveTo(0,sy+7,12,sy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(15,sy+1); ctx.lineTo(10,sy-3); ctx.lineTo(10,sy+4);
  ctx.closePath(); ctx.fillStyle='#3d2b14'; ctx.fill();
  ctx.restore();
}
function drawMenuButton(b, label){
  ctx.save();
  ctx.translate(b.x + b.w/2, b.y + b.h/2);
  ctx.fillStyle='#fffbe9';
  ctx.strokeStyle='#3d2b14'; ctx.lineWidth=3;
  rr(-b.w/2, -b.h/2, b.w, b.h, 10);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle='#3d2b14';
  ctx.font='bold 20px Arial, sans-serif';
  ctx.textAlign='center';
  ctx.fillText(label, 0, 7);
  ctx.restore();
}
function drawShareButton(){
  // below the game-over card, centered
  ctx.save();
  ctx.translate(SHARE_BTN.x + SHARE_BTN.w/2, SHARE_BTN.y + SHARE_BTN.h/2);
  ctx.fillStyle='#000000'; // X black
  ctx.strokeStyle='#3d2b14'; ctx.lineWidth=3;
  rr(-SHARE_BTN.w/2, -SHARE_BTN.h/2, SHARE_BTN.w, SHARE_BTN.h, 10);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle='#fff';
  ctx.font='bold 17px Arial, sans-serif';
  ctx.textAlign='center';
  ctx.fillText('𝕏 Share on X', 0, 6);
  ctx.restore();
}
function draw(){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#4ec0ca'); g.addColorStop(1,'#9adfe4');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,0.85)';
  for (const c of clouds){
    ctx.beginPath();
    ctx.arc(c.x,c.y,c.s*0.5,0,Math.PI*2);
    ctx.arc(c.x+c.s*0.45,c.y+4,c.s*0.35,0,Math.PI*2);
    ctx.arc(c.x-c.s*0.45,c.y+4,c.s*0.32,0,Math.PI*2);
    ctx.fill();
  }
  drawPipes(); drawGround();
  // bigger box on the start page; gameplay box keeps BOX_SIZE
  if (state!=='splash') drawBox(state==='start' ? 64 : BOX_SIZE);

  ctx.textAlign='center';
  if (state==='splash'){
    ctx.font='bold 44px sans-serif';
    ctx.lineWidth=8; ctx.strokeStyle='#3d2b14'; ctx.fillStyle='#ffd94a';
    ctx.strokeText('BOXY BIRD', W/2, 130); ctx.fillText('BOXY BIRD', W/2, 130);
    ctx.font='18px sans-serif'; ctx.lineWidth=4;
    ctx.strokeStyle='rgba(61,43,20,.85)'; ctx.fillStyle='#fff';
    ctx.strokeText('A cardboard box with a smile', W/2, 160);
    ctx.fillText('A cardboard box with a smile', W/2, 160);
    ctx.save(); ctx.translate(W/2-BOX_X, 0); drawBox(); ctx.restore();
    drawMenuButton(NEWGAME_BTN, 'NEW GAME');
    drawMenuButton(SOUND_BTN, 'SOUND: ' + (Sfx.isEnabled() ? 'ON' : 'OFF'));
    // tiny credit, top-right corner of the sky
    ctx.font='10px Arial, sans-serif';
    ctx.fillStyle='rgba(61,43,20,0.55)'; ctx.textAlign='right';
    ctx.fillText('powered by ドーセント', W-10, 24);
    ctx.textAlign='center';
    if (hint) hint.textContent='';
  } else if (state==='start'){
    ctx.font='bold 44px sans-serif';
    ctx.lineWidth=8; ctx.strokeStyle='#3d2b14'; ctx.fillStyle='#ffd94a';
    ctx.strokeText('BOXY BIRD', W/2, 150); ctx.fillText('BOXY BIRD', W/2, 150);
    ctx.font='18px sans-serif'; ctx.lineWidth=4;
    ctx.strokeStyle='rgba(61,43,20,.85)'; ctx.fillStyle='#fff';
    ctx.strokeText('Deliver the box through the pipes!', W/2, 185);
    ctx.fillText('Deliver the box through the pipes!', W/2, 185);
    if (hint) hint.textContent='Click, tap or press Space to flap';
  } else if (state==='dead'){
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(0,0,W,H);
    const pw=310, ph=200, px2=(W-pw)/2, py=170;
    rr(px2,py,pw,ph,14); ctx.fillStyle='#fffbe9'; ctx.fill();
    ctx.strokeStyle='#3d2b14'; ctx.lineWidth=3;
    rr(px2,py,pw,ph,14); ctx.stroke();
    ctx.fillStyle='#3d2b14';
    ctx.font='bold 30px sans-serif'; ctx.fillText('GAME OVER', W/2, py+52);
    ctx.font='bold 22px sans-serif';
    ctx.fillText('Score: '+score, W/2, py+100);
    ctx.fillText('Best:  '+best, W/2, py+132);
    if (deadTimer>45){
      ctx.font='16px sans-serif'; ctx.fillStyle='#7a5c2e';
      ctx.fillText('Click or press Space to play again', W/2, py+172);
      if (hint) hint.textContent='Click or press Space to play again';
    } else if (hint) hint.textContent='';
    drawShareButton();
  } else {
    ctx.font='bold 48px sans-serif';
    ctx.lineWidth=6; ctx.strokeStyle='#3d2b14'; ctx.fillStyle='#fff';
    ctx.strokeText(score, W/2, 84); ctx.fillText(score, W/2, 84);
    if (hint) hint.textContent='';
  }
  if (flash>0){ ctx.fillStyle='rgba(255,255,255,'+flash+')'; ctx.fillRect(0,0,W,H); }
}
function loop(){ update(); draw(); requestAnimationFrame(loop); }
reset(); state='splash'; loop();
