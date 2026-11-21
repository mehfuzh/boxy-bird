// ---- hit detection + death (forgiving hitbox) ----
function die(){
  if (state!=='play') return;
  state='dead'; deadTimer=0; flash=0.7; Sfx.crash();
  // death puff: dusty grey burst as the box tips over
  spawnParticles(BOX_X, box.y, 14, DEATH_COLORS);
  if (score>best){ best=score; Store.best=best; }
}

function checkCollisions(){
  // pure rules live in src/rules.js (unit-tested via npm test)
  if (hitsFloor(box.y, H)){ box.y=H-GROUND_H-BOX_SIZE/2; die(); return; }
  for (const p of pipes){
    if (hitsPipe(box.y, p)){ die(); return; }
  }
}
