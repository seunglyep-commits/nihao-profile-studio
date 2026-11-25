import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Play,
  Square as StopIcon,
  Volume2,
} from 'lucide-react';
import { CARD_THEMES } from '../data/presets';
import { CardThemeId, ProfileState } from '../types/profile';
import { exportProfileCardPng } from '../utils/exportCard';
import {
  isSpeechSupported,
  speakChineseItem,
  speakChineseSequence,
  stopSpeaking,
} from '../utils/speech';
import { PinyinText } from './PinyinText';

interface ProfileCardPreviewProps {
  profile: ProfileState;
  onChangeTheme: (theme: CardThemeId) => void;
  onToggleSetting: (key: 'showHanzi' | 'colorTones') => void;
}

export const ProfileCardPreview: React.FC<ProfileCardPreviewProps> = ({
  profile,
  onChangeTheme,
  onToggleSetting,
}) => {
  const theme = CARD_THEMES[profile.theme];
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [speechRate, setSpeechRate] = useState<0.75 | 0.95>(0.95);
  const [downloading, setDownloading] = useState(false);
  const stopFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stopFnRef.current?.();
      stopSpeaking();
    };
  }, []);

  const handlePlayAll = () => {
    if (isPlayingAll) {
      stopFnRef.current?.();
      setIsPlayingAll(false);
      setActiveSpeechId(null);
      return;
    }
    setIsPlayingAll(true);
    stopFnRef.current = speakChineseSequence(
      profile.items,
      speechRate,
      (id) => setActiveSpeechId(id),
      () => {
        setIsPlayingAll(false);
        setActiveSpeechId(null);
      },
    );
  };

  const handleSpeakSingle = (item: ProfileState['items'][number]) => {
    stopFnRef.current?.();
    setIsPlayingAll(false);
    setActiveSpeechId(item.id);
    speakChineseItem(item, speechRate, () => {
      setActiveSpeechId(null);
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportProfileCardPng(profile);
    } finally {
      setDownloading(false);
    }
  };

  const speechAvailable = isSpeechSupported();

  return (
    <div className="preview-panel">
      <div className="preview-controls-bar">
        <div className="theme-swatches" role="group" aria-label="카드 테마 색상">
          {Object.values(CARD_THEMES).map((t) => (
            <button
              key={t.id}
              type="button"
              className={`theme-pill ${profile.theme === t.id ? 'active' : ''}`}
              onClick={() => onChangeTheme(t.id)}
              title={t.name}
            >
              <span
                className="theme-dot"
                style={{ backgroundColor: t.accent }}
              />
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        <div className="display-toggles">
          <label className="inline-toggle">
            <input
              type="checkbox"
              checked={profile.colorTones}
              onChange={() => onToggleSetting('colorTones')}
            />
            <span>성조 색깔 표시</span>
          </label>
          <label className="inline-toggle">
            <input
              type="checkbox"
              checked={profile.showHanzi}
              onChange={() => onToggleSetting('showHanzi')}
            />
            <span>한자 함께 보기</span>
          </label>
        </div>

        {profile.colorTones && (
          <div className="tone-legend">
            <span className="legend-item t1">1성 (높고 평평하게 ā)</span>
            <span className="legend-item t2">2성 (올려 읽기 á)</span>
            <span className="legend-item t3">3성 (내렸다 올리기 ǎ)</span>
            <span className="legend-item t4">4성 (내려 읽기 à)</span>
          </div>
        )}
      </div>

      {/* The Live Profile Card */}
      <article
        className="profile-card"
        style={{ borderColor: theme.cardBorder }}
      >
        <div
          className="profile-card-header"
          style={{ background: theme.headerBg, color: theme.headerText }}
        >
          <div
            className="card-avatar-frame"
            style={{ backgroundColor: profile.avatarBg }}
          >
            {profile.avatarDataUrl ? (
              <img
                src={profile.avatarDataUrl}
                alt="내가 그린 캐릭터 프로필"
                className="card-avatar-img"
              />
            ) : (
              <div className="card-avatar-empty">
                <span>🎨</span>
                <small>왼쪽에서 캐릭터를 그려보세요</small>
              </div>
            )}
          </div>

          <div className="card-header-info">
            <span className="card-subtitle-pill pinyin-font">
              {profile.subtitlePinyin || 'Wǒ de Zhōngwén zìwǒ jièshào'}
            </span>
            <h2 className="card-name-pinyin pinyin-font">
              {profile.namePinyin || 'Nǐ hǎo!'}
            </h2>
            {profile.showHanzi && profile.nameHanzi && (
              <div className="card-name-hanzi">{profile.nameHanzi}</div>
            )}
            {profile.nameKorean && (
              <div className="card-name-korean">
                한국어 이름: {profile.nameKorean}
              </div>
            )}
          </div>
        </div>

        <div className="profile-card-body">
          {profile.items.length === 0 ? (
            <p className="card-empty-msg">
              자기소개 항목을 추가하면 여기에 한어병음 프로필 카드가 완성돼요.
            </p>
          ) : (
            <div className="card-items-grid">
              {profile.items.map((item) => {
                const isSpeaking = activeSpeechId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`card-item ${isSpeaking ? 'speaking' : ''}`}
                    style={{
                      borderColor: isSpeaking ? theme.accent : theme.cardBorder,
                      backgroundColor: isSpeaking ? theme.accentSoft : '#f8fafc',
                    }}
                  >
                    <div className="card-item-top">
                      <span
                        className="card-item-badge"
                        style={{
                          backgroundColor: theme.badgeBg,
                          color: theme.badgeText,
                        }}
                      >
                        {item.emoji} {item.label}
                      </span>
                      {speechAvailable && (
                        <button
                          type="button"
                          className="card-speak-btn"
                          onClick={() => handleSpeakSingle(item)}
                          title="이 문장 발음 듣기"
                        >
                          <Volume2 size={15} />
                        </button>
                      )}
                    </div>

                    <div className="card-item-pinyin pinyin-font">
                      <PinyinText
                        text={item.pinyin}
                        colorTones={profile.colorTones}
                      />
                    </div>
                    {profile.showHanzi && item.hanzi && (
                      <div className="card-item-hanzi">{item.hanzi}</div>
                    )}
                    {item.korean && (
                      <div className="card-item-korean">{item.korean}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </article>

      {/* Action Footer */}
      <div className="preview-actions-bar">
        {speechAvailable && (
          <div className="speech-controls">
            <button
              type="button"
              className={`btn-secondary ${isPlayingAll ? 'active' : ''}`}
              onClick={handlePlayAll}
              disabled={profile.items.length === 0}
            >
              {isPlayingAll ? <StopIcon size={16} /> : <Play size={16} />}
              {isPlayingAll ? '발음 정지' : '전체 자기소개 듣기'}
            </button>
            <div className="speed-pills">
              <button
                type="button"
                className={`speed-btn ${speechRate === 0.75 ? 'active' : ''}`}
                onClick={() => setSpeechRate(0.75)}
              >
                천천히 0.75x
              </button>
              <button
                type="button"
                className={`speed-btn ${speechRate === 0.95 ? 'active' : ''}`}
                onClick={() => setSpeechRate(0.95)}
              >
                보통 1.0x
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          className="btn-primary"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download size={16} />
          {downloading ? '이미지 생성 중...' : '프로필 카드 이미지 저장 (PNG)'}
        </button>
      </div>
    </div>
  );
};
