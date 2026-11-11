// ---- entry point: canvas setup + boot ----
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const hint = document.getElementById("hint");

function loop(){ update(); draw(); requestAnimationFrame(loop); }
reset(); state='splash'; initInput(); loop();
