/**
 * store.js - 状態管理および localStorage 永続化モジュール
 */

const STORAGE_KEY = 'kodomo_point_app_state_v1';

const DEFAULT_STATE = {
  currentPoints: 0,
  targetPoints: 10,
  rewardText: 'すきなアイス 🍦',
  celebrated: false, // 今回の目標達成モーダルを既に表示したかどうか
  actions: [
    { id: 'act_1', title: 'はみがき', points: 1, emoji: '🦷', color: '#FFEAA7' },
    { id: 'act_2', title: 'おかたづけ', points: 1, emoji: '📦', color: '#DFF9FB' },
    { id: 'act_3', title: 'おてつだい', points: 2, emoji: '🍽️', color: '#FFCCCC' }
  ],
  history: [] // Undo用履歴: { actionId, pointsAdded, timestamp }
};

class StateStore {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // デフォルトとマージして構造を保護
        return {
          ...DEFAULT_STATE,
          ...parsed,
          actions: Array.isArray(parsed.actions) && parsed.actions.length > 0 ? parsed.actions : DEFAULT_STATE.actions,
          history: Array.isArray(parsed.history) ? parsed.history : []
        };
      }
    } catch (e) {
      console.warn('localStorage 読み込みエラー:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('localStorage 保存エラー:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  getState() {
    return this.state;
  }

  // --- ポイント操作 ---
  addPoints(actionId) {
    const action = this.state.actions.find(a => a.id === actionId);
    if (!action) return;

    const pointsToAdd = action.points || 1;
    this.state.currentPoints += pointsToAdd;
    this.state.history.push({
      actionId: action.id,
      pointsAdded: pointsToAdd,
      timestamp: Date.now()
    });

    // 達成判定（新たに目標到達した場合）
    let newlyAchieved = false;
    if (this.state.currentPoints >= this.state.targetPoints && !this.state.celebrated) {
      this.state.celebrated = true;
      newlyAchieved = true;
    }

    this.saveState();
    return { newlyAchieved, pointsAdded: pointsToAdd };
  }

  undoLastAction() {
    if (this.state.history.length === 0) return null;

    const last = this.state.history.pop();
    this.state.currentPoints = Math.max(0, this.state.currentPoints - last.pointsAdded);

    // 目標未満に戻った場合はcelebratedフラグをリセット
    if (this.state.currentPoints < this.state.targetPoints) {
      this.state.celebrated = false;
    }

    this.saveState();
    return last;
  }

  // 保護者画面からの手動ポイント増減
  adjustCurrentPoints(delta) {
    const newPts = Math.max(0, this.state.currentPoints + delta);
    this.state.currentPoints = newPts;
    if (this.state.currentPoints < this.state.targetPoints) {
      this.state.celebrated = false;
    }
    // 手動変更時は履歴をクリア
    this.state.history = [];
    this.saveState();
  }

  // ポイントリセット
  resetCurrentPoints() {
    this.state.currentPoints = 0;
    this.state.celebrated = false;
    this.state.history = [];
    this.saveState();
  }

  // 目標ポイントの増減
  adjustTargetPoints(delta) {
    const newTarget = Math.max(1, Math.min(100, this.state.targetPoints + delta));
    this.state.targetPoints = newTarget;
    if (this.state.currentPoints < this.state.targetPoints) {
      this.state.celebrated = false;
    }
    this.saveState();
  }

  // ご褒美内容の変更
  setRewardText(text) {
    this.state.rewardText = text.trim() || 'ごほうび';
    this.saveState();
  }

  // --- ボタン管理 ---
  saveAction(actionData) {
    // 既存の更新か新規追加か
    if (actionData.id) {
      const idx = this.state.actions.findIndex(a => a.id === actionData.id);
      if (idx !== -1) {
        this.state.actions[idx] = { ...this.state.actions[idx], ...actionData };
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
        emoji: actionData.emoji || '⭐',
        color: actionData.color || '#FFEAA7'
      };
      this.state.actions.push(newAction);
    }
    this.saveState();
    return true;
  }

  deleteAction(actionId) {
    if (this.state.actions.length <= 1) {
      alert('ボタンは最低1つ必要です。');
      return false;
    }
    this.state.actions = this.state.actions.filter(a => a.id !== actionId);
    this.saveState();
    return true;
  }
}

export const store = new StateStore();
