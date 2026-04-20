'use strict';

// ============================================================
// SUPABASE CONFIG
// ============================================================
// 1) Supabase 프로젝트에서 아래 SQL로 테이블 생성:
//
//   create table public.scores (
//     id         bigserial primary key,
//     nickname   text    not null check (char_length(nickname) <= 20),
//     score      integer not null check (score >= 0),
//     level      integer not null check (level >= 1),
//     created_at timestamptz not null default now()
//   );
//   alter table public.scores enable row level security;
//   create policy "public read"   on public.scores for select using (true);
//   create policy "public insert" on public.scores for insert with check (true);
//
// 2) 아래 두 값을 본인 프로젝트의 URL / anon key 로 교체하면 스코어보드 활성화.

const SUPABASE_URL = 'https://eddqawlpcsdchcqjwxkw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vAmeZlNZ46Nwg05J8UXuAg_bNqvqCDG';

const _sb = (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && typeof window.supabase !== 'undefined')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// ============================================================
// CONFIG
// ============================================================

const THEMES = {
  office: {
    name: '오피스', emoji: '🏢',
    deskBg: 'repeating-linear-gradient(90deg,transparent,transparent 48px,rgba(0,0,0,0.025) 48px,rgba(0,0,0,0.025) 49px),linear-gradient(175deg,#d4a55a 0%,#c49040 55%,#b07828 100%)',
    deskBorder: '#9a6820',
    itemTypes: {
      file:   { zoneId: 'filebox',      variants: [{ emoji: '📄', label: '문서' },     { emoji: '📊', label: '차트' },    { emoji: '📑', label: '보고서' }, { emoji: '📈', label: '그래프' }, { emoji: '📉', label: '분석표' }] },
      coffee: { zoneId: 'shelf',        variants: [{ emoji: '☕', label: '커피' },     { emoji: '🥤', label: '아이스 음료' }, { emoji: '🧋', label: '버블티' }] },
      note:   { zoneId: 'noticeboard',  variants: [{ emoji: '📝', label: '메모' },     { emoji: '🗒️', label: '노트' },   { emoji: '📌', label: '포스트잇' }] },
      pen:    { zoneId: 'pencilholder', variants: [{ emoji: '✏️', label: '연필' },     { emoji: '🖊️', label: '볼펜' },   { emoji: '🖋️', label: '만년필' }] },
      book:   { zoneId: 'bookshelf',    variants: [{ emoji: '📚', label: '책' },       { emoji: '📖', label: '책' },      { emoji: '📓', label: '노트' },   { emoji: '📔', label: '다이어리' }, { emoji: '📒', label: '노트' }] },
    },
    zonesConfig: {
      filebox:      { label: '파일함', emoji: '🗂️', accepts: 'file' },
      shelf:        { label: '선반',   emoji: '🪴',  accepts: 'coffee' },
      noticeboard:  { label: '메모판', emoji: '📋', accepts: 'note' },
      pencilholder: { label: '펜꽂이', emoji: '🖊️', accepts: 'pen' },
      bookshelf:    { label: '책장',   emoji: '📖', accepts: 'book' },
    },
  },
  cafe: {
    name: '카페', emoji: '☕',
    deskBg: 'repeating-linear-gradient(90deg,transparent,transparent 48px,rgba(0,0,0,0.025) 48px,rgba(0,0,0,0.025) 49px),linear-gradient(175deg,#e8d5b0 0%,#d4b896 55%,#c4a07a 100%)',
    deskBorder: '#a87d50',
    itemTypes: {
      drink:   { zoneId: 'traytop',    variants: [{ emoji: '☕', label: '아메리카노' }, { emoji: '🧋', label: '라떼' },   { emoji: '🍵', label: '차' }] },
      dessert: { zoneId: 'plate',      variants: [{ emoji: '🍰', label: '케이크' },    { emoji: '🧁', label: '머핀' },   { emoji: '🍩', label: '도넛' }] },
      magazine:{ zoneId: 'magshelf',   variants: [{ emoji: '📰', label: '신문' },      { emoji: '🗞️', label: '잡지' },  { emoji: '📗', label: '책' }] },
      earphone:{ zoneId: 'hookstand',  variants: [{ emoji: '🎧', label: '헤드폰' },    { emoji: '🎵', label: '이어폰' }] },
      laptop:  { zoneId: 'chargespot', variants: [{ emoji: '💻', label: '노트북' },    { emoji: '📱', label: '태블릿' }] },
    },
    zonesConfig: {
      traytop:    { label: '음료 트레이',  emoji: '🫙',  accepts: 'drink' },
      plate:      { label: '디저트 접시', emoji: '🍽️', accepts: 'dessert' },
      magshelf:   { label: '잡지 선반',   emoji: '📰', accepts: 'magazine' },
      hookstand:  { label: '이어폰 거치대', emoji: '🎧', accepts: 'earphone' },
      chargespot: { label: '충전 스팟',   emoji: '🔌', accepts: 'laptop' },
    },
  },
  student: {
    name: '학생', emoji: '📚',
    deskBg: 'repeating-linear-gradient(90deg,transparent,transparent 48px,rgba(0,0,0,0.025) 48px,rgba(0,0,0,0.025) 49px),linear-gradient(175deg,#dce8f5 0%,#c8d8ee 55%,#b0c4e0 100%)',
    deskBorder: '#8aabda',
    itemTypes: {
      textbook: { zoneId: 'bookstand',  variants: [{ emoji: '📚', label: '교과서' },   { emoji: '📖', label: '참고서' }, { emoji: '📘', label: '문제집' }] },
      pencil:   { zoneId: 'pencilcase', variants: [{ emoji: '✏️', label: '연필' },     { emoji: '🖊️', label: '볼펜' },  { emoji: '📏', label: '자' }] },
      snack:    { zoneId: 'snackbox',   variants: [{ emoji: '🍫', label: '초콜릿' },   { emoji: '🍪', label: '쿠키' },   { emoji: '🍿', label: '팝콘' }] },
      phone:    { zoneId: 'phonestand', variants: [{ emoji: '📱', label: '스마트폰' }, { emoji: '🎮', label: '게임기' }] },
      notebook: { zoneId: 'notebox',    variants: [{ emoji: '📓', label: '노트' },     { emoji: '📒', label: '공책' },   { emoji: '📔', label: '다이어리' }] },
    },
    zonesConfig: {
      bookstand:  { label: '책꽂이',    emoji: '📚', accepts: 'textbook' },
      pencilcase: { label: '필통',      emoji: '🖊️', accepts: 'pencil' },
      snackbox:   { label: '간식함',    emoji: '🍫', accepts: 'snack' },
      phonestand: { label: '폰 거치대', emoji: '📱', accepts: 'phone' },
      notebox:    { label: '노트함',    emoji: '📝', accepts: 'notebook' },
    },
  },
};

