// ---- Easy-mode tuning + geometry ----
const GRAVITY=0.32, FLAP_V=-6.0, PIPE_SPEED=2.0, PIPE_GAP=220;
const PIPE_W=72, PIPE_SPACING=270, GROUND_H=90, BOX_X=130, BOX_SIZE=46, HIT_INSET=7;
// game-over share button (below the game-over card)
const SHARE_BTN = { x:(W-190)/2, y:395, w:190, h:44 };
// splash screen buttons (3 buttons stacked)
const NEWGAME_BTN = { x:(W-220)/2, y:370, w:220, h:48 };
const THEME_BTN   = { x:(W-220)/2, y:426, w:220, h:48 };
const SOUND_BTN   = { x:(W-220)/2, y:482, w:220, h:48 };
// viral quick wins: milestone celebrations + pro mode speed-up
const MILESTONES = [10, 25, 50];
const PRO_AT = 25;           // score that triggers PRO MODE
const PRO_SPEED_BONUS = 1.2; // extra px/frame for pipes in PRO MODE
// confetti palettes (theme-agnostic, chosen per event)
const MILESTONE_COLORS = ['#ffd94a', '#ff8c00', '#4ec0ca', '#96D955'];
const PRO_COLORS = ['#ff4444', '#ffd94a', '#ff8c00'];
const DEATH_COLORS = ['#999', '#bbb', '#777'];
