/**
 * app.js - メインアプリケーション制御
 */

import { store } from './store.js';
import { sound } from './sound.js';
import { confetti } from './confetti.js';

// プリセット絵文字・カラー一覧
const PRESET_EMOJIS = ['🦷', '📦', '🍽️', '👟', '📖', '🛏️', '🎒', '🥦', '🏃', '🎨', '✨', '⭐'];
const PRESET_COLORS = [
  '#FFEAA7', // イエロー
  '#DFF9FB', // スカイブルー
  '#FFCCCC', // ピンク
  '#C7ECEE', // ミント
  '#E8D7FF', // ラベンダー
  '#D4EDDA', // ライトグリーン
  '#FFE3E3', // コーラル
  '#FFF2CC'  // クリーム
];
const POINT_OPTIONS = [1, 2, 3, 5, 10];

class App {
  constructor() {
    this.currentEditingId = null;
    this.editingEmoji = '⭐';
    this.editingColor = '#FFEAA7';
    this.editingPoints = 1;

    this.cacheDom();
    this.bindEvents();
    this.init();
  }

  cacheDom() {
    // Views
    this.childView = document.getElementById('child-view');
    this.settingsView = document.getElementById('settings-view');

    // Child view elements
    this.rewardLabel = document.getElementById('reward-label');
    this.btnToSettings = document.getElementById('btn-to-settings');
    this.childCurrentPoints = document.getElementById('child-current-points');
    this.childTargetPoints = document.getElementById('child-target-points');
    this.progressFill = document.getElementById('progress-fill');
    this.progressMessage = document.getElementById('progress-message');
    this.actionButtonsGrid = document.getElementById('action-buttons-grid');
    this.btnUndo = document.getElementById('btn-undo');

    // Settings view elements
    this.btnBackToChild = document.getElementById('btn-back-to-child');
    this.inputRewardText = document.getElementById('input-reward-text');
    this.settingsTargetPoints = document.getElementById('settings-target-points');
    this.btnTargetMinus = document.getElementById('btn-target-minus');
    this.btnTargetPlus = document.getElementById('btn-target-plus');
    this.settingsCurrentPoints = document.getElementById('settings-current-points');
    this.btnCurrentMinus = document.getElementById('btn-current-minus');
    this.btnCurrentPlus = document.getElementById('btn-current-plus');
    this.btnResetPoints = document.getElementById('btn-reset-points');
    this.btnAddAction = document.getElementById('btn-add-action');
    this.actionSettingsList = document.getElementById('action-settings-list');

    // Edit modal elements
    this.modalEditAction = document.getElementById('modal-edit-action');
    this.modalTitle = document.getElementById('modal-title');
    this.editActionTitle = document.getElementById('edit-action-title');
    this.editPointOptions = document.getElementById('edit-point-options');
    this.editActionEmoji = document.getElementById('edit-action-emoji');
    this.presetEmojisList = document.getElementById('preset-emojis-list');
    this.colorPaletteList = document.getElementById('color-palette-list');
    this.actionPreviewBtn = document.getElementById('action-preview-btn');
    this.previewEmoji = document.getElementById('preview-emoji');
    this.previewTitle = document.getElementById('preview-title');
    this.previewPts = document.getElementById('preview-pts');
    this.btnCancelEdit = document.getElementById('btn-cancel-edit');
    this.btnSaveEdit = document.getElementById('btn-save-edit');

    // Celebration modal elements
    this.modalCelebration = document.getElementById('modal-celebration');
    this.celebrationRewardName = document.getElementById('celebration-reward-name');
    this.celebrationPointsSummary = document.getElementById('celebration-points-summary');
    this.btnCloseCelebration = document.getElementById('btn-close-celebration');
  }

  init() {
    this.renderEditModalPickers();
    store.subscribe(() => this.render());
    this.render();
  }

  bindEvents() {
    // 画面遷移
    this.btnToSettings.addEventListener('click', () => this.showSettingsView());
    this.btnBackToChild.addEventListener('click', () => this.showChildView());

    // 子ども画面：Undo
    this.btnUndo.addEventListener('click', () => {
      const undone = store.undoLastAction();
      if (undone) {
        sound.playUndo();
      }
    });

    // 設定画面：ご褒美テキスト変更
    this.inputRewardText.addEventListener('input', (e) => {
      store.setRewardText(e.target.value);
    });

    // 設定画面：目標増減
    this.btnTargetMinus.addEventListener('click', () => {
      sound.playTap();
      store.adjustTargetPoints(-1);
    });
    this.btnTargetPlus.addEventListener('click', () => {
      sound.playTap();
      store.adjustTargetPoints(1);
    });

    // 設定画面：現在ポイント増減
    this.btnCurrentMinus.addEventListener('click', () => {
      sound.playTap();
      store.adjustCurrentPoints(-1);
    });
    this.btnCurrentPlus.addEventListener('click', () => {
      sound.playTap();
      store.adjustCurrentPoints(1);
    });

    // 設定画面：リセット
    this.btnResetPoints.addEventListener('click', () => {
      if (confirm('現在のポイントを 0 にリセットしますか？')) {
        sound.playReset();
        store.resetCurrentPoints();
      }
    });

    // 設定画面：ボタン新規追加
    this.btnAddAction.addEventListener('click', () => {
      const state = store.getState();
      if (state.actions.length >= 6) {
        alert('がんばりボタンは最大6個までです。');
        return;
      }
      this.openEditModal(null);
    });

    // モーダル編集：入力リアルタイムプレビュー
    this.editActionTitle.addEventListener('input', () => this.updateEditPreview());

    this.btnCancelEdit.addEventListener('click', () => this.closeEditModal());
    this.btnSaveEdit.addEventListener('click', () => this.saveEditAction());

    // 達成モーダル：閉じる
    this.btnCloseCelebration.addEventListener('click', () => {
      this.closeCelebrationModal();
    });

    // ウィンドウリサイズ時のCanvas調整
    window.addEventListener('resize', () => {
      confetti.resize();
    });
  }

