// ---- theme palettes ----
const THEMES = {
  default: {
    skyTop:'#4ec0ca', skyBot:'#9adfe4',
    cloud:'rgba(255,255,255,0.85)',
    pipeMain:'#73BF2E', pipeHi:'#96D955', pipeBorder:'#2e5b0e',
    groundBase:'#ded895', groundTop:'#5ee270', groundAccent:'#45c855',
    groundDiag:'rgba(202,190,110,0.65)',
    boxBody:'#D9A15E', boxBorder:'#8a5a24', boxSeam:'#c99022',
    cardBg:'#fffbe9', cardBorder:'#3d2b14', cardText:'#3d2b14',
    cardTop:'#fffdf2', cardBot:'#f2e3b6', cardEdge:'#b9a06a',
    titleColor:'#f5dd8f', titleShadow:'#3d2b14',
    btnFill:'#fffbe9', btnBorder:'#3d2b14', btnText:'#3d2b14',
    btnTop:'#fffdf2', btnBot:'#f2e3b6', btnEdge:'#b9a06a',
    scoreFill:'#fff', scoreStroke:'#3d2b14',
    proFill:'#ffd94a', proStroke:'#3d2b14',
    overlay:'rgba(0,0,0,0.35)',
    hintStroke:'rgba(61,43,20,.85)',
    creditColor:'rgba(61,43,20,0.55)',
    proCardText:'#c0392b',
    replayText:'#7a5c2e',
  },
  halloween: {
    skyTop:'#1a0a2e', skyBot:'#2d1b4e',
    cloud:'rgba(120,90,160,0.4)',
    pipeMain:'#e85d04', pipeHi:'#ff8c00', pipeBorder:'#8b3a00',
    groundBase:'#1a1a2e', groundTop:'#3d2b5a', groundAccent:'#2d1b4e',
    groundDiag:'rgba(60,40,90,0.5)',
    boxBody:'#D9A15E', boxBorder:'#8a5a24', boxSeam:'#c99022',
    cardBg:'#2d1b4e', cardBorder:'#ff8c00', cardText:'#ff8c00',
    cardTop:'#3d2b5a', cardBot:'#2d1b4e', cardEdge:'#1a0a2e',
    titleColor:'#ff8c00', titleShadow:'#1a0a2e',
    btnFill:'#2d1b4e', btnBorder:'#ff8c00', btnText:'#ff8c00',
    btnTop:'#3d2b5a', btnBot:'#2d1b4e', btnEdge:'#1a0a2e',
    scoreFill:'#ff8c00', scoreStroke:'#1a0a2e',
    proFill:'#ff4444', proStroke:'#1a0a2e',
    overlay:'rgba(20,5,30,0.5)',
    hintStroke:'rgba(26,10,46,.85)',
    creditColor:'rgba(255,140,0,0.55)',
    proCardText:'#ff6b6b',
    replayText:'#c9a0dc',
  }
};