let ITEM_TYPES   = THEMES.office.itemTypes;
let ZONES_CONFIG = THEMES.office.zonesConfig;

const LEVEL_CONFIG = [
  null,
  { count: 6,  time: 50, typeCount: 2 },
  { count: 9,  time: 55, typeCount: 3 },
  { count: 12, time: 55, typeCount: 4 },
  { count: 15, time: 50, typeCount: 5 },
  { count: 18, time: 50, typeCount: 5 },
];

function getLevelConfig(level) {
  const allTypes = Object.keys(ITEM_TYPES);
  if (level <= 5) {
    const cfg = LEVEL_CONFIG[level];
    return { ...cfg, types: allTypes.slice(0, cfg.typeCount) };
  }
  const INCREMENTS = [2, 2, 3, 3, 4];
  const CYCLE_SUM  = 14;
  const offset     = level - 6;
  const partial    = INCREMENTS.slice(0, (offset % 5) + 1).reduce((a, b) => a + b, 0);
  const count      = 18 + Math.floor(offset / 5) * CYCLE_SUM + partial;
  const time       = Math.max(20, 45 - Math.floor((level - 1) / 10) * 2);
  return { count, time, types: allTypes };
}

// ============================================================
// STATE
// ============================================================

let state = {
  nickname:       '',
  theme:          'office',
  level:          1,
  score:          0,
  timeLeft:       50,
  selectedItemId: null,
  items:          [],
  combo:          0,
  timer:          null,
};

let itemIdCounter = 0;

// ============================================================
// PRIORITY STATE
// ============================================================

const PRIORITY_DURATION = 8;
const PRIORITY_PENALTY  = 20;

let priority = {
  itemId:   null,
  timeLeft: 0,
  timer:    null,
};

// ============================================================
// DISTURBANCE MANAGER STATE
// ============================================================

const DISTURB_WARNING_MS = 2000;
const DISTURB_COOLDOWN   = [8000, 14000]; // 끝난 후 다음 예고까지 랜덤 대기

const DISTURB_POOL = {
  2: ['priority', 'mail'],
  3: ['priority', 'mail', 'wind'],
  4: ['priority', 'mail', 'wind', 'zoneswap'],
};

const DISTURB_COPY = {
  priority: {
    warning:  '⚡ 긴급 요청이 곧 들어옵니다!',
    announce: '⚡ <strong>긴급!</strong> 빨간 아이템을 8초 안에 정리하세요 <span>(미처리 시 -20점)</span>',
  },
  mail: {
    warning:  '📨 새 업무가 들어옵니다!',
    announce: '📨 <strong>새 업무 도착!</strong> 아이템이 추가됐어요',
  },
  wind: {
    warning:  '💨 바람이 불 것 같아요!',
    announce: '💨 <strong>바람!</strong> 아이템이 날아갔어요',
  },
  zoneswap: {
    warning:  '🔀 구역이 곧 바뀝니다!',
    announce: '🔀 <strong>구역 변경!</strong> 위치를 다시 확인하세요',
  },
};

let disturb = {
  active:          null,  // 현재 활성 타입
  last:            null,  // 직전 타입 (연속 방지)
  scheduleTimeout: null,
};

let zoneSwap = { a: null, b: null, timeout: null };

// ============================================================
// SOUND (Web Audio API — 합성음, 파일 불필요)
// ============================================================

let _audioCtx = null;

