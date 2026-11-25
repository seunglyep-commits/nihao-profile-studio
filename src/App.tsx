import { useEffect, useState } from 'react';
import { Palette, RotateCcw, Sparkles, UserCheck } from 'lucide-react';
import { CharacterCanvas } from './components/CharacterCanvas';
import { IntroItemsEditor } from './components/IntroItemsEditor';
import { ProfileCardPreview } from './components/ProfileCardPreview';
import { DEFAULT_PROFILE_STATE } from './data/presets';
import { CardThemeId, IntroItem, ProfileState } from './types/profile';

const STORAGE_KEY = 'nihao_profile_studio_v1';

function loadInitialProfile(): ProfileState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE_STATE;
    const parsed = JSON.parse(raw) as Partial<ProfileState>;
    return {
      ...DEFAULT_PROFILE_STATE,
      ...parsed,
      items: Array.isArray(parsed.items)
        ? parsed.items
        : DEFAULT_PROFILE_STATE.items,
    };
  } catch {
    return DEFAULT_PROFILE_STATE;
  }
}

export function App() {
  const [profile, setProfile] = useState<ProfileState>(loadInitialProfile);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [resetVersion, setResetVersion] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota errors
    }
  }, [profile]);

  const handleUpdateField = (
    field: 'namePinyin' | 'nameHanzi' | 'nameKorean',
    value: string,
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = (item: Omit<IntroItem, 'id'>) => {
    const newItem: IntroItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setProfile((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleUpdateItem = (id: string, patch: Partial<IntroItem>) => {
    setProfile((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  };

  const handleMoveItem = (index: number, direction: -1 | 1) => {
    setProfile((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.items.length) return prev;
      const copy = [...prev.items];
      const [moved] = copy.splice(index, 1);
      copy.splice(target, 0, moved);
      return { ...prev, items: copy };
    });
  };

  const handleDeleteItem = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleChangeTheme = (theme: CardThemeId) => {
    setProfile((prev) => ({ ...prev, theme }));
  };

  const handleToggleSetting = (key: 'showHanzi' | 'colorTones') => {
    setProfile((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(DEFAULT_PROFILE_STATE);
    setResetVersion((v) => v + 1);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-block">
            <div className="brand-badge pinyin-font">Nǐ hǎo!</div>
            <div>
              <h1 className="app-title">중국어 자기소개 프로필 스튜디오</h1>
              <p className="app-subtitle">
                나만의 캐릭터를 직접 그리고, <strong>한어병음(Pinyin)</strong> 중심의 자기소개 카드를 만들어 보세요.
              </p>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={handleReset}
              title="처음 기본 상태로 되돌리기"
            >
              <RotateCcw size={15} />
              초기화
            </button>
          </div>
        </div>

        <div className="mobile-tab-bar">
          <button
            type="button"
            className={`mobile-tab ${mobileTab === 'edit' ? 'active' : ''}`}
            onClick={() => setMobileTab('edit')}
          >
            <Palette size={16} /> 그리기 & 작성
          </button>
          <button
            type="button"
            className={`mobile-tab ${mobileTab === 'preview' ? 'active' : ''}`}
            onClick={() => setMobileTab('preview')}
          >
            <UserCheck size={16} /> 완성 프로필 카드
          </button>
        </div>
      </header>

      <main className="workspace">
        <section
          className={`editor-column ${mobileTab === 'edit' ? 'mobile-visible' : 'mobile-hidden'}`}
        >
          <div className="studio-section">
            <div className="section-title-bar">
              <div className="step-badge">STEP 1</div>
              <div>
                <h2>내 캐릭터 그리기</h2>
                <p className="helper-note">
                  펜, 채우기, 도형, 도우미 스탬프로 나를 표현하는 캐릭터를 그려보세요.
                </p>
              </div>
            </div>

            <CharacterCanvas
              key={resetVersion}
              initialDataUrl={profile.avatarDataUrl}
              avatarBg={profile.avatarBg}
              onChangeAvatar={(dataUrl) =>
                setProfile((prev) => ({ ...prev, avatarDataUrl: dataUrl }))
              }
              onChangeBg={(bg) =>
                setProfile((prev) => ({ ...prev, avatarBg: bg }))
              }
            />
          </div>

          <div className="studio-section">
            <div className="section-title-bar">
              <div className="step-badge">STEP 2</div>
              <div>
                <h2>중국어 자기소개 작성 (한어병음 중심)</h2>
                <p className="helper-note">
                  숫자(예: <code>ni3 hao3</code>)를 입력하거나 성조 자판을 눌러 쉽게 병음을 적고 항목을 추가하세요.
                </p>
              </div>
            </div>

            <IntroItemsEditor
              namePinyin={profile.namePinyin}
              nameHanzi={profile.nameHanzi}
              nameKorean={profile.nameKorean}
              items={profile.items}
              showHanzi={profile.showHanzi}
              colorTones={profile.colorTones}
              onUpdateProfileField={handleUpdateField}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onMoveItem={handleMoveItem}
              onDeleteItem={handleDeleteItem}
            />
          </div>
        </section>

        <aside
          className={`preview-column ${mobileTab === 'preview' ? 'mobile-visible' : 'mobile-hidden'}`}
        >
          <div className="preview-sticky">
            <div className="section-title-bar compact">
              <Sparkles size={18} className="accent-icon" />
              <h2>완성된 중국어 자기소개 카드</h2>
            </div>
            <ProfileCardPreview
              profile={profile}
              onChangeTheme={handleChangeTheme}
              onToggleSetting={handleToggleSetting}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