// ---- drawing (all procedural, no assets) ----
// 7x7 chunky block bitmaps for the title — Flappy-Bird-style fat
// letters with 2-cell-thick strokes, no font files needed
const PIXEL_FONT = {
  'B': ['1111110','1100011','1100011','1111110','1100011','1100011','1111110'],
  'O': ['0111110','1100011','1100011','1100011','1100011','1100011','0111110'],
  'X': ['1100011','1110111','0111110','0011100','0111110','1110111','1100011'],
  'Y': ['1100011','1100011','0110110','0011100','0011100','0011100','0011100'],
  'I': ['1111111','0011100','0011100','0011100','0011100','0011100','1111111'],
  'R': ['1111110','1100011','1100011','1111110','1101100','1100110','1100011'],
  'D': ['1111110','1100011','1100011','1100011','1100011','1100011','1111110'],
  ' ': ['000','000','000','000','000','000','000'],
};
// Classic Flappy Bird logo lettering: cream-white face, thick dark
// outline, and a green extruded shadow that matches the pipes.
// Glyphs may have different widths (the space is narrower).
function drawPixelText(str, cx, top, cell){
  const T = THEMES[theme];
  const gap = cell; // one empty column between letters
  const glyphs = [...str].map(ch => PIXEL_FONT[ch] || PIXEL_FONT[' ']);
  const w = glyphs.reduce((s, g) => s + g[0].length * cell, 0) + gap * (glyphs.length - 1);
  const x0 = cx - w / 2;
  const h = glyphs[0].length * cell;
  const draw = (ox, oy, col) => {
    ctx.fillStyle = col;
    let x = x0;
    for (const g of glyphs){
      for (let r = 0; r < g.length; r++)
        for (let c = 0; c < g[r].length; c++)
          if (g[r][c] === '1')
            ctx.fillRect(x + c * cell + ox, top + r * cell + oy, cell, cell);
      x += g[0].length * cell + gap;
    }
  };
  const depth = Math.round(cell * 0.7);
  draw(depth + 3, depth + 4, 'rgba(0,0,0,0.22)'); // soft cast shadow
  // green extruded shadow, darker toward the back (logo + pipe green)
  for (let d = depth; d >= 1; d--)
    draw(d, d, d > depth / 2 ? T.pipeBorder : T.pipeMain);
  // bold dark outline around the face
  const o = Math.max(2, cell * 0.3);
  for (const [ox, oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,-o],[-o,o],[o,o]])
    draw(ox, oy, T.titleShadow);
  // bevel: white top edge, then the cream face shifted slightly down
  draw(0, 0, '#ffffff');
  const g = ctx.createLinearGradient(0, top, 0, top + h);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.55, '#fdf3cd');
  g.addColorStop(1, T.titleColor);
  draw(0, cell * 0.22, g);
}
// shared title style: same pixel font, size, and position on
// both the splash and start screens so branding stays consistent.
function drawTitle(){
  drawPixelText('BOXY BIRD', W/2, 100, 6);
}
function rr(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
function drawPipes(){
  const T = THEMES[theme];
  for (const p of pipes){
    const bt=p.gapTop+PIPE_GAP;
    // top pipe
    ctx.fillStyle=T.pipeMain; ctx.fillRect(p.x,0,PIPE_W,p.gapTop-26);
    ctx.fillStyle=T.pipeHi; ctx.fillRect(p.x+6,0,10,p.gapTop-26);
    ctx.fillStyle=T.pipeMain; ctx.fillRect(p.x-5,p.gapTop-26,PIPE_W+10,26);
    ctx.strokeStyle=T.pipeBorder; ctx.lineWidth=2;
    ctx.strokeRect(p.x-4,p.gapTop-25,PIPE_W+8,24);
    // bottom pipe
    ctx.fillStyle=T.pipeMain; ctx.fillRect(p.x-5,bt,PIPE_W+10,26);
    ctx.fillStyle=T.pipeHi; ctx.fillRect(p.x+1,bt+3,10,20);
    ctx.strokeStyle=T.pipeBorder; ctx.strokeRect(p.x-4,bt+1,PIPE_W+8,24);
    ctx.fillStyle=T.pipeMain; ctx.fillRect(p.x,bt+26,PIPE_W,H-GROUND_H-bt-26);
    ctx.fillStyle=T.pipeHi; ctx.fillRect(p.x+6,bt+26,10,H-GROUND_H-bt-26);
  }
}
function drawGround(){
  const T = THEMES[theme];
  const y=H-GROUND_H;
  ctx.fillStyle=T.groundBase; ctx.fillRect(0,y,W,GROUND_H);
  ctx.fillStyle=T.groundTop; ctx.fillRect(0,y,W,14);
  ctx.fillStyle=T.groundAccent; ctx.fillRect(0,y+12,W,3);
  ctx.save(); ctx.beginPath(); ctx.rect(0,y+14,W,GROUND_H-14); ctx.clip();
  ctx.fillStyle=T.groundDiag;
  for (let x=groundX-48; x<W+48; x+=48){
    ctx.beginPath();
    ctx.moveTo(x,y+14); ctx.lineTo(x+24,y+14); ctx.lineTo(x+4,H); ctx.lineTo(x-20,H);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
// The Boxy Bird logo: a bold 3D cardboard box (top + side faces,
// gradient-lit front, tape, big eyes and an Amazon-orange smile).
function drawBox(size=BOX_SIZE){
  const T = THEMES[theme];
  const s=size;
  const d=s*0.16;          // 3D depth of the top/right faces
  const r=s/BOX_SIZE;      // scale factor vs the gameplay box
  ctx.save(); ctx.translate(BOX_X, box.y); ctx.rotate(box.rot);
  ctx.lineJoin='round';
  ctx.strokeStyle='#6b4518'; ctx.lineWidth=Math.max(2.5, 3*r);
  // top face
  ctx.beginPath();
  ctx.moveTo(-s/2,-s/2); ctx.lineTo(-s/2+d,-s/2-d);
  ctx.lineTo(s/2+d,-s/2-d); ctx.lineTo(s/2,-s/2); ctx.closePath();
  ctx.fillStyle='#f0c98c'; ctx.fill(); ctx.stroke();
  // tape strip across the top face
  ctx.beginPath();
  ctx.moveTo(-s*0.09,-s/2); ctx.lineTo(-s*0.09+d,-s/2-d);
  ctx.lineTo(s*0.09+d,-s/2-d); ctx.lineTo(s*0.09,-s/2); ctx.closePath();
  ctx.fillStyle='#d9a441'; ctx.fill();
  // right face (in shade)
  ctx.beginPath();
  ctx.moveTo(s/2,-s/2); ctx.lineTo(s/2+d,-s/2-d);
  ctx.lineTo(s/2+d,s/2-d); ctx.lineTo(s/2,s/2); ctx.closePath();
  ctx.fillStyle='#a9743a'; ctx.fill(); ctx.stroke();
  // front face with a vertical light gradient
  const fg=ctx.createLinearGradient(0,-s/2,0,s/2);
  fg.addColorStop(0,'#e9bc7d'); fg.addColorStop(1,'#cf9350');
  rr(-s/2,-s/2,s,s,7);
  ctx.fillStyle=fg; ctx.fill(); ctx.stroke();
  // inner lighting: bright left edge, shaded bottom (clipped to the face)
  ctx.save();
  rr(-s/2,-s/2,s,s,7); ctx.clip();
  ctx.fillStyle='rgba(255,255,255,0.28)';
  ctx.fillRect(-s/2+2,-s/2+2,4*r,s-4);
  ctx.fillStyle='rgba(0,0,0,0.12)';
  ctx.fillRect(-s/2,s/2-6*r,s,6*r);
  ctx.restore();
  // tape seam across the front
  const seamY=-s/2+s*0.28;
  const tg=ctx.createLinearGradient(0,seamY-4,0,seamY+5);
  tg.addColorStop(0,'#e8b23a'); tg.addColorStop(1,'#c99022');
  ctx.fillStyle=tg; ctx.fillRect(-s/2,seamY-4,s,9);
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fillRect(-s/2,seamY-4,s,2);
  ctx.strokeStyle='rgba(0,0,0,0.22)'; ctx.lineWidth=1.5;
  ctx.strokeRect(-s/2,seamY-4,s,9);
  // big bold eyes
  const ey=seamY+10*r;
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.arc(-8*r,ey,5.5*r,0,Math.PI*2); ctx.arc(8*r,ey,5.5*r,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(61,43,20,0.5)'; ctx.lineWidth=1.2*r;
  ctx.beginPath(); ctx.arc(-8*r,ey,5.5*r,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(8*r,ey,5.5*r,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='#222';
  ctx.beginPath(); ctx.arc(-7*r,ey+1*r,2.4*r,0,Math.PI*2); ctx.arc(9*r,ey+1*r,2.4*r,0,Math.PI*2); ctx.fill();
  // bold Amazon-orange smile with a dark under-stroke
  const sy=ey+11*r;
  ctx.lineCap='round';
  ctx.strokeStyle='#3d2b14'; ctx.lineWidth=5.5*r;
  ctx.beginPath(); ctx.moveTo(-12*r,sy); ctx.quadraticCurveTo(0,sy+7*r,12*r,sy); ctx.stroke();
  ctx.strokeStyle='#ff9900'; ctx.lineWidth=3.2*r;
  ctx.beginPath(); ctx.moveTo(-12*r,sy); ctx.quadraticCurveTo(0,sy+7*r,12*r,sy); ctx.stroke();
  // smile arrowhead
  ctx.beginPath(); ctx.moveTo(16*r,sy+1*r); ctx.lineTo(9.5*r,sy-4*r); ctx.lineTo(9.5*r,sy+5*r);
  ctx.closePath();
  ctx.fillStyle='#ff9900'; ctx.fill();
  ctx.strokeStyle='#3d2b14'; ctx.lineWidth=1.6*r; ctx.stroke();
  ctx.restore();
}
// Chunky extruded 3D panel (buttons + game-over card share this look).
function draw3DPanel(x,y,w,h,r,depth,faceTop,faceBottom,edge){
  ctx.strokeStyle=THEMES[theme].cardBorder; ctx.lineWidth=3;
  rr(x,y+depth,w,h,r); ctx.fillStyle=edge; ctx.fill(); ctx.stroke();
  const g=ctx.createLinearGradient(0,y,0,y+h);
  g.addColorStop(0,faceTop); g.addColorStop(1,faceBottom);
  rr(x,y,w,h,r); ctx.fillStyle=g; ctx.fill(); ctx.stroke();
  // glossy top highlight
  ctx.fillStyle='rgba(255,255,255,0.45)';
  rr(x+6,y+4,w-12,7,4); ctx.fill();
}
function draw3DButton(b, label, primary, fontSize){
  const T = THEMES[theme];
  if (primary)
    draw3DPanel(b.x,b.y,b.w,b.h,12,6,T.pipeHi,T.pipeMain,T.pipeBorder);
  else
    draw3DPanel(b.x,b.y,b.w,b.h,12,6,T.btnTop,T.btnBot,T.btnEdge);
  ctx.textAlign='center';
  ctx.font='bold '+fontSize+'px Arial, sans-serif';
  const tx=b.x+b.w/2, ty=b.y+b.h/2+fontSize*0.35;
  if (primary){
    ctx.lineWidth=4; ctx.strokeStyle=T.titleShadow; ctx.lineJoin='round';
    ctx.strokeText(label, tx, ty);
    ctx.fillStyle='#fff'; ctx.fillText(label, tx, ty);
  } else {
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillText(label, tx, ty+1.5);
    ctx.fillStyle=T.btnText; ctx.fillText(label, tx, ty);
  }
}
// confetti: small rotated rects, alpha fades with remaining lifetime
function drawParticles(){
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H-GROUND_H); ctx.clip(); // stay in play area
  for (const p of particles){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.atan2(p.vy, p.vx));
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / Math.max(1, p.maxLife)));
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
    ctx.restore();
  }
  ctx.restore();
}
function drawMenuButton(b, label){
  draw3DButton(b, label, label==='NEW GAME', 20);
}
function drawShareButton(){
  // below the game-over card, centered — same 3D style as the other
  // menu buttons so the page doesn't show two stacked Xs (the black
  // button + the 𝕏 glyph in the label).
  draw3DButton(SHARE_BTN, '𝕏 Share on X', false, 17);
}
function draw(){
  const T = THEMES[theme];
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,T.skyTop); g.addColorStop(1,T.skyBot);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.fillStyle=T.cloud;
  for (const c of clouds){
    ctx.beginPath();
    ctx.arc(c.x,c.y,c.s*0.5,0,Math.PI*2);
    ctx.arc(c.x+c.s*0.45,c.y+4,c.s*0.35,0,Math.PI*2);
    ctx.arc(c.x-c.s*0.45,c.y+4,c.s*0.32,0,Math.PI*2);
    ctx.fill();
  }
  drawPipes(); drawGround();
  // gameplay box keeps BOX_SIZE on every non-splash screen
  if (state!=='splash') drawBox(BOX_SIZE);
  drawParticles();

  ctx.textAlign='center';
  if (state==='splash'){
    // center the whole splash block vertically in the safe area
    // (clears the iOS Dynamic Island / notch via SAFE_TOP)
    ctx.save(); ctx.translate(0, SPLASH_DY);
    // same pixel-font title on splash and start (see drawTitle)
    drawTitle();
    ctx.font='bold 18px Arial, sans-serif'; ctx.lineWidth=4; ctx.lineJoin='round';
    ctx.strokeStyle=T.hintStroke; ctx.fillStyle='#fff';
    ctx.strokeText('A cardboard box with a smile', W/2, 176);
    ctx.fillText('A cardboard box with a smile', W/2, 176);
    // returning players see their best right away
    if (best>0){
      ctx.font='bold 16px Arial, sans-serif';
      ctx.lineWidth=3;
      ctx.strokeText('Best: '+best, W/2, 204);
      ctx.fillText('Best: '+best, W/2, 204);
    }
    // warm glow behind the logo box + floating ground shadow
    const glow=ctx.createRadialGradient(W/2,box.y,10,W/2,box.y,120);
    glow.addColorStop(0,'rgba(255,244,200,0.55)');
    glow.addColorStop(1,'rgba(255,244,200,0)');
    ctx.fillStyle=glow;
    ctx.beginPath(); ctx.arc(W/2,box.y,120,0,Math.PI*2); ctx.fill();
    const lift=box.y-265; // splash bob offset (see world.js)
    ctx.fillStyle='rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(W/2,338,46+lift*0.9,9+lift*0.15,0,0,Math.PI*2);
    ctx.fill();
    ctx.save(); ctx.translate(W/2-BOX_X, 0); drawBox(84); ctx.restore();
    drawMenuButton(NEWGAME_BTN, 'NEW GAME');
    drawMenuButton(THEME_BTN, 'THEME: ' + theme.toUpperCase());
    drawMenuButton(SOUND_BTN, 'SOUND: ' + (Sfx.isEnabled() ? 'ON' : 'OFF'));
    ctx.restore();
    // tiny credit, top-right corner of the sky
    ctx.font='10px Arial, sans-serif';
    ctx.fillStyle=T.creditColor; ctx.textAlign='right';
    ctx.fillText('powered by ドーセント', W-10, 24+SAFE_TOP);
    ctx.textAlign='center';
    if (hint) hint.textContent='';
  } else if (state==='start'){
    // same pixel-font title as the splash screen, at the same shifted
    // position (SPLASH_DY) so branding stays put and clears the island
    ctx.save(); ctx.translate(0, SPLASH_DY);
    drawTitle();
    ctx.font='bold 18px Arial, sans-serif'; ctx.lineWidth=4; ctx.lineJoin='round';
    ctx.strokeStyle=T.hintStroke; ctx.fillStyle='#fff';
    ctx.strokeText('Deliver the box through the pipes!', W/2, 185);
    ctx.fillText('Deliver the box through the pipes!', W/2, 185);
    ctx.restore();
    if (hint) hint.textContent='Click, tap or press Space to flap';
  } else if (state==='dead'){
    ctx.fillStyle=T.overlay; ctx.fillRect(0,0,W,H);
    // center the card + share button in the safe area (below the island)
    ctx.save(); ctx.translate(0, DEAD_DY);
    const pw=310, ph=200, px2=(W-pw)/2, py=170;
    draw3DPanel(px2,py,pw,ph,14,7,T.cardTop,T.cardBot,T.cardEdge);
    ctx.textAlign='center';
    ctx.font='bold 30px sans-serif';
    ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.fillText('GAME OVER', W/2, py+54);
    ctx.fillStyle=T.cardText; ctx.fillText('GAME OVER', W/2, py+52);
    ctx.font='bold 22px sans-serif';
    ctx.fillText('Score: '+score, W/2, py+100);
    ctx.fillText('Best:  '+best, W/2, py+132);
    if (proMode){
      ctx.font='bold 14px Arial, sans-serif'; ctx.fillStyle=T.proCardText;
      ctx.fillText('PRO MODE RUN', W/2, py+160);
    }
    if (deadTimer>45){
      ctx.font='16px sans-serif'; ctx.fillStyle=T.replayText;
      ctx.fillText('Click or press Space to play again', W/2, py+172);
      if (hint) hint.textContent='Click or press Space to play again';
    } else if (hint) hint.textContent='';
    drawShareButton();
    ctx.restore();
  } else {
    // extruded 3D score — shadow matches the logo lettering / pipes
    ctx.font='bold 52px sans-serif';
    ctx.fillStyle=T.pipeBorder;
    for (let d=4; d>=1; d--) ctx.fillText(score, W/2+d, 84+SAFE_TOP+d);
    ctx.lineWidth=6; ctx.lineJoin='round';
    ctx.strokeStyle=T.scoreStroke; ctx.fillStyle=T.scoreFill;
    ctx.strokeText(score, W/2, 84+SAFE_TOP); ctx.fillText(score, W/2, 84+SAFE_TOP);
    // pro mode badge under the score
    if (proMode){
      ctx.font='bold 16px Arial, sans-serif';
      ctx.lineWidth=4; ctx.strokeStyle=T.proStroke; ctx.fillStyle=T.proFill;
      ctx.strokeText('PRO MODE', W/2, 112+SAFE_TOP);
      ctx.fillText('PRO MODE', W/2, 112+SAFE_TOP);
    }
    if (hint) hint.textContent='';
  }
  if (flash>0){ ctx.fillStyle='rgba(255,255,255,'+flash+')'; ctx.fillRect(0,0,W,H); }
}
