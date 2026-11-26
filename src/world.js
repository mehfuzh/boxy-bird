// ---- world state + physics simulation ----
const Sfx = window.BoxySound;

let state, box, pipes, score, frames, groundX, clouds, deadTimer, flash, particles = [];
let best = Store.best;
let theme = Store.theme;
let proMode = false;
let paused = false; // auto-pause on tab/window focus loss (issue #28)

function reset(){
  state='start'; box={y:H/2-60, vy:0, rot:0}; pipes=[]; score=0;
  frames=0; deadTimer=0; flash=0; groundX=0; clouds=[]; proMode=false; particles=[]; paused=false;
  for (let i=0;i<5;i++) clouds.push({x:Math.random()*W, y:40+Math.random()*180, s:30+Math.random()*40});
}

function spawnPipe(){
  // keep gaps below the notch / Dynamic Island so they're always visible
  const {minTop, maxTop} = pipeGapBounds(H, SAFE_TOP);
  pipes.push({x:W+20, gapTop:minTop+Math.random()*(maxTop-minTop), scored:false});
}

// ---- confetti particles (pooled array, no per-frame allocation) ----
const PARTICLE_POOL = [];
function spawnParticles(x, y, count, palette){
  for (let i=0; i<count; i++){
    const a = Math.random()*Math.PI*2;
    const v = 1.5 + Math.random()*3.5;
    const p = PARTICLE_POOL.pop() || {};
    p.x=x; p.y=y;
    p.vx=Math.cos(a)*v; p.vy=Math.sin(a)*v-1.5;
    p.life=p.maxLife=40+Math.random()*30;
    p.color=palette[Math.floor(Math.random()*palette.length)];
    p.size=3+Math.random()*4;
    particles.push(p);
  }
}
function updateParticles(){
  for (const p of particles){
    p.vy+=GRAVITY*0.5; p.x+=p.vx; p.y+=p.vy; p.life--;
  }
  for (let i=particles.length-1; i>=0; i--){
    if (particles[i].life<=0){ PARTICLE_POOL.push(particles[i]); particles.splice(i,1); }
  }
}

// cycle through every palette in THEMES (issue #32) — adding a theme
// there automatically extends the button cycle, no changes needed here
function cycleTheme(){
  theme = nextThemeName(theme, Object.keys(THEMES));
  Store.theme = theme;
}

// freeze the whole simulation while paused (tab/window lost focus mid-run)
function pauseIfPlaying(){ if (state==='play') paused=true; }

function update(){
  if (paused) return;
  frames++;
  if (flash>0) flash=Math.max(0, flash-0.06);
  updateParticles();
  for (const c of clouds){ c.x-=0.35; if (c.x<-90){ c.x=W+40; c.y=40+Math.random()*180; } }

  if (state==='splash'){
    // gentle float: bob up/down + slight tilt (render.js draws a shadow
    // under the logo box that tracks this offset)
    box.y = 265 + Math.sin(frames*0.05)*6;
    box.rot = Math.sin(frames*0.05)*0.08;
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
  if (box.y<24+SAFE_TOP){ box.y=24+SAFE_TOP; box.vy=Math.max(box.vy,0); } // no ceiling death; stay below the island

  const spd = PIPE_SPEED + (proMode ? PRO_SPEED_BONUS : 0);
  if (pipes.length===0 || pipes[pipes.length-1].x < W-PIPE_SPACING) spawnPipe();
  for (const p of pipes){
    p.x-=spd;
    if (!p.scored && p.x+PIPE_W < BOX_X){
      p.scored=true; score++; Sfx.score();
      const ev = nextScoreState(score);
      // milestone celebrations: confetti burst + fanfare at 10/25/50
      if (ev.milestone){
        flash=0.3; Sfx.milestone();
        spawnParticles(BOX_X, box.y, 30, MILESTONE_COLORS);
      }
      // pro mode kicks in at PRO_AT: pipes scroll faster + big burst
      if (ev.pro){
        proMode=true; flash=0.4; Sfx.pro();
        spawnParticles(BOX_X, box.y, 50, PRO_COLORS);
      }
    }
  }
  pipes = pipes.filter(p => p.x > -PIPE_W-10);
  groundX = (groundX-spd)%48;

  checkCollisions();
}
