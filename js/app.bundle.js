/**
 * app.bundle.js - 永続クラウドデータベース ＆ 超高速リアルタイム同期エンジン
 */

// =========================================
// 1. 効果音エンジン (Web Audio API)
// =========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTap() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playUndo() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(392.00, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  playFanfare() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.12 },
        { freq: 659.25, time: 0.14, dur: 0.12 },
        { freq: 783.99, time: 0.28, dur: 0.14 },
        { freq: 1046.50, time: 0.44, dur: 0.60 }
      ];

      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, now + n.time);

        gain.gain.setValueAtTime(0.35, now + n.time);
        gain.gain.exponentialRampToValueAtTime(0.01, now + n.time + n.dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur);
      });
    } catch (e) {}
  }

  playReset() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }
}

const sound = new SoundEngine();

// =========================================
// 2. 紙吹雪エンジン (Canvas Confetti)
// =========================================
class ConfettiEngine {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationFrame = null;
    this.isRunning = false;
    this.colors = ['#FF477E', '#FF70A6', '#FF9770', '#FFD670', '#E9FF70', '#70D6FF', '#70FFA8'];
  }

  setup() {
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    this.setup();
    if (!this.canvas || !this.ctx) return;

    this.stop();
    this.isRunning = true;
    this.particles = [];

    for (let i = 0; i < 120; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height - this.canvas.height * 0.8,
        size: Math.random() * 8 + 6,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngle: Math.random() * Math.PI,
        tiltAngleInc: Math.random() * 0.08 + 0.04,
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 2 - 1
      });
    }

    const loop = () => {
      if (!this.isRunning) return;
      this.update();
      this.draw();
      this.animationFrame = requestAnimationFrame(loop);
    };

    loop();
  }

  update() {
    if (!this.canvas) return;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.y += p.speedY;
      p.x += p.speedX;
      p.tiltAngle += p.tiltAngleInc;
      p.tilt = Math.sin(p.tiltAngle) * 12;

      if (p.y > this.canvas.height) {
        p.y = -20;
        p.x = Math.random() * this.canvas.width;
      }
    }
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.beginPath();
      this.ctx.lineWidth = p.size;
      this.ctx.strokeStyle = p.color;
      this.ctx.moveTo(p.x + p.tilt + p.size / 2, p.y);
      this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.size / 2);
      this.ctx.stroke();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

const confetti = new ConfettiEngine('confetti-canvas');

// =========================================
// 3. 永続クラウドデータベース ＆ ハイブリッド同期ストア
// =========================================
const STORAGE_KEY_DATA = 'kodomo_point_state_v6';
const STORAGE_KEY_PASSCODE = 'kodomo_point_passcode_v6';

const DEFAULT_ACTIONS = [
  {
    id: 'act_1',
    title: 'はみがき',
    points: 1,
    targetPoints: 5,
    currentPoints: 0,
    reward: '🌟 すきなシール',
    emoji: '🦷',
    color: '#FFEAA7'
  },
  {
    id: 'act_2',
    title: 'おかたづけ',
    points: 1,
    targetPoints: 10,
    currentPoints: 0,
    reward: '🍦 すきなアイス',
    emoji: '📦',
    color: '#DFF9FB'
  },
  {
    id: 'act_3',
    title: 'おてつだい',
    points: 2,
    targetPoints: 10,
    currentPoints: 0,
    reward: '🎮 30ぷんゲーム',
    emoji: '🍽️',
    color: '#FFCCCC'
  }
];

class PersistentCloudStore {
  constructor() {
    this.clientId = 'cid_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    this.passcode = localStorage.getItem(STORAGE_KEY_PASSCODE) || '';
    this.state = this.loadLocal();
    this.listeners = [];
    this.ws = null;
    this.isCloudConnected = false;
    this.lastUpdatedAt = Number(localStorage.getItem('kodomo_point_last_updated_v6') || 0);
    this.pollInterval = null;

    // タブ間同期
    try {
      this.channel = new BroadcastChannel('kodomo_pt_channel_v6');
      this.channel.onmessage = (e) => {
        if (e.data && e.data.from !== this.clientId && e.data.passcode === this.passcode) {
          this.applyExternal(e.data.state, e.data.updatedAt, true);
        }
      };
    } catch (e) {}

    if (this.passcode) {
      this.startSync(this.passcode);
    }
  }

