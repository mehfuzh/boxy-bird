// ---- drawing (all procedural, no assets) ----
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
  const r = s / BOX_SIZE;
  const sy=ey+11*r;
  ctx.strokeStyle='#3d2b14'; ctx.lineWidth=3*r; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(-12*r,sy); ctx.quadraticCurveTo(0,sy+7*r,12*r,sy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(15*r,sy+1*r); ctx.lineTo(10*r,sy-3*r); ctx.lineTo(10*r,sy+4*r);
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
  // below the game-over card, centered — same cream style as the other
  // menu buttons so the page doesn't show two stacked Xs (the black
  // button + the 𝕏 glyph in the label).
  ctx.save();
  ctx.translate(SHARE_BTN.x + SHARE_BTN.w/2, SHARE_BTN.y + SHARE_BTN.h/2);
  ctx.fillStyle='#fffbe9';
  ctx.strokeStyle='#3d2b14'; ctx.lineWidth=3;
  rr(-SHARE_BTN.w/2, -SHARE_BTN.h/2, SHARE_BTN.w, SHARE_BTN.h, 10);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle='#3d2b14';
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
  // gameplay box keeps BOX_SIZE on every non-splash screen
  if (state!=='splash') drawBox(BOX_SIZE);

  ctx.textAlign='center';
  if (state==='splash'){
    ctx.font='bold 44px sans-serif';
    ctx.lineWidth=8; ctx.strokeStyle='#3d2b14'; ctx.fillStyle='#ffd94a';
    ctx.strokeText('BOXY BIRD', W/2, 130); ctx.fillText('BOXY BIRD', W/2, 130);
    ctx.font='18px sans-serif'; ctx.lineWidth=4;
    ctx.strokeStyle='rgba(61,43,20,.85)'; ctx.fillStyle='#fff';
    ctx.strokeText('A cardboard box with a smile', W/2, 160);
    ctx.fillText('A cardboard box with a smile', W/2, 160);
    // returning players see their best right away
    if (best>0){
      ctx.font='bold 16px Arial, sans-serif';
      ctx.lineWidth=3;
      ctx.strokeText('Best: '+best, W/2, 188);
      ctx.fillText('Best: '+best, W/2, 188);
    }
    ctx.save(); ctx.translate(W/2-BOX_X, 0); drawBox(80); ctx.restore();
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
    if (proMode){
      ctx.font='bold 14px Arial, sans-serif'; ctx.fillStyle='#c0392b';
      ctx.fillText('PRO MODE RUN', W/2, py+160);
    }
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
    // pro mode badge under the score
    if (proMode){
      ctx.font='bold 16px Arial, sans-serif';
      ctx.lineWidth=4; ctx.strokeStyle='#3d2b14'; ctx.fillStyle='#ffd94a';
      ctx.strokeText('PRO MODE', W/2, 112);
      ctx.fillText('PRO MODE', W/2, 112);
    }
    if (hint) hint.textContent='';
  }
  if (flash>0){ ctx.fillStyle='rgba(255,255,255,'+flash+')'; ctx.fillRect(0,0,W,H); }
}
