// ---- Easy-mode tuning + geometry ----
const _canvas = document.getElementById("game");
// Native (Capacitor iOS): fill the whole screen. Logical width stays 480
// so every tuning constant means the same thing; height follows the
// device aspect ratio (taller phones just get more sky). The backing
// store is scaled by devicePixelRatio for crisp rendering.
const _native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const W = 480;
let H = 640, VIEW_SCALE = 1, SAFE_TOP = 0;
if (_native){
  document.documentElement.classList.add('native');
  H = Math.max(640, Math.round(W * window.innerHeight / window.innerWidth));
  VIEW_SCALE = (window.devicePixelRatio || 1) * window.innerWidth / W;
  // notch / Dynamic Island inset, converted to logical game pixels
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;visibility:hidden;height:env(safe-area-inset-top);';
  document.body.appendChild(probe);
  SAFE_TOP = probe.getBoundingClientRect().height * (W / window.innerWidth);
  probe.remove();
}
_canvas.width = Math.round(W * VIEW_SCALE);
_canvas.height = Math.round(H * VIEW_SCALE);
const GRAVITY=0.32, FLAP_V=-6.0, PIPE_SPEED=2.0, PIPE_GAP=220;
const PIPE_W=72, PIPE_SPACING=270, GROUND_H=90, BOX_X=130, BOX_SIZE=46, HIT_INSET=7;
// game-over share button (below the game-over card)
const SHARE_BTN = { x:(W-190)/2, y:395, w:190, h:44 };
// splash screen buttons (3 buttons stacked, 18px gap between faces)
const NEWGAME_BTN = { x:(W-220)/2, y:362, w:220, h:44 };
const THEME_BTN   = { x:(W-220)/2, y:424, w:220, h:44 };
const SOUND_BTN   = { x:(W-220)/2, y:486, w:220, h:44 };
// viral quick wins: milestone celebrations + pro mode speed-up
const MILESTONES = [10, 25, 50];
const PRO_AT = 25;           // score that triggers PRO MODE
const PRO_SPEED_BONUS = 1.2; // extra px/frame for pipes in PRO MODE
// confetti palettes (theme-agnostic, chosen per event)
const MILESTONE_COLORS = ['#ffd94a', '#ff8c00', '#4ec0ca', '#96D955'];
const PRO_COLORS = ['#ff4444', '#ffd94a', '#ff8c00'];
const DEATH_COLORS = ['#999', '#bbb', '#777'];