function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

function _tone(freq, type, startTime, duration, gain = 0.28) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.connect(env);
  env.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(gain, startTime + 0.01);
  env.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

const SFX = {
  correct() {
    const t = getAudioCtx().currentTime;
    _tone(880, 'sine', t, 0.14, 0.24);
  },
  combo() {
    const t = getAudioCtx().currentTime;
    _tone(523,  'sine', t,        0.10, 0.22);
    _tone(659,  'sine', t + 0.10, 0.10, 0.22);
    _tone(784,  'sine', t + 0.20, 0.20, 0.30);
  },
  wrong() {
    const ctx = getAudioCtx();
    const t   = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env);
    env.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(130, t + 0.22);
    env.gain.setValueAtTime(0.22, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.start(t);
    osc.stop(t + 0.24);
  },
  penalty() {
    const t = getAudioCtx().currentTime;
    _tone(300, 'sawtooth', t,        0.14, 0.28);
    _tone(190, 'sawtooth', t + 0.16, 0.26, 0.28);
  },
  levelClear() {
    const t = getAudioCtx().currentTime;
    _tone(523,  'sine', t,        0.14, 0.30);
    _tone(659,  'sine', t + 0.13, 0.14, 0.30);
    _tone(1047, 'sine', t + 0.26, 0.32, 0.36);
  },
  warning() {
    const t = getAudioCtx().currentTime;
    _tone(440, 'triangle', t,        0.09, 0.18);
    _tone(440, 'triangle', t + 0.13, 0.09, 0.18);
  },
};

// ============================================================
// DRAG STATE
// ============================================================

const DRAG_THRESHOLD = 7;

let drag = {
  active:       false,
  itemId:       null,
  el:           null,
  origX:        0,
  origY:        0,
  offsetX:      0,
  startClientX: 0,
  startClientY: 0,
  offsetY: 0,
};

// ============================================================
// DOM REFS
// ============================================================

const screens = {
  nickname: document.getElementById('screen-nickname'),
  game:     document.getElementById('screen-game'),
  result:   document.getElementById('screen-result'),
};

const els = {
  nicknameInput:  document.getElementById('nickname-input'),
  startBtn:       document.getElementById('start-btn'),
  hudLevel:       document.getElementById('hud-level'),
  hudTime:        document.getElementById('hud-time'),
  hudScore:       document.getElementById('hud-score'),
  hudCombo:       document.getElementById('hud-combo'),
  hudComboBlock:  document.getElementById('hud-combo-block'),
  hudTimerBlock:  document.getElementById('hud-timer-block'),
  hintBar:        document.getElementById('hint-bar'),
  desk:           document.getElementById('desk'),
  zones:          document.getElementById('zones'),
  resultIcon:     document.getElementById('result-icon'),
  resultTitle:    document.getElementById('result-title'),
  resultNickname: document.getElementById('result-nickname'),
  resultLevel:    document.getElementById('result-level'),
  resultScore:    document.getElementById('result-score'),
  restartBtn:     document.getElementById('restart-btn'),
  backBtn:        document.getElementById('back-btn'),
};

// ============================================================
// SCREEN MANAGEMENT
// ============================================================

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ============================================================
// NICKNAME SCREEN
// ============================================================

els.startBtn.addEventListener('click', handleStart);

els.nicknameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleStart();
});

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadNicknameLeaderboard(btn.dataset.theme);
  });
});

async function loadNicknameLeaderboard(theme = 'office') {
  const list = document.getElementById('nickname-lb-list');
  if (!_sb) { document.getElementById('nickname-leaderboard').style.display = 'none'; return; }

  list.innerHTML = '<div class="lb-status">불러오는 중...</div>';
  try {
    const { data, error } = await _sb
      .from('scores')
      .select('nickname, score, level')
      .eq('theme', theme)
      .order('score', { ascending: false })
      .limit(10);
    if (error) throw error;
    renderLeaderboard(list, data);
  } catch {
    list.innerHTML = '<div class="lb-status lb-error">불러오기 실패</div>';
  }
}

loadNicknameLeaderboard('office');

function handleStart() {
  const nick = els.nicknameInput.value.trim();
  if (!nick) {
    els.nicknameInput.focus();
    els.nicknameInput.style.borderColor = '#e05050';
    setTimeout(() => { els.nicknameInput.style.borderColor = ''; }, 800);
    return;
  }
  state.nickname = nick;
  const selected = document.querySelector('.theme-btn.active');
  state.theme    = selected ? selected.dataset.theme : 'office';
  ITEM_TYPES     = THEMES[state.theme].itemTypes;
  ZONES_CONFIG   = THEMES[state.theme].zonesConfig;
  const theme    = THEMES[state.theme];
  els.desk.style.background   = theme.deskBg;
  els.desk.style.borderBottom = `4px solid ${theme.deskBorder}`;
  getAudioCtx().resume(); // 사용자 제스처 타이밍에 AudioContext 활성화
  startGame();
}

// ============================================================
// GAME INIT
// ============================================================

function startGame() {
  state.level = 1;
  state.score = 0;
  startLevel();
}

