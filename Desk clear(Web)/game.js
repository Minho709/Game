'use strict';

// ============================================================
// CONFIG
// ============================================================

const ITEM_TYPES = {
  file: {
    zoneId: 'filebox',
    variants: [
      { emoji: '📄', label: '문서' },
      { emoji: '📊', label: '차트' },
      { emoji: '📑', label: '보고서' },
      { emoji: '📈', label: '그래프' },
      { emoji: '📉', label: '분석표' },
    ],
  },
  coffee: {
    zoneId: 'shelf',
    variants: [
      { emoji: '☕', label: '커피' },
      { emoji: '🥤', label: '아이스 음료' },
      { emoji: '🧋', label: '버블티' },
    ],
  },
  note: {
    zoneId: 'noticeboard',
    variants: [
      { emoji: '📝', label: '메모' },
      { emoji: '🗒️', label: '노트' },
      { emoji: '📌', label: '포스트잇' },
    ],
  },
  pen: {
    zoneId: 'pencilholder',
    variants: [
      { emoji: '✏️', label: '연필' },
      { emoji: '🖊️', label: '볼펜' },
      { emoji: '🖋️', label: '만년필' },
    ],
  },
  book: {
    zoneId: 'bookshelf',
    variants: [
      { emoji: '📚', label: '책' },
      { emoji: '📖', label: '책' },
      { emoji: '📓', label: '노트' },
      { emoji: '📔', label: '다이어리' },
      { emoji: '📒', label: '노트' },
    ],
  },
};

const ZONES_CONFIG = {
  filebox:      { label: '파일함',  emoji: '🗂️', accepts: 'file' },
  shelf:        { label: '선반',    emoji: '🪴', accepts: 'coffee' },
  noticeboard:  { label: '메모판',  emoji: '📋', accepts: 'note' },
  pencilholder: { label: '펜꽂이',  emoji: '🖊️', accepts: 'pen' },
  bookshelf:    { label: '책장',    emoji: '📖', accepts: 'book' },
};

const LEVEL_CONFIG = [
  null,
  { count: 6,  time: 50, types: ['file', 'coffee'] },
  { count: 9,  time: 55, types: ['file', 'coffee', 'note'] },
  { count: 12, time: 55, types: ['file', 'coffee', 'note', 'pen'] },
  { count: 15, time: 50, types: ['file', 'coffee', 'note', 'pen', 'book'] },
  { count: 18, time: 50, types: ['file', 'coffee', 'note', 'pen', 'book'] },
];

function getLevelConfig(level) {
  if (level <= 5) return LEVEL_CONFIG[level];
  return {
    count: 18 + (level - 5) * 2,
    time: 45,
    types: Object.keys(ITEM_TYPES),
  };
}

// ============================================================
// STATE
// ============================================================

let state = {
  nickname:       '',
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
  3: ['priority', 'mail'],
  4: ['priority', 'mail'],
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
};

let disturb = {
  active:          null,  // 현재 활성 타입
  last:            null,  // 직전 타입 (연속 방지)
  scheduleTimeout: null,
};

// ============================================================
// DRAG STATE
// ============================================================

const DRAG_THRESHOLD = 5;

let drag = {
  active:  false,
  didDrag: false,
  itemId:  null,
  el:      null,
  origX:   0,
  origY:   0,
  offsetX: 0,
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

function handleStart() {
  const nick = els.nicknameInput.value.trim();
  if (!nick) {
    els.nicknameInput.focus();
    els.nicknameInput.style.borderColor = '#e05050';
    setTimeout(() => { els.nicknameInput.style.borderColor = ''; }, 800);
    return;
  }
  state.nickname = nick;
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

    el.addEventListener('click', e => {
      e.stopPropagation();
      if (drag.didDrag) { drag.didDrag = false; return; }
      onItemClick(id);
    });

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

  el.addEventListener('click', e => {
    e.stopPropagation();
    if (drag.didDrag) { drag.didDrag = false; return; }
    onItemClick(id);
  });

  initDragOnItem(el, id);
  els.desk.appendChild(el);
  setTimeout(() => el.classList.remove('mail-drop'), 500);

  showDisturbAnnounce('mail');
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
// DRAG & DROP (보조 입력)
// ============================================================

function initDragOnItem(el, id) {
  el.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    e.preventDefault();

    const rect   = el.getBoundingClientRect();
    drag.itemId  = id;
    drag.el      = el;
    drag.origX   = parseInt(el.style.left);
    drag.origY   = parseInt(el.style.top);
    drag.offsetX = e.clientX - rect.left;
    drag.offsetY = e.clientY - rect.top;
    drag.active  = false;
    drag.didDrag = false;

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup',   onDragEnd);
  });
}

function onDragMove(e) {
  const deskRect = els.desk.getBoundingClientRect();
  const newLeft  = e.clientX - deskRect.left - drag.offsetX;
  const newTop   = e.clientY - deskRect.top  - drag.offsetY;

  if (!drag.active) {
    const deltaX = Math.abs(newLeft - drag.origX);
    const deltaY = Math.abs(newTop  - drag.origY);
    if (deltaX < DRAG_THRESHOLD && deltaY < DRAG_THRESHOLD) return;

    drag.active  = true;
    drag.didDrag = true;

    if (state.selectedItemId !== drag.itemId) {
      deselectItem();
      state.selectedItemId = drag.itemId;
      document.body.classList.add('item-selected');
    }
    drag.el.classList.add('selected', 'dragging');
  }

  const itemSize = window.innerWidth <= 600 ? 54 : 64;
  drag.el.style.left = `${clamp(newLeft, 0, deskRect.width  - itemSize)}px`;
  drag.el.style.top  = `${clamp(newTop,  0, deskRect.height - itemSize)}px`;

  updateZoneDragOver(e.clientX, e.clientY);
}

function onDragEnd(e) {
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup',   onDragEnd);

  if (!drag.active) return;

  drag.el.classList.remove('dragging');
  clearZoneDragOver();

  drag.el.style.pointerEvents = 'none';
  const target = document.elementFromPoint(e.clientX, e.clientY);
  drag.el.style.pointerEvents = '';

  const zoneEl = target?.closest('.game-zone');

  if (zoneEl) {
    const zoneId = zoneEl.id.replace('zone-', '');
    const item   = state.items.find(i => i.id === drag.itemId);
    if (item) {
      if (ITEM_TYPES[item.typeKey].zoneId === zoneId) {
        placeItem(item, zoneEl, drag.el);
      } else {
        returnToOrigin();
        wrongPlacement(zoneEl, drag.el);
      }
    }
  } else {
    returnToOrigin();
    deselectItem();
  }

  drag.active = false;
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

function gameover() {
  deselectItem();

  els.resultNickname.textContent = state.nickname;
  els.resultLevel.textContent    = `레벨 ${state.level}`;
  els.resultScore.textContent    = state.score.toLocaleString() + '점';
  els.resultIcon.textContent     = state.score >= 100 ? '🎉' : '😅';
  els.resultTitle.textContent    = state.score >= 100 ? '수고했어요!' : '다음엔 더 잘할 수 있어요!';

  showScreen('result');
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
