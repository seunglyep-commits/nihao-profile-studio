import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Plus,
  Sparkles,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import { EMOJI_CHOICES, INTRO_PRESETS } from '../data/presets';
import { IntroItem, IntroPreset } from '../types/profile';
import { speakChineseItem } from '../utils/speech';
import { PinyinInputHelper } from './PinyinInputHelper';
import { PinyinText } from './PinyinText';

interface IntroItemsEditorProps {
  namePinyin: string;
  nameHanzi: string;
  nameKorean: string;
  items: IntroItem[];
  showHanzi: boolean;
  colorTones: boolean;
  onUpdateProfileField: (
    field: 'namePinyin' | 'nameHanzi' | 'nameKorean',
    value: string,
  ) => void;
  onAddItem: (item: Omit<IntroItem, 'id'>) => void;
  onUpdateItem: (id: string, patch: Partial<IntroItem>) => void;
  onMoveItem: (index: number, direction: -1 | 1) => void;
  onDeleteItem: (id: string) => void;
}

export const IntroItemsEditor: React.FC<IntroItemsEditorProps> = ({
  namePinyin,
  nameHanzi,
  nameKorean,
  items,
  showHanzi,
  colorTones,
  onUpdateProfileField,
  onAddItem,
  onUpdateItem,
  onMoveItem,
  onDeleteItem,
}) => {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [draftLabel, setDraftLabel] = useState('취미');
  const [draftEmoji, setDraftEmoji] = useState('🎨');
  const [draftPinyin, setDraftPinyin] = useState('');
  const [draftKorean, setDraftKorean] = useState('');
  const [draftHanzi, setDraftHanzi] = useState('');

  const handleApplyPresetToDraft = (preset: IntroPreset) => {
    setDraftLabel(preset.category);
    setDraftEmoji(preset.emoji);
    setDraftPinyin(preset.pinyin);
    setDraftKorean(preset.korean);
    setDraftHanzi(preset.hanzi);
  };

  const handleQuickAddPreset = (preset: IntroPreset) => {
    onAddItem({
      label: preset.category,
      emoji: preset.emoji,
      pinyin: preset.pinyin,
      korean: preset.korean,
      hanzi: preset.hanzi,
    });
    setShowAddPanel(false);
  };

  const handleSubmitDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftPinyin.trim()) return;
    onAddItem({
      label: draftLabel.trim() || '소개',
      emoji: draftEmoji,
      pinyin: draftPinyin.trim(),
      korean: draftKorean.trim(),
      hanzi: draftHanzi.trim(),
    });
    setDraftPinyin('');
    setDraftKorean('');
    setDraftHanzi('');
    setShowAddPanel(false);
  };

  return (
    <div className="intro-editor">
      {/* Basic Name Section */}
      <div className="editor-card">
        <h3 className="section-subtitle">1. 내 이름 (한어병음 중심)</h3>
        <div className="form-grid">
          <div className="form-field full">
            <label htmlFor="name-pinyin">이름 (한어병음)</label>
            <PinyinInputHelper
              id="name-pinyin"
              value={namePinyin}
              onChange={(val) => onUpdateProfileField('namePinyin', val)}
              placeholder="예: Mǐnzhì (Min3zhi4)"
              compact
            />
          </div>
          <div className="form-field">
            <label htmlFor="name-korean">한국어 이름</label>
            <input
              id="name-korean"
              type="text"
              className="text-input"
              value={nameKorean}
              onChange={(e) => onUpdateProfileField('nameKorean', e.target.value)}
              placeholder="예: 김민지"
            />
          </div>
          <div className="form-field">
            <label htmlFor="name-hanzi">한자 이름 (선택)</label>
            <input
              id="name-hanzi"
              type="text"
              className="text-input"
              value={nameHanzi}
              onChange={(e) => onUpdateProfileField('nameHanzi', e.target.value)}
              placeholder="예: 敏智 (발음/표시용)"
            />
          </div>
        </div>
      </div>

      {/* Self-Intro Items List */}
      <div className="editor-card">
        <div className="section-header-row">
          <div>
            <h3 className="section-subtitle">
              2. 중국어 자기소개 항목 ({items.length})
            </h3>
            <p className="helper-note">
              한어병음을 중심으로 문장을 추가하고 순서를 바꿔보세요.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowAddPanel((prev) => !prev)}
          >
            {showAddPanel ? <X size={16} /> : <Plus size={16} />}
            {showAddPanel ? '닫기' : '자기소개 항목 추가'}
          </button>
        </div>

        {/* Add Panel */}
        {showAddPanel && (
          <div className="add-panel">
            <div className="preset-section">
              <div className="preset-title">
                <Sparkles size={14} /> 추천 중국어 자기소개 표현 (눌러서 바로 추가 또는 수정)
              </div>
              <div className="preset-list">
                {INTRO_PRESETS.map((preset, idx) => (
                  <div key={idx} className="preset-chip-card">
                    <div className="preset-chip-top">
                      <span className="preset-badge">
                        {preset.emoji} {preset.category}
                      </span>
                      <div className="preset-actions">
                        <button
                          type="button"
                          className="btn-xs"
                          onClick={() => handleApplyPresetToDraft(preset)}
                        >
                          불러와 수정
                        </button>
                        <button
                          type="button"
                          className="btn-xs accent"
                          onClick={() => handleQuickAddPreset(preset)}
                        >
                          + 바로 추가
                        </button>
                      </div>
                    </div>
                    <div className="preset-pinyin pinyin-font">
                      {preset.pinyin}
                    </div>
                    <div className="preset-korean">{preset.korean}</div>
                  </div>
                ))}
              </div>
            </div>

            <form className="draft-form" onSubmit={handleSubmitDraft}>
              <div className="draft-title">직접 입력해서 추가하기</div>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="draft-label">항목 제목</label>
                  <input
                    id="draft-label"
                    type="text"
                    className="text-input"
                    value={draftLabel}
                    onChange={(e) => setDraftLabel(e.target.value)}
                    placeholder="예: 취미, 성격, 좋아하는 음식"
                  />
                </div>
                <div className="form-field">
                  <label>아이콘</label>
                  <div className="emoji-picker">
                    {EMOJI_CHOICES.map((em) => (
                      <button
                        key={em}
                        type="button"
                        className={`emoji-btn ${draftEmoji === em ? 'active' : ''}`}
                        onClick={() => setDraftEmoji(em)}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-field full">
                  <label htmlFor="draft-pinyin">
                    중국어 문장 (한어병음 · 필수)
                  </label>
                  <PinyinInputHelper
                    id="draft-pinyin"
                    value={draftPinyin}
                    onChange={setDraftPinyin}
                    placeholder="예: Wo3 xi3huan1 da3 lan2qiu2. (숫자 입력 시 자동 성조 변환)"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="draft-korean">한국어 뜻</label>
                  <input
                    id="draft-korean"
                    type="text"
                    className="text-input"
                    value={draftKorean}
                    onChange={(e) => setDraftKorean(e.target.value)}
                    placeholder="예: 저는 농구를 좋아해요."
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="draft-hanzi">한자 (선택 · 발음/표시용)</label>
                  <input
                    id="draft-hanzi"
                    type="text"
                    className="text-input"
                    value={draftHanzi}
                    onChange={(e) => setDraftHanzi(e.target.value)}
                    placeholder="예: 我喜欢打篮球。"
                  />
                </div>
              </div>
              <div className="draft-submit-row">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!draftPinyin.trim()}
                >
                  <Plus size={16} /> 프로필에 추가하기
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Items */}
        {items.length === 0 ? (
          <div className="empty-items">
            아직 추가된 자기소개 항목이 없어요. 위 <strong>자기소개 항목 추가</strong> 버튼을 눌러보세요!
          </div>
        ) : (
          <div className="item-list">
            {items.map((item, idx) => {
              const isEditing = editingId === item.id;
              return (
                <div key={item.id} className="item-row-card">
                  <div className="item-row-head">
                    <span className="item-pill">
                      {item.emoji} {item.label}
                    </span>
                    <div className="item-row-controls">
                      <button
                        type="button"
                        className="icon-mini"
                        onClick={() => speakChineseItem(item)}
                        title="중국어 발음 듣기"
                      >
                        <Volume2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-mini"
                        onClick={() => onMoveItem(idx, -1)}
                        disabled={idx === 0}
                        title="위로 이동"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-mini"
                        onClick={() => onMoveItem(idx, 1)}
                        disabled={idx === items.length - 1}
                        title="아래로 이동"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-xs"
                        onClick={() =>
                          setEditingId(isEditing ? null : item.id)
                        }
                      >
                        {isEditing ? '완료' : '수정'}
                      </button>
                      <button
                        type="button"
                        className="icon-mini danger"
                        onClick={() => onDeleteItem(item.id)}
                        title="삭제"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="item-edit-box">
                      <div className="form-grid">
                        <div className="form-field">
                          <label>항목 제목</label>
                          <input
                            type="text"
                            className="text-input"
                            value={item.label}
                            onChange={(e) =>
                              onUpdateItem(item.id, { label: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-field">
                          <label>아이콘</label>
                          <select
                            className="text-input"
                            value={item.emoji}
                            onChange={(e) =>
                              onUpdateItem(item.id, { emoji: e.target.value })
                            }
                          >
                            {EMOJI_CHOICES.map((em) => (
                              <option key={em} value={em}>
                                {em}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-field full">
                          <label>한어병음</label>
                          <PinyinInputHelper
                            value={item.pinyin}
                            onChange={(val) =>
                              onUpdateItem(item.id, { pinyin: val })
                            }
                            compact
                          />
                        </div>
                        <div className="form-field">
                          <label>한국어 뜻</label>
                          <input
                            type="text"
                            className="text-input"
                            value={item.korean}
                            onChange={(e) =>
                              onUpdateItem(item.id, { korean: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-field">
                          <label>한자 (선택)</label>
                          <input
                            type="text"
                            className="text-input"
                            value={item.hanzi}
                            onChange={(e) =>
                              onUpdateItem(item.id, { hanzi: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="item-display">
                      <div className="item-pinyin pinyin-font">
                        <PinyinText
                          text={item.pinyin}
                          colorTones={colorTones}
                        />
                      </div>
                      {showHanzi && item.hanzi && (
                        <div className="item-hanzi">{item.hanzi}</div>
                      )}
                      {item.korean && (
                        <div className="item-korean">{item.korean}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