function startLevel() {
  clearTimer();         // clearTimer 내부에서 clearPriorityItem도 호출됨
  deselectItem();

  const config = getLevelConfig(state.level);
  state.timeLeft = config.time;
  state.combo    = 0;
  state.items    = [];

  updateHUD();
  els.hudComboBlock.style.display = 'none';

  // 레벨 2부터 힌트 숨김
  if (state.level >= 2) {
    els.hintBar.classList.add('hidden');
  } else {
    els.hintBar.classList.remove('hidden');
  }

  showScreen('game');

  // 레이아웃 확정 후 아이템 배치
  requestAnimationFrame(() => {
    generateZones(config.types);
    generateItems(config);
    startTimer();
    startDisturbSystem();
  });
}

// ============================================================
// ITEM GENERATION
// ============================================================

function generateItems(config) {
  els.desk.innerHTML = '';
  state.items = [];

  const deskW    = els.desk.offsetWidth;
  const deskH    = els.desk.offsetHeight;
  const itemSize = window.innerWidth <= 600 ? 54 : 64;
  const margin   = 12;

  const positions = generatePositions(config.count, deskW, deskH, itemSize, margin);

  positions.forEach((pos, i) => {
    const typeKey = config.types[Math.floor(Math.random() * config.types.length)];
    const type    = ITEM_TYPES[typeKey];
    const variant = type.variants[Math.floor(Math.random() * type.variants.length)];
    const id      = ++itemIdCounter;

    state.items.push({ id, typeKey, placed: false });

    const el = document.createElement('div');
    el.className  = 'desk-item';
    el.id         = `item-${id}`;
    el.style.left = `${pos.x}px`;
    el.style.top  = `${pos.y}px`;
    el.textContent = variant.emoji;
    el.title       = variant.label;

    initDragOnItem(el, id);
    els.desk.appendChild(el);
  });
}

function generatePositions(count, deskW, deskH, itemSize, margin) {
  const usableW = deskW - margin * 2;
  const usableH = deskH - margin * 2;
  const cols = Math.max(1, Math.floor(usableW / (itemSize + margin)));
  const rows = Math.max(1, Math.floor(usableH / (itemSize + margin)));
  const totalCells = cols * rows;

  const cellIndices = shuffle(Array.from({ length: totalCells }, (_, i) => i));
  const chosen = cellIndices.slice(0, Math.min(count, totalCells));

  return chosen.map(idx => {
    const col   = idx % cols;
    const row   = Math.floor(idx / cols);
    const baseX = margin + col * (itemSize + margin);
    const baseY = margin + row * (itemSize + margin);
    const jitter = 8;
    return {
      x: clamp(baseX + randInt(-jitter, jitter), margin, deskW - itemSize - margin),
      y: clamp(baseY + randInt(-jitter, jitter), margin, deskH - itemSize - margin),
    };
  });
}

// ============================================================
// ZONE GENERATION
// ============================================================

function generateZones(types) {
  els.zones.innerHTML = '';

  const zoneIds = [...new Set(types.map(t => ITEM_TYPES[t].zoneId))];

  zoneIds.forEach(zoneId => {
    const zone = ZONES_CONFIG[zoneId];
    const el   = document.createElement('div');
    el.className = 'game-zone';
    el.id        = `zone-${zoneId}`;
    el.innerHTML = `<span>${zone.emoji}</span><span class="zone-label">${zone.label}</span>`;
    el.addEventListener('click', () => onZoneClick(zoneId));
    els.zones.appendChild(el);
  });
}

// ============================================================
// CLICK HANDLERS
// ============================================================

els.desk.addEventListener('click', () => deselectItem());

function onItemClick(id) {
  if (state.selectedItemId === id) {
    deselectItem();
    return;
  }

  const item = state.items.find(i => i.id === id);
  if (!item || item.placed) return;

  // 이전 선택 해제
  if (state.selectedItemId !== null) {
    const prev = document.getElementById(`item-${state.selectedItemId}`);
    if (prev) prev.classList.remove('selected');
  }

  state.selectedItemId = id;
  document.getElementById(`item-${id}`).classList.add('selected');
  document.body.classList.add('item-selected');
}

function deselectItem() {
  if (state.selectedItemId !== null) {
    const el = document.getElementById(`item-${state.selectedItemId}`);
    if (el) el.classList.remove('selected');
    state.selectedItemId = null;
  }
  document.body.classList.remove('item-selected');
}

function onZoneClick(zoneId) {
  if (state.selectedItemId === null) return;

  const item = state.items.find(i => i.id === state.selectedItemId);
  if (!item) return;

  const correctZoneId = ITEM_TYPES[item.typeKey].zoneId;
  const zoneEl        = document.getElementById(`zone-${zoneId}`);
  const itemEl        = document.getElementById(`item-${item.id}`);

  if (zoneId === correctZoneId) {
    placeItem(item, zoneEl, itemEl);
  } else {
    wrongPlacement(zoneEl, itemEl);
  }
}

// ============================================================
// PLACEMENT LOGIC
// ============================================================

