import React, { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  TONE_KEYPAD_GROUPS,
  convertPinyinNumbersToMarks,
} from '../utils/pinyin';

interface PinyinInputHelperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  compact?: boolean;
}

export const PinyinInputHelper: React.FC<PinyinInputHelperProps> = ({
  value,
  onChange,
  placeholder = '예: Wo3 jiao4 Min3zhi4. (숫자 입력 시 자동 성조 변환)',
  id,
  compact = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autoConvert, setAutoConvert] = useState(true);
  const [showKeypad, setShowKeypad] = useState(!compact);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (autoConvert) {
      const converted = convertPinyinNumbersToMarks(raw);
      onChange(converted);
    } else {
      onChange(raw);
    }
  };

  const handleManualConvert = () => {
    onChange(convertPinyinNumbersToMarks(value));
    inputRef.current?.focus();
  };

  const insertCharAtCursor = (char: string) => {
    const el = inputRef.current;
    if (!el) {
      onChange(value + char);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + char + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + char.length;
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="pinyin-helper">
      <div className="pinyin-input-row">
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="text-input pinyin-font"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="btn-chip"
          onClick={handleManualConvert}
          title="ni3 hao3 같은 숫자를 성조 기호(nǐ hǎo)로 바꿉니다"
        >
          <Sparkles size={14} />
          성조 변환
        </button>
      </div>

      <div className="pinyin-helper-bar">
        <label className="inline-toggle">
          <input
            type="checkbox"
            checked={autoConvert}
            onChange={(e) => setAutoConvert(e.target.checked)}
          />
          <span>숫자(1~4) 입력 시 자동 성조 변환</span>
        </label>
        <button
          type="button"
          className="btn-link"
          onClick={() => setShowKeypad((prev) => !prev)}
        >
          {showKeypad ? '성조 자판 접기' : '성조 자판 열기'}
        </button>
      </div>

      {showKeypad && (
        <div className="tone-keypad" aria-label="한어병음 성조 자판">
          {TONE_KEYPAD_GROUPS.map((group) => (
            <div key={group.base} className="tone-group">
              {group.tones.map((ch, idx) => (
                <button
                  key={ch}
                  type="button"
                  className={`tone-key tone-${idx + 1}`}
                  onClick={() => insertCharAtCursor(ch)}
                  title={`${group.base} ${idx + 1}성 입력`}
                >
                  {ch}
                </button>
              ))}
            </div>
          ))}
          <button
            type="button"
            className="tone-key"
            onClick={() => insertCharAtCursor('ü')}
            title="ü 입력"
          >
            ü
          </button>
        </div>
      )}
    </div>
  );
};
