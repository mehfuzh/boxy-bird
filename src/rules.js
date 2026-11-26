// ---- pure game rules (hitbox, scoring triggers, pipe bounds) ----
// Loaded after constants.js; no DOM, no mutable state. Shared by
// src/collision.js + src/world.js and mirrored in the standalone
// index.html, so the Node tests (test/rules.test.mjs) exercise the
// exact same logic the browser runs.
function hitsFloor(boxY, height){
  // floor death uses the FULL box — deliberately unforgiving
  return boxY + BOX_SIZE / 2 >= height - GROUND_H;
}
function hitsPipe(boxY, pipe){
  // forgiving hitbox: inset HIT_INSET px on every side
  const bx = BOX_X - BOX_SIZE/2 + HIT_INSET;
  const by = boxY - BOX_SIZE/2 + HIT_INSET;
  const bs = BOX_SIZE - HIT_INSET*2;
  if (!(bx + bs > pipe.x && bx < pipe.x + PIPE_W)) return false;
  return by < pipe.gapTop || by + bs > pipe.gapTop + PIPE_GAP;
}
// what reaching `score` triggers (milestone fanfare/confetti, PRO MODE)
function nextScoreState(score){
  return { milestone: MILESTONES.includes(score), pro: score === PRO_AT };
}
// vertical bounds for a pipe's gap top — always fully on-screen,
// below the notch / Dynamic Island (safeTop)
function pipeGapBounds(height, safeTop){
  const minTop = 70 + safeTop;
  return { minTop, maxTop: height - GROUND_H - PIPE_GAP - 70 };
}
// ---- themes (issue #32) ----
// Pure helpers over an ordered list of theme names (Object.keys(THEMES)),
// so adding a palette to THEMES automatically joins the button cycle.
function isThemeName(name, names){
  return names.includes(name);
}
// next theme in the cycle; unknown current names wrap back to the first
function nextThemeName(current, names){
  return names[(names.indexOf(current) + 1) % names.length];
}
// season → theme for a first visit (no stored choice). Uses the date's
// LOCAL month (the player's own timezone via `new Date()`) AND hemisphere,
// derived from the IANA timezone name. Northern months:
// Nov–Feb winter · Mar–May default (spring) · Jun–Aug summer · Sep–Oct fall.
// Southern zones (e.g. America/Sao_Paulo) shift by 6 months, so late
// November boots summer in South America. Halloween stays a manual pick.
// player's IANA timezone (e.g. 'America/Argentina/Buenos_Aires'); '' if the
// environment has no Intl — unknown zones default to northern seasons
function localTimeZone(){
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; }
  catch (e) { return ''; }
}
// southern-hemisphere IANA zones: South America below the equator (the
// tropical north — Bogota, Caracas, the Guianas, Panama — stays northern),
// Australia/NZ/Pacific, southern Africa, Madagascar/Indian Ocean, Antarctica
function isSouthernHemisphereZone(tz){
  if (!tz) return false;
  const SOUTH_PREFIXES = [
    'America/Argentina/', 'America/Santiago', 'America/Punta_Arenas', 'America/Coyhaique',
    'America/Montevideo', 'America/Asuncion', 'America/La_Paz',
    'America/Sao_Paulo', 'America/Bahia', 'America/Fortaleza', 'America/Recife',
    'America/Araguaina', 'America/Maceio', 'America/Belem', 'America/Santarem',
    'America/Campo_Grande', 'America/Cuiaba', 'America/Porto_Velho',
    'America/Boa_Vista', 'America/Manaus', 'America/Rio_Branco', 'America/Eirunepe',
    'Australia/', 'Pacific/Auckland', 'Pacific/Chatham', 'Pacific/Fiji',
    'Pacific/Tongatapu', 'Pacific/Apia', 'Pacific/Noumea', 'Pacific/Port_Moresby',
    'Pacific/Guadalcanal', 'Pacific/Efate', 'Pacific/Pago_Pago', 'Pacific/Rarotonga',
    'Pacific/Tahiti', 'Pacific/Marquesas', 'Pacific/Gambier', 'Pacific/Niue',
    'Africa/Johannesburg', 'Africa/Maseru', 'Africa/Mbabane', 'Africa/Windhoek',
    'Africa/Gaborone', 'Africa/Harare', 'Africa/Lusaka', 'Africa/Maputo',
    'Africa/Blantyre', 'Africa/Luanda', 'Africa/Dar_es_Salaam', 'Africa/Nairobi',
    'Indian/Antananarivo', 'Indian/Mauritius', 'Indian/Reunion', 'Indian/Mayotte',
    'Indian/Comoro', 'Indian/Kerguelen', 'Atlantic/Stanley', 'Atlantic/South_Georgia',
    'Antarctica/',
  ];
  return SOUTH_PREFIXES.some(p => tz.startsWith(p));
}
function seasonalThemeName(date, timeZone){
  const tz = timeZone === undefined ? localTimeZone() : timeZone;
  const m = date.getMonth();
  // southern hemisphere: the seasons are flipped — Nov–Feb is summer,
  // Mar–May fall, Jun–Aug winter, Sep–Oct spring. A single ±6 month shift
  // can't express this (the buckets aren't symmetric: 4 winter / 3 spring /
  // 3 summer / 2 fall months), so pick the bucket table by hemisphere.
  if (isSouthernHemisphereZone(tz)){
    if (m >= 10 || m <= 1) return 'summer';
    if (m <= 4) return 'fall';
    if (m <= 7) return 'winter';
    return 'default';
  }
  if (m >= 10 || m <= 1) return 'winter';
  if (m <= 4) return 'default';
  if (m <= 7) return 'summer';
  return 'fall';
}