function placeItem(item, zoneEl, itemEl) {
  item.placed = true;

  itemEl.classList.remove('selected');
  itemEl.classList.add('placed');

  // 구역 초록 플래시
  zoneEl.classList.add('correct-flash');
  setTimeout(() => zoneEl.classList.remove('correct-flash'), 450);

  // 점수 계산
  state.combo++;
  let earned   = 10;
  let isCombo  = false;

  if (state.combo % 3 === 0) {
    earned  = 15;
    isCombo = true;
  }

  state.score += earned;
  isCombo ? SFX.combo() : SFX.correct();
  showScorePopup(itemEl, earned, isCombo);
  updateComboDisplay();

  deselectItem();
  updateHUD();

  // 우선순위 아이템이었으면 해제 후 방해 사이클 재개
  if (priority.itemId === item.id) {
    clearPriorityItem();
    onDisturbEnd();
  }

  setTimeout(checkWin, 200);
}

function wrongPlacement(zoneEl, itemEl) {
  SFX.wrong();
  state.combo = 0;
  updateComboDisplay();

  // 구역 빨간 플래시
  zoneEl.classList.add('wrong-flash');
  setTimeout(() => zoneEl.classList.remove('wrong-flash'), 300);

  // 아이템 흔들기 후 선택 유지
  itemEl.classList.remove('selected');
  itemEl.classList.add('shake');
  setTimeout(() => {
    itemEl.classList.remove('shake');
    if (state.selectedItemId !== null) {
      itemEl.classList.add('selected');
    }
  }, 420);
}

// ============================================================
// SCORE POPUP
// ============================================================

function showScorePopup(anchorEl, points, isCombo) {
  const rect  = anchorEl.getBoundingClientRect();
  const popup = document.createElement('div');
  popup.className   = `score-popup${isCombo ? ' combo' : ''}`;
  popup.textContent = isCombo ? `+${points} 콤보!🔥` : `+${points}`;
  popup.style.left  = `${rect.left + rect.width / 2 - 28}px`;
  popup.style.top   = `${rect.top - 8}px`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 820);
}

// ============================================================
// WIN CHECK
// ============================================================

function checkWin() {
  const remaining = state.items.filter(i => !i.placed);
  if (remaining.length > 0) return;

  clearTimer();
  SFX.levelClear();
  const timeBonus = state.timeLeft * 2;
  state.score += timeBonus;
  updateHUD();

  showLevelClearOverlay(timeBonus);

  setTimeout(() => {
    state.level++;
    startLevel();
  }, 1600);
}

