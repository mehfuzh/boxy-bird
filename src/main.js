// ---- entry point: canvas setup + boot ----
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hint = document.getElementById("hint");
// W and H are defined in src/constants.js (loaded first)

function loop(){ update(); draw(); requestAnimationFrame(loop); }
reset(); state='splash'; initInput(); loop();
