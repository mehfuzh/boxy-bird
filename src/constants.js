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
}
// notch / Dynamic Island inset, converted to logical game pixels.
// WKWebView can report env(safe-area-inset-top) as 0 on the very first
// layout pass, so this is re-run on the next frame and on every resize.
// If the CSS inset stays 0 (Capacitor's contentInset:"never" webview may
// never expose it), fall back to the known iPhone safe-area top from the
// screen size — slightly generous values only push content down a little.
function measureSafeTop(){
  if (!_native) return;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);';
  document.body.appendChild(probe);
  let px = probe.getBoundingClientRect().height;
  probe.remove();
  if (px === 0){
    const sh = Math.max(screen.width, screen.height); // points, portrait-safe
    px = sh >= 950 ? 62   // 16 Pro Max class
       : sh >= 850 ? 59   // Dynamic Island (14 Pro / 15 / 16 …)
       : sh >= 812 ? 48   // notch (X … 14 Plus)
       : 20;              // classic status bar (SE etc.)
  }
  SAFE_TOP = px * (W / window.innerWidth);
  SPLASH_DY = Math.round((SAFE_TOP + H - SPLASH_BLOCK_TOP - SPLASH_BLOCK_BOT) / 2);
  DEAD_DY = Math.round((SAFE_TOP + H - DEAD_BLOCK_TOP - DEAD_BLOCK_BOT) / 2);
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
// splash block extents: title top (100) .. SOUND button bottom (530) + 6px depth
const SPLASH_BLOCK_TOP = 100, SPLASH_BLOCK_BOT = 536;
// vertical offset that centers the splash block in the safe area —
// below the notch / Dynamic Island (SAFE_TOP), above the bottom edge
let SPLASH_DY = Math.round((SAFE_TOP + H - SPLASH_BLOCK_TOP - SPLASH_BLOCK_BOT) / 2);
// game-over block extents: card top (170) .. share button bottom (439) + 6px depth
const DEAD_BLOCK_TOP = 170, DEAD_BLOCK_BOT = 445;
// centers the game-over card + share button in the safe area
let DEAD_DY = Math.round((SAFE_TOP + H - DEAD_BLOCK_TOP - DEAD_BLOCK_BOT) / 2);
measureSafeTop(); // initial inset probe (re-checked next frame, see main.js)
// viral quick wins: milestone celebrations + pro mode speed-up
const MILESTONES = [10, 25, 50];
const PRO_AT = 25;           // score that triggers PRO MODE
const PRO_SPEED_BONUS = 1.2; // extra px/frame for pipes in PRO MODE
// confetti palettes (theme-agnostic, chosen per event)
const MILESTONE_COLORS = ['#ffd94a', '#ff8c00', '#4ec0ca', '#96D955'];
const PRO_COLORS = ['#ff4444', '#ffd94a', '#ff8c00'];
const DEATH_COLORS = ['#999', '#bbb', '#777'];
