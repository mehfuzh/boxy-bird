// ---- world state + physics simulation ----
const Sfx = window.BoxySound;

let state, box, pipes, score, frames, groundX, clouds, deadTimer, flash;
let best = Store.best;
let proMode = false;

function reset(){
  state='start'; box={y:H/2-60, vy:0, rot:0}; pipes=[]; score=0;
  frames=0; deadTimer=0; flash=0; groundX=0; clouds=[]; proMode=false;
  for (let i=0;i<5;i++) clouds.push({x:Math.random()*W, y:40+Math.random()*180, s:30+Math.random()*40});
}

function spawnPipe(){
  const minTop=70, maxTop=H-GROUND_H-PIPE_GAP-70;
  pipes.push({x:W+20, gapTop:minTop+Math.random()*(maxTop-minTop), scored:false});
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

  const spd = PIPE_SPEED + (proMode ? PRO_SPEED_BONUS : 0);
  if (pipes.length===0 || pipes[pipes.length-1].x < W-PIPE_SPACING) spawnPipe();
  for (const p of pipes){
    p.x-=spd;
    if (!p.scored && p.x+PIPE_W < BOX_X){
      p.scored=true; score++; Sfx.score();
      // milestone celebrations: flash + fanfare at 10/25/50
      if (MILESTONES.includes(score)){ flash=0.5; Sfx.milestone(); }
      // pro mode kicks in at PRO_AT: pipes scroll faster
      if (score===PRO_AT){ proMode=true; flash=0.6; Sfx.pro(); }
    }
  }
  pipes = pipes.filter(p => p.x > -PIPE_W-10);
  groundX = (groundX-spd)%48;

  checkCollisions();
}
