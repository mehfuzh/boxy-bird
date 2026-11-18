// ---- entry point: canvas setup + boot ----
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hint = document.getElementById("hint");
// W, H, VIEW_SCALE are defined in src/constants.js (loaded first)
ctx.setTransform(VIEW_SCALE, 0, 0, VIEW_SCALE, 0, 0);
if (_native){
  // re-fit on rotation / window changes (iPad split view, etc.)
  window.addEventListener('resize', () => {
    H = Math.max(640, Math.round(W * window.innerHeight / window.innerWidth));
    VIEW_SCALE = (window.devicePixelRatio || 1) * window.innerWidth / W;
    canvas.width = Math.round(W * VIEW_SCALE);
    canvas.height = Math.round(H * VIEW_SCALE);
    ctx.setTransform(VIEW_SCALE, 0, 0, VIEW_SCALE, 0, 0);
  });
}

function loop(){ update(); draw(); requestAnimationFrame(loop); }
reset(); state='splash'; initInput(); loop();
