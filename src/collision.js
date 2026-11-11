// ---- hit detection + death (forgiving hitbox) ----
function die(){
  if (state!=='play') return;
  state='dead'; deadTimer=0; flash=0.7; Sfx.crash();
  if (score>best){ best=score; Store.best=best; }
}

function checkCollisions(){
  const bx=BOX_X-BOX_SIZE/2+HIT_INSET, by=box.y-BOX_SIZE/2+HIT_INSET, bs=BOX_SIZE-HIT_INSET*2;
  const floor=H-GROUND_H;
  if (box.y+BOX_SIZE/2>=floor){ box.y=floor-BOX_SIZE/2; die(); return; }
  for (const p of pipes){
    if (bx+bs>p.x && bx<p.x+PIPE_W){
      if (by<p.gapTop || by+bs>p.gapTop+PIPE_GAP){ die(); return; }
    }
  }
}