function showLevelClearOverlay(bonus) {
  const el = document.createElement('div');
  el.className = 'level-overlay';
  el.innerHTML = `
    <div class="level-overlay-card">
      <div class="lo-icon">✅</div>
      <div class="lo-title">레벨 ${state.level} 클리어!</div>
      <div class="lo-bonus">시간 보너스 +${bonus}점</div>
    </div>
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

// ============================================================
// PRIORITY ITEM (방해 요소 ①)
// ============================================================

// ============================================================
// DISTURBANCE MANAGER
// ============================================================

function startDisturbSystem() {
  if (state.level < 2) return;
  scheduleNextDisturb(10000);
}

function scheduleNextDisturb(delay) {
  disturb.scheduleTimeout = setTimeout(triggerDisturbWarning, delay);
}

function triggerDisturbWarning() {
  const pool = DISTURB_POOL[Math.min(state.level, 4)] ?? [];
  if (!pool.length) return;

  const candidates = pool.length > 1 ? pool.filter(d => d !== disturb.last) : pool;
  const type = candidates[Math.floor(Math.random() * candidates.length)];

  disturb.active = type;
  SFX.warning();
  showDisturbToast(DISTURB_COPY[type].warning, type);

  disturb.scheduleTimeout = setTimeout(() => triggerDisturb(type), DISTURB_WARNING_MS);
}

function showDisturbToast(text, type, duration = DISTURB_WARNING_MS + 200) {
  const el = document.createElement('div');
  el.className = `disturb-toast disturb-${type}`;
  el.textContent = text;
  els.desk.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

function showDisturbAnnounce(type) {
  const el = document.createElement('div');
  el.className = `disturb-announce disturb-${type}`;
  el.innerHTML = DISTURB_COPY[type].announce;
  els.desk.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function triggerDisturb(type) {
  disturb.last            = type;
  disturb.scheduleTimeout = null;

  if (type === 'priority') {
    spawnPriorityItem();
  } else if (type === 'mail') {
    dropMailItem();
    onDisturbEnd();
  } else if (type === 'wind') {
    blowItem();
    onDisturbEnd();
  } else if (type === 'zoneswap') {
    swapZones(); // onDisturbEnd는 restoreZones에서 호출
  }
}

function onDisturbEnd() {
  disturb.active = null;
  const cooldown = randInt(DISTURB_COOLDOWN[0], DISTURB_COOLDOWN[1]);
  scheduleNextDisturb(cooldown);
}

function clearDisturbSystem() {
  if (disturb.scheduleTimeout) {
    clearTimeout(disturb.scheduleTimeout);
    disturb.scheduleTimeout = null;
  }
  disturb.active = null;
  clearPriorityItem();
  clearZoneSwap();
}

// ============================================================
// PRIORITY ITEM
// ============================================================

function spawnPriorityItem() {
  const available = state.items.filter(i => !i.placed);
  if (available.length === 0) {
    onDisturbEnd();
    return;
  }

  const item = available[Math.floor(Math.random() * available.length)];
  const el   = document.getElementById(`item-${item.id}`);
  if (!el) { onDisturbEnd(); return; }

  priority.itemId   = item.id;
  priority.timeLeft = PRIORITY_DURATION;

  el.classList.add('priority');
  refreshPriorityBadge(el);
  showDisturbAnnounce('priority');

  priority.timer = setInterval(() => {
    priority.timeLeft--;
    const itemEl = document.getElementById(`item-${priority.itemId}`);
    if (itemEl) refreshPriorityBadge(itemEl);
    if (priority.timeLeft <= 0) onPriorityExpired();
  }, 1000);
}

function refreshPriorityBadge(el) {
  let badge = el.querySelector('.priority-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.className = 'priority-badge';
    el.appendChild(badge);
  }
  badge.textContent = priority.timeLeft;
  badge.classList.toggle('urgent', priority.timeLeft <= 3);
}

function onPriorityExpired() {
  const el = document.getElementById(`item-${priority.itemId}`);
  clearPriorityItem();

  SFX.penalty();
  state.score = Math.max(0, state.score - PRIORITY_PENALTY);
  updateHUD();
  if (el) showPenaltyPopup(el);

  onDisturbEnd();
}

function clearPriorityItem() {
  if (priority.timer) {
    clearInterval(priority.timer);
    priority.timer = null;
  }
  if (priority.itemId !== null) {
    const el = document.getElementById(`item-${priority.itemId}`);
    if (el) {
      el.classList.remove('priority');
      el.querySelector('.priority-badge')?.remove();
    }
    priority.itemId = null;
  }
}

function showPenaltyPopup(anchorEl) {
  const rect  = anchorEl.getBoundingClientRect();
  const popup = document.createElement('div');
  popup.className   = 'score-popup penalty';
  popup.textContent = `-${PRIORITY_PENALTY} 시간초과!⚡`;
  popup.style.left  = `${rect.left + rect.width / 2 - 48}px`;
  popup.style.top   = `${rect.top - 8}px`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 900);
}

// ============================================================
// MAIL ITEM
// ============================================================

function dropMailItem() {
  const config  = getLevelConfig(state.level);
  const typeKey = config.types[Math.floor(Math.random() * config.types.length)];
  const type    = ITEM_TYPES[typeKey];
  const variant = type.variants[Math.floor(Math.random() * type.variants.length)];
  const id      = ++itemIdCounter;

  state.items.push({ id, typeKey, placed: false });

  const deskW    = els.desk.offsetWidth;
  const itemSize = window.innerWidth <= 600 ? 54 : 64;
  const margin   = 12;

  const el = document.createElement('div');
  el.className   = 'desk-item mail-drop';
  el.id          = `item-${id}`;
  el.style.left  = `${randInt(margin, deskW - itemSize - margin)}px`;
  el.style.top   = `${randInt(margin, Math.floor(els.desk.offsetHeight * 0.4))}px`;
  el.textContent = variant.emoji;
  el.title       = variant.label;

  initDragOnItem(el, id);
  els.desk.appendChild(el);
  setTimeout(() => el.classList.remove('mail-drop'), 500);

  showDisturbAnnounce('mail');
}

// ============================================================
// WIND ITEM (방해 요소 ③)
// ============================================================

function blowItem() {
  // 드래그 중인 아이템은 제외
  const available = state.items.filter(i => !i.placed && i.id !== drag.itemId);
  if (!available.length) { onDisturbEnd(); return; }

  const item = available[Math.floor(Math.random() * available.length)];
  const el   = document.getElementById(`item-${item.id}`);
  if (!el) { onDisturbEnd(); return; }

  if (state.selectedItemId === item.id) deselectItem();

  const deskW    = els.desk.offsetWidth;
  const deskH    = els.desk.offsetHeight;
  const itemSize = window.innerWidth <= 600 ? 54 : 64;
  const margin   = 12;
  const newX     = randInt(margin, deskW - itemSize - margin);
  const newY     = randInt(margin, deskH - itemSize - margin);

  el.classList.add('wind-moving');
  el.style.transition = 'left 0.45s cubic-bezier(0.4,0,0.2,1), top 0.45s cubic-bezier(0.4,0,0.2,1), transform 0.3s ease';
  el.style.left = `${newX}px`;
  el.style.top  = `${newY}px`;

  setTimeout(() => {
    el.classList.remove('wind-moving');
    el.style.transition = '';
  }, 480);

  showDisturbAnnounce('wind');
}

// ============================================================
// ZONE SWAP (방해 요소 ④)
// ============================================================

const ZONE_SWAP_DURATION = 8000;

function swapZones() {
  const zoneEls = [...els.zones.querySelectorAll('.game-zone')];
  if (zoneEls.length < 2) { onDisturbEnd(); return; }

  const idxA = Math.floor(Math.random() * zoneEls.length);
  let idxB   = Math.floor(Math.random() * (zoneEls.length - 1));
  if (idxB >= idxA) idxB++;

  const a = zoneEls[idxA];
  const b = zoneEls[idxB];

  swapDOMElements(a, b);
  a.classList.add('zone-swapped');
  b.classList.add('zone-swapped');

  zoneSwap.a       = a;
  zoneSwap.b       = b;
  zoneSwap.timeout = setTimeout(restoreZones, ZONE_SWAP_DURATION);

  showDisturbAnnounce('zoneswap');
}

function restoreZones() {
  if (!zoneSwap.a || !zoneSwap.b) return;
  swapDOMElements(zoneSwap.a, zoneSwap.b);
  zoneSwap.a.classList.remove('zone-swapped');
  zoneSwap.b.classList.remove('zone-swapped');
  zoneSwap.a       = null;
  zoneSwap.b       = null;
  zoneSwap.timeout = null;
  onDisturbEnd();
}

function swapDOMElements(a, b) {
  if (a.nextSibling === b) { a.parentNode.insertBefore(b, a); return; }
  if (b.nextSibling === a) { b.parentNode.insertBefore(a, b); return; }
  const bNext    = b.nextSibling;
  const bParent  = b.parentNode;
  const ph = document.createComment('swap');
  a.parentNode.insertBefore(ph, a);
  bParent.insertBefore(a, bNext);
  ph.parentNode.insertBefore(b, ph);
  ph.remove();
}

function clearZoneSwap() {
  if (zoneSwap.timeout) {
    clearTimeout(zoneSwap.timeout);
    zoneSwap.timeout = null;
  }
  if (zoneSwap.a) {
    swapDOMElements(zoneSwap.a, zoneSwap.b);
    zoneSwap.a.classList.remove('zone-swapped');
    zoneSwap.b.classList.remove('zone-swapped');
    zoneSwap.a = null;
    zoneSwap.b = null;
  }
}

// ============================================================
// TIMER
// ============================================================

function startTimer() {
  updateTimerDisplay();
  state.timer = setInterval(() => {
    state.timeLeft--;
    updateTimerDisplay();
    if (state.timeLeft <= 0) {
      clearTimer();
      gameover();
    }
  }, 1000);
}

function clearTimer() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  clearDisturbSystem();
}

function updateTimerDisplay() {
  els.hudTime.textContent = state.timeLeft;
  if (state.timeLeft <= 10) {
    els.hudTimerBlock.classList.add('danger');
  } else {
    els.hudTimerBlock.classList.remove('danger');
  }
}

// ============================================================
// HUD
// ============================================================

function updateHUD() {
  els.hudLevel.textContent = state.level;
  els.hudScore.textContent = state.score.toLocaleString();
}

function updateComboDisplay() {
  if (state.combo >= 3) {
    els.hudComboBlock.style.display = '';
    els.hudCombo.textContent = state.combo;
  } else {
    els.hudComboBlock.style.display = 'none';
  }
}

// ============================================================
// DRAG & DROP (보조 입력 — Pointer Events 기반)
// ============================================================

function initDragOnItem(el, id) {
  // pointerdown이 preventDefault하므로 click은 거의 안 오지만 안전망으로 유지
  el.addEventListener('click', e => e.stopPropagation());

  el.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault(); // click 이벤트 억제

    const rect        = el.getBoundingClientRect();
    drag.itemId       = id;
    drag.el           = el;
    drag.origX        = parseInt(el.style.left);
    drag.origY        = parseInt(el.style.top);
    drag.offsetX      = e.clientX - rect.left;
    drag.offsetY      = e.clientY - rect.top;
    drag.startClientX = e.clientX;
    drag.startClientY = e.clientY;
    drag.active       = false;

    el.setPointerCapture(e.pointerId); // 요소 밖으로 나가도 이벤트 수신
    el.addEventListener('pointermove',   onPointerMove);
    el.addEventListener('pointerup',     onPointerUp);
    el.addEventListener('pointercancel', onPointerCancel);
  });
}

function onPointerMove(e) {
  if (!drag.active) {
    const dx = Math.abs(e.clientX - drag.startClientX);
    const dy = Math.abs(e.clientY - drag.startClientY);
    if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;

    // 임계 이동량 초과 → 드래그 시작
    drag.active = true;
    if (state.selectedItemId !== drag.itemId) {
      deselectItem();
      state.selectedItemId = drag.itemId;
      document.body.classList.add('item-selected');
    }
    drag.el.classList.add('selected', 'dragging');
  }

  const deskRect  = els.desk.getBoundingClientRect();
  const zonesRect = els.zones.getBoundingClientRect();
  const itemSize  = window.innerWidth <= 600 ? 54 : 64;
  const maxBottom = zonesRect.bottom - deskRect.top - itemSize;
  drag.el.style.left = `${clamp(e.clientX - deskRect.left - drag.offsetX, 0, deskRect.width - itemSize)}px`;
  drag.el.style.top  = `${clamp(e.clientY - deskRect.top  - drag.offsetY, 0, maxBottom)}px`;

  updateZoneDragOver(e.clientX, e.clientY);
}

function onPointerUp(e) {
  drag.el.removeEventListener('pointermove',   onPointerMove);
  drag.el.removeEventListener('pointerup',     onPointerUp);
  drag.el.removeEventListener('pointercancel', onPointerCancel);
  clearZoneDragOver();

  if (!drag.active) {
    // 임계 미만 → 클릭으로 즉시 처리
    onItemClick(drag.itemId);
    return;
  }

  drag.el.classList.remove('dragging');

  drag.el.style.pointerEvents = 'none';
  const target = document.elementFromPoint(e.clientX, e.clientY);
  drag.el.style.pointerEvents = '';

  const zoneEl = target?.closest('.game-zone');
  const item   = state.items.find(i => i.id === drag.itemId);

  if (zoneEl && item) {
    const zoneId = zoneEl.id.replace('zone-', '');
    if (ITEM_TYPES[item.typeKey].zoneId === zoneId) {
      placeItem(item, zoneEl, drag.el);
    } else {
      returnToOrigin();
      wrongPlacement(zoneEl, drag.el);
    }
  } else {
    returnToOrigin();
    deselectItem();
  }

  drag.active = false;
}

function onPointerCancel(e) {
  drag.el.removeEventListener('pointermove',   onPointerMove);
  drag.el.removeEventListener('pointerup',     onPointerUp);
  drag.el.removeEventListener('pointercancel', onPointerCancel);
  clearZoneDragOver();
  if (drag.active) {
    returnToOrigin();
    deselectItem();
    drag.active = false;
  }
}

function returnToOrigin() {
  drag.el.style.transition = 'left 0.25s ease, top 0.25s ease';
  drag.el.style.left = `${drag.origX}px`;
  drag.el.style.top  = `${drag.origY}px`;
  setTimeout(() => { if (drag.el) drag.el.style.transition = ''; }, 270);
}

function updateZoneDragOver(clientX, clientY) {
  clearZoneDragOver();
  drag.el.style.pointerEvents = 'none';
  const target = document.elementFromPoint(clientX, clientY);
  drag.el.style.pointerEvents = '';
  target?.closest('.game-zone')?.classList.add('drag-over');
}

function clearZoneDragOver() {
  document.querySelectorAll('.game-zone.drag-over')
    .forEach(z => z.classList.remove('drag-over'));
}

// ============================================================
// GAME OVER
// ============================================================

async function gameover() {
  deselectItem();

  els.resultNickname.textContent = state.nickname;
  els.resultLevel.textContent    = `레벨 ${state.level}`;
  els.resultScore.textContent    = state.score.toLocaleString() + '점';
  els.resultIcon.textContent     = state.score >= 100 ? '🎉' : '😅';
  els.resultTitle.textContent    = state.score >= 100 ? '수고했어요!' : '다음엔 더 잘할 수 있어요!';

  showScreen('result');
  await syncLeaderboard();
}

async function syncLeaderboard() {
  const section = document.getElementById('leaderboard-section');
  const list    = document.getElementById('leaderboard-list');

  if (!_sb) { section.style.display = 'none'; return; }

  section.style.display = '';
  list.innerHTML = '<div class="lb-status">점수 저장 중...</div>';

  try {
    const { data: existing } = await _sb
      .from('scores')
      .select('score')
      .eq('nickname', state.nickname)
      .maybeSingle();

    if (!existing || state.score > existing.score) {
      const { error: upsertError } = await _sb.from('scores').upsert({
        nickname: state.nickname,
        score:    state.score,
        level:    state.level,
        theme:    state.theme,
      }, { onConflict: 'nickname,theme' });

      if (upsertError) throw upsertError;
    }

    const { data, error } = await _sb
      .from('scores')
      .select('nickname, score, level')
      .eq('theme', state.theme)
      .order('score', { ascending: false })
      .limit(10);

    if (error) throw error;
    renderLeaderboard(list, data);
  } catch {
    list.innerHTML = '<div class="lb-status lb-error">스코어보드 연결 실패</div>';
  }
}

function renderLeaderboard(list, rows) {
  if (!rows || !rows.length) {
    list.innerHTML = '<div class="lb-status">아직 기록이 없어요</div>';
    return;
  }

  const MEDALS = ['🥇', '🥈', '🥉'];
  list.innerHTML = rows.map((r, i) => {
    const isMe = r.nickname === state.nickname && r.score === state.score;
    const rank = MEDALS[i] ?? `${i + 1}`;
    return `<div class="lb-row${isMe ? ' lb-me' : ''}">
      <span class="lb-rank">${rank}</span>
      <span class="lb-name">${escHtml(r.nickname)}</span>
      <span class="lb-score">${r.score.toLocaleString()}점</span>
      <span class="lb-level">Lv.${r.level}</span>
    </div>`;
  }).join('');
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================================
// RESULT ACTIONS
// ============================================================

els.restartBtn.addEventListener('click', () => startGame());
els.backBtn.addEventListener('click',    () => {
  els.nicknameInput.value = '';
  showScreen('nickname');
});

// ============================================================
// UTILS
// ============================================================

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