  // --- 画面表示切替 ---
  showSettingsView() {
    sound.playTap();
    this.childView.classList.remove('active');
    this.settingsView.classList.add('active');
    window.scrollTo(0, 0);
  }

  showChildView() {
    sound.playTap();
    this.settingsView.classList.remove('active');
    this.childView.classList.add('active');
    window.scrollTo(0, 0);
  }

  // --- 全体レンダリング ---
  render() {
    const state = store.getState();

    // 1. 子ども画面の描画
    this.rewardLabel.textContent = `ごほうび: ${state.rewardText}`;
    this.childCurrentPoints.textContent = state.currentPoints;
    this.childTargetPoints.textContent = state.targetPoints;

    // 進捗率（上限100%）
    const percent = Math.min(100, Math.round((state.currentPoints / state.targetPoints) * 100));
    this.progressFill.style.width = `${percent}%`;

    const remaining = Math.max(0, state.targetPoints - state.currentPoints);
    if (remaining === 0) {
      this.progressMessage.textContent = '🎉 もくひょう たっせい！！ ごほうびを ゲット！';
    } else {
      this.progressMessage.textContent = `あと ${remaining} ポイントで ゴール！`;
    }

    // Undoボタン状態
    this.btnUndo.disabled = state.history.length === 0;

    // 行動ボタングリッドの描画
    this.renderActionButtons(state.actions);

    // 2. 設定画面の描画
    if (this.inputRewardText !== document.activeElement) {
      this.inputRewardText.value = state.rewardText;
    }
    this.settingsTargetPoints.textContent = state.targetPoints;
    this.settingsCurrentPoints.textContent = state.currentPoints;
    this.renderSettingsActionList(state.actions);
  }

  // 子ども画面の行動ボタン一覧
  renderActionButtons(actions) {
    this.actionButtonsGrid.innerHTML = '';
    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'action-btn';
      btn.style.setProperty('--btn-color', action.color || '#FFEAA7');
      btn.innerHTML = `
        <span class="action-emoji">${action.emoji || '⭐'}</span>
        <span class="action-title">${action.title}</span>
        <span class="action-pts-tag">+${action.points} pt</span>
      `;

      btn.addEventListener('click', () => {
        btn.classList.add('pop-animate');
        setTimeout(() => btn.classList.remove('pop-animate'), 300);

        sound.playTap();
        const result = store.addPoints(action.id);

        if (result && result.newlyAchieved) {
          this.triggerCelebration();
        }
      });

      this.actionButtonsGrid.appendChild(btn);
    });
  }

  // 設定画面の行動ボタン一覧
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
            <span class="action-setting-points">+${action.points} pt</span>
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

  // --- ボタン編集モーダル ---
  renderEditModalPickers() {
    // ポイント選択肢
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

    // 絵文字プリセット
    this.presetEmojisList.innerHTML = '';
    PRESET_EMOJIS.forEach(emoji => {
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
      this.presetEmojisList.appendChild(btn);
    });

    // カラーパレット
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
      this.editingEmoji = action ? action.emoji : '⭐';
      this.editingColor = action ? action.color : '#FFEAA7';
    } else {
      this.modalTitle.textContent = 'あたらしいボタン';
      this.editActionTitle.value = '';
      this.editingPoints = 1;
      this.editingEmoji = '⭐';
      this.editingColor = PRESET_COLORS[state.actions.length % PRESET_COLORS.length];
    }

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
    // ポイント選択UIのアクティブ化
    this.editPointOptions.querySelectorAll('.btn-pt-choice').forEach(btn => {
      btn.classList.toggle('selected', Number(btn.dataset.pts) === this.editingPoints);
    });

    // 絵文字UIのアクティブ化
    this.presetEmojisList.querySelectorAll('.btn-preset-emoji').forEach(btn => {
      btn.classList.toggle('selected', btn.textContent === this.editingEmoji);
    });

    // カラーUIのアクティブ化
    this.colorPaletteList.querySelectorAll('.btn-color-choice').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.color === this.editingColor);
    });
  }

  updateEditPreview() {
    const title = this.editActionTitle.value.trim() || 'なまえ';
    this.previewTitle.textContent = title;
    this.previewEmoji.textContent = this.editingEmoji;
    this.previewPts.textContent = `+${this.editingPoints} pt`;
    this.actionPreviewBtn.style.backgroundColor = this.editingColor;
  }

  saveEditAction() {
    const title = this.editActionTitle.value.trim();
    if (!title) {
      alert('なまえ（やる行動）を入力してください。');
      this.editActionTitle.focus();
      return;
    }

    const actionData = {
      id: this.currentEditingId,
      title: title,
      points: this.editingPoints,
      emoji: this.editingEmoji,
      color: this.editingColor
    };

    const success = store.saveAction(actionData);
    if (success) {
      this.closeEditModal();
    }
  }

  // --- 達成お祝い演出 ---
  triggerCelebration() {
    const state = store.getState();
    sound.playFanfare();

    this.celebrationRewardName.textContent = state.rewardText;
    this.celebrationPointsSummary.textContent = `⭐ ${state.currentPoints} / ${state.targetPoints} ポイント`;

    this.modalCelebration.classList.add('active');
    this.modalCelebration.setAttribute('aria-hidden', 'false');

    confetti.start();
  }

  closeCelebrationModal() {
    this.modalCelebration.classList.remove('active');
    this.modalCelebration.setAttribute('aria-hidden', 'true');
    confetti.stop();
    sound.playTap();
  }
}

// アプリ起動
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