  // 安全なキー名の生成（ハッシュ＋サニタイズ）
  getStorageKey(passcode) {
    const raw = (passcode || '').trim().toLowerCase();
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) + hash) + raw.charCodeAt(i);
      hash = hash & hash;
    }
    const clean = encodeURIComponent(raw).replace(/[^a-zA-Z0-9]/g, '');
    return `kpoint_v6_${clean}_${Math.abs(hash)}`;
  }

  loadLocal() {
    try {
      const d = localStorage.getItem(STORAGE_KEY_DATA);
      if (d) {
        const p = JSON.parse(d);
        if (Array.isArray(p.actions) && p.actions.length > 0) {
          return {
            actions: p.actions,
            history: Array.isArray(p.history) ? p.history : []
          };
        }
      }
    } catch (e) {}
    return {
      actions: JSON.parse(JSON.stringify(DEFAULT_ACTIONS)),
      history: []
    };
  }

  setPasscode(code) {
    const trimmed = (code || '').trim();
    this.passcode = trimmed;
    localStorage.setItem(STORAGE_KEY_PASSCODE, this.passcode);
    this.startSync(this.passcode);
    this.notify();
  }

  getPasscode() {
    return this.passcode;
  }

  // 同期プロトコルの開始（永続DBフェッチ ＋ リアルタイムWS接続）
  async startSync(passcode) {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (!passcode) {
      this.isCloudConnected = false;
      this.notify();
      return;
    }

    const key = this.getStorageKey(passcode);

    // 1. 永続クラウドストレージからデータを確実に復元
    await this.fetchFromPersistentDB(key);

    // 2. 定期バックグラウンド同期（5秒おき）
    this.pollInterval = setInterval(() => {
      this.fetchFromPersistentDB(key);
    }, 5000);

    // 3. リアルタイム通信（0.1秒即時通知）
    this.connectWebSocket(key);
  }

  // 永続クラウドデータベース（KV/REST）からの取得
  async fetchFromPersistentDB(key) {
    try {
      // 永続クラウドKVエンドポイント
      const res = await fetch(`https://kvdb.io/B1bkW8C3s4E5n2M1z8x9pQ/${key}?t=${Date.now()}`);
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && Array.isArray(cloudData.actions) && cloudData.updatedAt > this.lastUpdatedAt) {
          this.applyExternal(cloudData, cloudData.updatedAt, false);
        }
        this.isCloudConnected = true;
      } else if (res.status === 404) {
        // クラウドにまだデータがない場合は、この端末のデータを初回登録
        this.saveToPersistentDB(key);
        this.isCloudConnected = true;
      }
    } catch (e) {
      // ネットワーク一時エラー
    }
    this.notify();
  }

  // 永続クラウドデータベースへの書き込み
  async saveToPersistentDB(key) {
    const payload = {
      actions: this.state.actions,
      history: this.state.history,
      updatedAt: this.lastUpdatedAt,
      passcode: this.passcode
    };

    try {
      await fetch(`https://kvdb.io/B1bkW8C3s4E5n2M1z8x9pQ/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      this.isCloudConnected = true;
    } catch (e) {}
  }

  // リアルタイムWebSocket接続
  connectWebSocket(key) {
    try {
      this.ws = new WebSocket(`wss://ntfy.sh/${key}/ws`);
      this.ws.onopen = () => {
        this.isCloudConnected = true;
        this.notify();
      };
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg && msg.event === 'message' && msg.message) {
            const data = JSON.parse(msg.message);
            if (data && data.type === 'SYNC' && data.from !== this.clientId) {
              this.applyExternal(data.state, data.updatedAt, true);
            }
          }
        } catch (e) {}
      };
      this.ws.onclose = () => {
        setTimeout(() => {
          if (this.passcode) this.connectWebSocket(key);
        }, 4000);
      };
    } catch (e) {}
  }

  applyExternal(newState, updatedAt, playEffect = true) {
    if (!newState || !Array.isArray(newState.actions)) return;
    if (updatedAt && updatedAt <= this.lastUpdatedAt) return;

    this.state = {
      actions: newState.actions,
      history: Array.isArray(newState.history) ? newState.history : []
    };
    this.lastUpdatedAt = updatedAt || Date.now();

    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(this.state));
      localStorage.setItem('kodomo_point_last_updated_v6', String(this.lastUpdatedAt));
    } catch (e) {}

    if (playEffect) {
      sound.playTap();
    }
    this.notify();
  }

  save() {
    this.lastUpdatedAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(this.state));
      localStorage.setItem('kodomo_point_last_updated_v6', String(this.lastUpdatedAt));
    } catch (e) {}

    if (this.passcode) {
      const key = this.getStorageKey(this.passcode);
      // 1. 永続クラウドストレージに保存
      this.saveToPersistentDB(key);

      // 2. リアルタイム中継（即時ブロードキャスト）
      const payload = {
        type: 'SYNC',
        from: this.clientId,
        passcode: this.passcode,
        updatedAt: this.lastUpdatedAt,
        state: this.state
      };

      if (this.channel) {
        try { this.channel.postMessage(payload); } catch (e) {}
      }

      fetch(`https://ntfy.sh/${key}`, {
        method: 'POST',
        headers: { 'Title': 'Sync', 'Priority': '1' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }

    this.notify();
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  getState() {
    return this.state;
  }

  addPoints(actionId) {
    const action = this.state.actions.find(a => a.id === actionId);
    if (!action) return null;

    const pts = action.points || 1;
    action.currentPoints += pts;

    this.state.history.push({
      actionId: action.id,
      pointsAdded: pts,
      timestamp: Date.now()
    });

    const achieved = action.currentPoints >= action.targetPoints;
    this.save();
    return { achieved, action, pointsAdded: pts };
  }

  undoLastAction() {
    if (this.state.history.length === 0) return null;

    const last = this.state.history.pop();
    const action = this.state.actions.find(a => a.id === last.actionId);
    if (action) {
      action.currentPoints = Math.max(0, action.currentPoints - last.pointsAdded);
    }

    this.save();
    return last;
  }

  resetActionPoints(actionId) {
    const action = this.state.actions.find(a => a.id === actionId);
    if (action) {
      action.currentPoints = 0;
      this.state.history = this.state.history.filter(h => h.actionId !== actionId);
      this.save();
    }
  }

  resetAllPoints() {
    this.state.actions.forEach(a => {
      a.currentPoints = 0;
    });
    this.state.history = [];
    this.save();
  }

  saveAction(actionData) {
    if (actionData.id) {
      const idx = this.state.actions.findIndex(a => a.id === actionData.id);
      if (idx !== -1) {
        this.state.actions[idx] = {
          ...this.state.actions[idx],
          ...actionData
        };
      }
    } else {
      if (this.state.actions.length >= 6) {
        alert('がんばりボタンは最大6個までです。');
        return false;
      }
      const newAction = {
        id: 'act_' + Date.now(),
        title: actionData.title || 'がんばり',
        points: Number(actionData.points) || 1,
        targetPoints: Number(actionData.targetPoints) || 5,
        currentPoints: Number(actionData.currentPoints) || 0,
        reward: actionData.reward || 'ごほうび',
        emoji: actionData.emoji || '⭐',
        color: actionData.color || '#FFEAA7'
      };
      this.state.actions.push(newAction);
    }
    this.save();
    return true;
  }

  deleteAction(actionId) {
    if (this.state.actions.length <= 1) {
      alert('ボタンは最低1つ必要です。');
      return false;
    }
    this.state.actions = this.state.actions.filter(a => a.id !== actionId);
    this.state.history = this.state.history.filter(h => h.actionId !== actionId);
    this.save();
    return true;
  }
}

const store = new PersistentCloudStore();

// =========================================
// 4. メインUIコントローラー
// =========================================
const EMOJI_CATEGORIES = [
  {
    name: 'せいかつ・しゅうかん',
    emojis: ['🦷', '🛏️', '🚽', '🛁', '👕', '👟', '🧼', '🧴', '⏰', '🛌']
  },
  {
    name: 'おてつだい・いえのこと',
    emojis: ['📦', '🍽️', '🧹', '🧺', '🐕', '🐈', '🪴', '🍳', '🛒', '🗑️', '🧽', '🎒']
  },
  {
    name: 'まなび・うんどう・あそび',
    emojis: ['📖', '✏️', '🎹', '🎨', '🏃', '🏊', '⚽', '🚴', '🧩', '🎮', '📱', '🎵']
  },
  {
    name: 'たべもの・ごほうび',
    emojis: ['🥦', '🍙', '🥛', '🍦', '🍰', '🍩', '🍓', '🥞', '🍔', '🍟', '🍭', '🍕']
  },
  {
    name: 'ごほうび・きらきらマーク',
    emojis: ['⭐', '🌟', '✨', '👑', '💖', '🏆', '🏅', '🎉', '🎁', '💮', '👍', '🌈']
  }
];

const PRESET_COLORS = [
  '#FFEAA7', '#DFF9FB', '#FFCCCC', '#C7ECEE',
  '#E8D7FF', '#D4EDDA', '#FFE3E3', '#FFF2CC'
];
const POINT_OPTIONS = [1, 2, 3, 5];

class App {
  constructor() {
    this.currentEditingId = null;
    this.editingEmoji = '⭐';
    this.editingColor = '#FFEAA7';
    this.editingPoints = 1;
    this.editingTargetPoints = 5;
    this.editingCurrentPoints = 0;
    this.achievedActionId = null;

    this.cacheDom();
    this.bindEvents();
    this.checkInitialPasscodeFlow();
  }

  cacheDom() {
    this.welcomeView = document.getElementById('welcome-view');
    this.childView = document.getElementById('child-view');
    this.settingsView = document.getElementById('settings-view');

    this.inputWelcomePasscode = document.getElementById('input-welcome-passcode');
    this.btnWelcomeStart = document.getElementById('btn-welcome-start');
    this.btnWelcomeSkip = document.getElementById('btn-welcome-skip');

    this.btnToSettings = document.getElementById('btn-to-settings');
    this.childFamilyLabel = document.getElementById('child-family-label');
    this.childSyncDot = document.getElementById('child-sync-dot');
    this.actionButtonsGrid = document.getElementById('action-buttons-grid');
    this.btnUndo = document.getElementById('btn-undo');

    this.btnBackToChild = document.getElementById('btn-back-to-child');
    this.inputSettingsPasscode = document.getElementById('input-settings-passcode');
    this.btnSavePasscode = document.getElementById('btn-save-passcode');
    this.btnCopyInviteUrl = document.getElementById('btn-copy-invite-url');
    this.copyHintText = document.getElementById('copy-hint-text');
    this.btnAddAction = document.getElementById('btn-add-action');
    this.actionSettingsList = document.getElementById('action-settings-list');
    this.btnResetAll = document.getElementById('btn-reset-all');

    this.modalEditAction = document.getElementById('modal-edit-action');
    this.modalTitle = document.getElementById('modal-title');
    this.editActionTitle = document.getElementById('edit-action-title');
    this.editPointOptions = document.getElementById('edit-point-options');
    this.btnModalTargetMinus = document.getElementById('btn-modal-target-minus');
    this.btnModalTargetPlus = document.getElementById('btn-modal-target-plus');
    this.modalTargetPointsVal = document.getElementById('modal-target-points-val');
    this.editActionReward = document.getElementById('edit-action-reward');
    this.btnModalCurrentMinus = document.getElementById('btn-modal-current-minus');
    this.btnModalCurrentPlus = document.getElementById('btn-modal-current-plus');
    this.modalCurrentPointsVal = document.getElementById('modal-current-points-val');
    this.btnModalCurrentReset = document.getElementById('btn-modal-current-reset');
    this.editActionEmoji = document.getElementById('edit-action-emoji');
    this.presetEmojisList = document.getElementById('preset-emojis-list');
    this.colorPaletteList = document.getElementById('color-palette-list');

    this.actionPreviewCard = document.getElementById('action-preview-card');
    this.previewEmoji = document.getElementById('preview-emoji');
    this.previewTitle = document.getElementById('preview-title');
    this.previewPts = document.getElementById('preview-pts');
    this.previewProgText = document.getElementById('preview-prog-text');
    this.previewBarFill = document.getElementById('preview-bar-fill');
    this.previewRewardText = document.getElementById('preview-reward-text');
    this.btnCancelEdit = document.getElementById('btn-cancel-edit');
    this.btnSaveEdit = document.getElementById('btn-save-edit');

    this.modalCelebration = document.getElementById('modal-celebration');
    this.celebrationActionTitle = document.getElementById('celebration-action-title');
    this.celebrationRewardName = document.getElementById('celebration-reward-name');
    this.celebrationPointsSummary = document.getElementById('celebration-points-summary');
    this.btnCloseCelebration = document.getElementById('btn-close-celebration');
  }

  checkInitialPasscodeFlow() {
    this.renderEditModalPickers();
    store.subscribe(() => this.render());

    const urlParams = new URLSearchParams(window.location.search);
    const familyParam = urlParams.get('family');

    if (familyParam) {
      store.setPasscode(familyParam);
      this.showChildView();
      return;
    }

    const savedPasscode = store.getPasscode();
    if (savedPasscode) {
      this.showChildView();
    } else {
      this.showWelcomeView();
    }
  }

  bindEvents() {
    this.btnWelcomeStart.addEventListener('click', () => {
      const code = this.inputWelcomePasscode.value.trim();
      if (!code) {
        alert('「かぞくのあいことば」を入力してください！');
        this.inputWelcomePasscode.focus();
        return;
      }
      sound.playTap();
      store.setPasscode(code);
      this.showChildView();
    });

    this.btnWelcomeSkip.addEventListener('click', () => {
      sound.playTap();
      store.setPasscode('');
      this.showChildView();
    });

    this.btnToSettings.addEventListener('click', () => this.showSettingsView());
    this.btnBackToChild.addEventListener('click', () => this.showChildView());

    this.btnSavePasscode.addEventListener('click', () => {
      const code = this.inputSettingsPasscode.value.trim();
      store.setPasscode(code);
      sound.playTap();
      alert(`家族のあいことばを「${code || 'なし'}」に設定しました！`);
      this.render();
    });

    this.btnCopyInviteUrl.addEventListener('click', () => {
      const code = store.getPasscode();
      if (!code) {
        alert('まずは家族のあいことばを設定してください。');
        return;
      }
      const baseUrl = window.location.href.split('?')[0];
      const inviteUrl = `${baseUrl}?family=${encodeURIComponent(code)}`;

      navigator.clipboard.writeText(inviteUrl).then(() => {
        sound.playTap();
        this.copyHintText.textContent = '✅ URLをコピーしました！家族のLINE等に貼り付けて送ってください。';
        this.copyHintText.style.color = '#10B981';
        setTimeout(() => {
          this.copyHintText.textContent = 'このURLを家族のLINE等に送ると、あいことば入力なしで繋がります！';
          this.copyHintText.style.color = '#6B7280';
        }, 4000);
      }).catch(() => {
        prompt('以下の招待URLをコピーしてください:', inviteUrl);
      });
    });

    this.btnUndo.addEventListener('click', () => {
      const undone = store.undoLastAction();
      if (undone) {
        sound.playUndo();
      }
    });

    this.btnResetAll.addEventListener('click', () => {
      if (confirm('すべてのボタンのポイントを 0 にリセットしますか？')) {
        sound.playReset();
        store.resetAllPoints();
      }
    });

    this.btnAddAction.addEventListener('click', () => {
      const state = store.getState();
      if (state.actions.length >= 6) {
        alert('がんばりボタンは最大6個までです。');
        return;
      }
      this.openEditModal(null);
    });

    this.editActionTitle.addEventListener('input', () => this.updateEditPreview());
    this.editActionReward.addEventListener('input', () => this.updateEditPreview());

    this.editActionEmoji.addEventListener('input', () => {
      this.editingEmoji = this.editActionEmoji.value || '⭐';
      this.updateEditModalChoices();
      this.updateEditPreview();
    });

    this.btnModalTargetMinus.addEventListener('click', () => {
      this.editingTargetPoints = Math.max(1, this.editingTargetPoints - 1);
      this.modalTargetPointsVal.textContent = this.editingTargetPoints;
      this.updateEditPreview();
    });
    this.btnModalTargetPlus.addEventListener('click', () => {
      this.editingTargetPoints = Math.min(100, this.editingTargetPoints + 1);
      this.modalTargetPointsVal.textContent = this.editingTargetPoints;
      this.updateEditPreview();
    });

    this.btnModalCurrentMinus.addEventListener('click', () => {
      this.editingCurrentPoints = Math.max(0, this.editingCurrentPoints - 1);
      this.modalCurrentPointsVal.textContent = this.editingCurrentPoints;
      this.updateEditPreview();
    });
    this.btnModalCurrentPlus.addEventListener('click', () => {
      this.editingCurrentPoints = this.editingCurrentPoints + 1;
      this.modalCurrentPointsVal.textContent = this.editingCurrentPoints;
      this.updateEditPreview();
    });
    this.btnModalCurrentReset.addEventListener('click', () => {
      this.editingCurrentPoints = 0;
      this.modalCurrentPointsVal.textContent = 0;
      this.updateEditPreview();
    });

    this.btnCancelEdit.addEventListener('click', () => this.closeEditModal());
    this.btnSaveEdit.addEventListener('click', () => this.saveEditAction());

    this.btnCloseCelebration.addEventListener('click', () => {
      this.handleCelebrationClose();
    });

    window.addEventListener('resize', () => {
      confetti.resize();
    });
  }

  showWelcomeView() {
    this.welcomeView.classList.add('active');
    this.childView.classList.remove('active');
    this.settingsView.classList.remove('active');
  }

  showChildView() {
    this.welcomeView.classList.remove('active');
    this.settingsView.classList.remove('active');
    this.childView.classList.add('active');
    this.render();
    window.scrollTo(0, 0);
  }

  showSettingsView() {
    sound.playTap();
    this.welcomeView.classList.remove('active');
    this.childView.classList.remove('active');
    this.settingsView.classList.add('active');
    this.render();
    window.scrollTo(0, 0);
  }

  render() {
    const state = store.getState();
    const passcode = store.getPasscode();

    if (passcode) {
      this.childFamilyLabel.textContent = `あいことば: ${passcode}`;
      if (store.isCloudConnected) {
        this.childSyncDot.className = 'sync-dot connected';
        this.childSyncDot.title = '家族とリアルタイム同期中（永続クラウド接続済）';
      } else {
        this.childSyncDot.className = 'sync-dot';
        this.childSyncDot.title = 'クラウド接続確認中...';
      }
    } else {
      this.childFamilyLabel.textContent = '同期なし（一人で利用中）';
      this.childSyncDot.className = 'sync-dot';
      this.childSyncDot.title = '同期未設定';
    }

    if (this.inputSettingsPasscode !== document.activeElement) {
      this.inputSettingsPasscode.value = passcode;
    }

    this.renderActionButtons(state.actions);
    this.btnUndo.disabled = state.history.length === 0;
    this.renderSettingsActionList(state.actions);
  }

  renderActionButtons(actions) {
    this.actionButtonsGrid.innerHTML = '';
    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'action-card-btn';
      btn.style.setProperty('--btn-color', action.color || '#FFEAA7');

      const percent = Math.min(100, Math.round((action.currentPoints / action.targetPoints) * 100));
      const remaining = Math.max(0, action.targetPoints - action.currentPoints);

      btn.innerHTML = `
        <div class="card-header-row">
          <span class="action-emoji">${action.emoji || '⭐'}</span>
          <span class="action-pts-tag">+${action.points} pt</span>
        </div>
        <div class="action-title">${action.title}</div>
        <div class="card-progress-box">
          <div class="card-progress-header">
            <span class="card-points-label">⭐ ${action.currentPoints} / ${action.targetPoints}</span>
            <span class="card-remaining-label">${remaining === 0 ? '達成！' : 'あと ' + remaining}</span>
          </div>
          <div class="card-progress-track">
            <div class="card-progress-fill" style="width: ${percent}%"></div>
          </div>
        </div>
        <div class="card-reward-badge">🎁 ${action.reward || 'ごほうび'}</div>
      `;

      btn.addEventListener('click', () => {
        btn.classList.add('pop-animate');
        setTimeout(() => btn.classList.remove('pop-animate'), 300);

        sound.playTap();
        const result = store.addPoints(action.id);

        if (result && result.achieved) {
          this.triggerCelebration(result.action);
        }
      });

      this.actionButtonsGrid.appendChild(btn);
    });
  }

  renderSettingsActionList(actions) {
    this.actionSettingsList.innerHTML = '';
    actions.forEach(action => {
      const item = document.createElement('div');
      item.className = 'action-setting-item';
      item.innerHTML = `
        <div class="action-setting-preview">
          <div class="action-setting-emoji" style="background-color: ${action.color || '#FFEAA7'}">
            ${action.emoji || '⭐'}
          </div>
          <div class="action-setting-details">
            <span class="action-setting-title">${action.title}</span>
            <span class="action-setting-meta">+${action.points}pt（目標: ${action.targetPoints}pt / 現在: ${action.currentPoints}pt）</span>
            <span class="action-setting-reward">🎁 ごほうび: ${action.reward}</span>
          </div>
        </div>
        <div class="action-setting-btns">
          <button type="button" class="btn-item-action edit" data-id="${action.id}">へんしゅう</button>
          <button type="button" class="btn-item-action delete" data-id="${action.id}">さくじょ</button>
        </div>
      `;

      item.querySelector('.btn-item-action.edit').addEventListener('click', () => {
        this.openEditModal(action.id);
      });

      item.querySelector('.btn-item-action.delete').addEventListener('click', () => {
        if (confirm(`「${action.title}」ボタンを削除しますか？`)) {
          store.deleteAction(action.id);
        }
      });

      this.actionSettingsList.appendChild(item);
    });
  }

  renderEditModalPickers() {
    this.editPointOptions.innerHTML = '';
    POINT_OPTIONS.forEach(pts => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-pt-choice';
      btn.textContent = `+${pts}pt`;
      btn.dataset.pts = pts;
      btn.addEventListener('click', () => {
        this.editingPoints = pts;
        this.updateEditModalChoices();
        this.updateEditPreview();
      });
      this.editPointOptions.appendChild(btn);
    });

    this.presetEmojisList.innerHTML = '';
    EMOJI_CATEGORIES.forEach(cat => {
      const catBox = document.createElement('div');
      catBox.className = 'emoji-category-box';
      catBox.innerHTML = `<span class="emoji-cat-name">${cat.name}</span><div class="emoji-cat-grid"></div>`;
      
      const grid = catBox.querySelector('.emoji-cat-grid');
      cat.emojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-preset-emoji';
        btn.textContent = emoji;
        btn.addEventListener('click', () => {
          this.editingEmoji = emoji;
          this.editActionEmoji.value = emoji;
          this.updateEditModalChoices();
          this.updateEditPreview();
        });
        grid.appendChild(btn);
      });

      this.presetEmojisList.appendChild(catBox);
    });

    this.colorPaletteList.innerHTML = '';
    PRESET_COLORS.forEach(color => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-color-choice';
      btn.style.backgroundColor = color;
      btn.dataset.color = color;
      btn.addEventListener('click', () => {
        this.editingColor = color;
        this.updateEditModalChoices();
        this.updateEditPreview();
      });
      this.colorPaletteList.appendChild(btn);
    });
  }

  openEditModal(actionId) {
    this.currentEditingId = actionId;
    const state = store.getState();

    if (actionId) {
      const action = state.actions.find(a => a.id === actionId);
      this.modalTitle.textContent = 'ボタンのへんしゅう';
      this.editActionTitle.value = action ? action.title : '';
      this.editingPoints = action ? action.points : 1;
      this.editingTargetPoints = action ? action.targetPoints : 5;
      this.editingCurrentPoints = action ? action.currentPoints : 0;
      this.editActionReward.value = action ? action.reward : 'ごほうび';
      this.editingEmoji = action ? action.emoji : '⭐';
      this.editingColor = action ? action.color : '#FFEAA7';
    } else {
      this.modalTitle.textContent = 'あたらしいボタン';
      this.editActionTitle.value = '';
      this.editingPoints = 1;
      this.editingTargetPoints = 5;
      this.editingCurrentPoints = 0;
      this.editActionReward.value = 'ごほうび';
      this.editingEmoji = '⭐';
      this.editingColor = PRESET_COLORS[state.actions.length % PRESET_COLORS.length];
    }

    this.modalTargetPointsVal.textContent = this.editingTargetPoints;
    this.modalCurrentPointsVal.textContent = this.editingCurrentPoints;
    this.editActionEmoji.value = this.editingEmoji;

    this.updateEditModalChoices();
    this.updateEditPreview();
    this.modalEditAction.classList.add('active');
    this.modalEditAction.setAttribute('aria-hidden', 'false');
  }

  closeEditModal() {
    this.modalEditAction.classList.remove('active');
    this.modalEditAction.setAttribute('aria-hidden', 'true');
    this.currentEditingId = null;
  }

  updateEditModalChoices() {
    this.editPointOptions.querySelectorAll('.btn-pt-choice').forEach(btn => {
      btn.classList.toggle('selected', Number(btn.dataset.pts) === this.editingPoints);
    });

    this.presetEmojisList.querySelectorAll('.btn-preset-emoji').forEach(btn => {
      btn.classList.toggle('selected', btn.textContent === this.editingEmoji);
    });

    this.colorPaletteList.querySelectorAll('.btn-color-choice').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.color === this.editingColor);
    });
  }

  updateEditPreview() {
    const title = this.editActionTitle.value.trim() || 'なまえ';
    const reward = this.editActionReward.value.trim() || 'ごほうび';

    this.previewTitle.textContent = title;
    this.previewEmoji.textContent = this.editingEmoji;
    this.previewPts.textContent = `+${this.editingPoints} pt`;
    this.previewProgText.textContent = `⭐ ${this.editingCurrentPoints} / ${this.editingTargetPoints}`;
    
    const pct = Math.min(100, Math.round((this.editingCurrentPoints / this.editingTargetPoints) * 100));
    this.previewBarFill.style.width = `${pct}%`;
    this.previewRewardText.textContent = `🎁 ごほうび: ${reward}`;
    this.actionPreviewCard.style.backgroundColor = this.editingColor;
  }

  saveEditAction() {
    const title = this.editActionTitle.value.trim();
    if (!title) {
      alert('なまえ（やる行動）を入力してください。');
      this.editActionTitle.focus();
      return;
    }

    const reward = this.editActionReward.value.trim() || 'ごほうび';

    const actionData = {
      id: this.currentEditingId,
      title: title,
      points: this.editingPoints,
      targetPoints: this.editingTargetPoints,
      currentPoints: this.editingCurrentPoints,
      reward: reward,
      emoji: this.editingEmoji,
      color: this.editingColor
    };

    const success = store.saveAction(actionData);
    if (success) {
      this.closeEditModal();
    }
  }

  triggerCelebration(action) {
    this.achievedActionId = action.id;
    sound.playFanfare();

    this.celebrationActionTitle.textContent = `「${action.title}」もくひょうたっせい！`;
    this.celebrationRewardName.textContent = action.reward;
    this.celebrationPointsSummary.textContent = `⭐ ${action.currentPoints} / ${action.targetPoints} ポイント達成！`;

    this.modalCelebration.classList.add('active');
    this.modalCelebration.setAttribute('aria-hidden', 'false');

    confetti.start();
  }

  handleCelebrationClose() {
    if (this.achievedActionId) {
      store.resetActionPoints(this.achievedActionId);
      this.achievedActionId = null;
    }

    this.modalCelebration.classList.remove('active');
    this.modalCelebration.setAttribute('aria-hidden', 'true');
    confetti.stop();
    sound.playReset();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
