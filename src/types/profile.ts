export interface IntroItem {
  id: string;
  label: string;
  emoji: string;
  pinyin: string;
  hanzi: string;
  korean: string;
}

export type CardThemeId = 'coral' | 'jade' | 'sunflower' | 'lavender' | 'ink';

export interface ProfileState {
  namePinyin: string;
  nameHanzi: string;
  nameKorean: string;
  subtitlePinyin: string;
  items: IntroItem[];
  theme: CardThemeId;
  showHanzi: boolean;
  colorTones: boolean;
  avatarBg: string;
  avatarDataUrl: string | null;
}

export type DrawTool =
  | 'pen'
  | 'marker'
  | 'eraser'
  | 'fill'
  | 'line'
  | 'circle'
  | 'rect';

export interface IntroPreset {
  category: string;
  emoji: string;
  pinyin: string;
  hanzi: string;
  korean: string;
}
