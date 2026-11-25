import { CardThemeId, IntroPreset, ProfileState } from '../types/profile';

export interface CardThemeConfig {
  id: CardThemeId;
  name: string;
  accent: string;
  accentSoft: string;
  headerBg: string;
  headerText: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
}

export const CARD_THEMES: Record<CardThemeId, CardThemeConfig> = {
  coral: {
    id: 'coral',
    name: '홍등 코랄',
    accent: '#e11d48',
    accentSoft: '#fff1f2',
    headerBg: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
    headerText: '#ffffff',
    cardBorder: '#fecdd3',
    badgeBg: '#ffe4e6',
    badgeText: '#be123c',
  },
  jade: {
    id: 'jade',
    name: '비취 민트',
    accent: '#0d9488',
    accentSoft: '#f0fdfa',
    headerBg: 'linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)',
    headerText: '#ffffff',
    cardBorder: '#99f6e4',
    badgeBg: '#ccfbf1',
    badgeText: '#0f766e',
  },
  sunflower: {
    id: 'sunflower',
    name: '황금 햇살',
    accent: '#d97706',
    accentSoft: '#fffbeb',
    headerBg: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    headerText: '#ffffff',
    cardBorder: '#fde68a',
    badgeBg: '#fef3c7',
    badgeText: '#b45309',
  },
  lavender: {
    id: 'lavender',
    name: '연꽃 보라',
    accent: '#7c3aed',
    accentSoft: '#f5f3ff',
    headerBg: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    headerText: '#ffffff',
    cardBorder: '#ddd6fe',
    badgeBg: '#ede9fe',
    badgeText: '#6d28d9',
  },
  ink: {
    id: 'ink',
    name: '먹빛 클래식',
    accent: '#1e293b',
    accentSoft: '#f8fafc',
    headerBg: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
    headerText: '#ffffff',
    cardBorder: '#cbd5e1',
    badgeBg: '#e2e8f0',
    badgeText: '#1e293b',
  },
};

export const AVATAR_BG_COLORS = [
  { label: '크림', value: '#fff8ec' },
  { label: '하양', value: '#ffffff' },
  { label: '복숭아', value: '#ffe8e5' },
  { label: '민트', value: '#e6faf5' },
  { label: '하늘', value: '#e8f4ff' },
  { label: '연보라', value: '#f2ecff' },
  { label: '레몬', value: '#fef9d9' },
];

export const DRAW_PALETTE = [
  '#1e293b', // 먹색
  '#ef4444', // 빨강
  '#f97316', // 주황
  '#facc15', // 노랑
  '#22c55e', // 초록
  '#06b6d4', // 청록
  '#3b82f6', // 파랑
  '#8b5cf6', // 보라
  '#ec4899', // 분홍
  '#92400e', // 갈색
  '#fde6d8', // 살구(피부)
  '#f5cba7', // 웜피부
  '#ffffff', // 하양
];

export const INTRO_PRESETS: IntroPreset[] = [
  {
    category: '인사',
    emoji: '👋',
    pinyin: 'Nǐ hǎo! Dàjiā hǎo!',
    hanzi: '你好！大家好！',
    korean: '안녕하세요! 여러분 안녕하세요!',
  },
  {
    category: '이름',
    emoji: '📛',
    pinyin: 'Wǒ jiào Mǐnzhì.',
    hanzi: '我叫敏智。',
    korean: '저는 민지라고 해요.',
  },
  {
    category: '국적/도시',
    emoji: '🇰🇷',
    pinyin: "Wǒ shì Hánguórén, zhù zài Shǒu'ěr.",
    hanzi: '我是韩国人，住在首尔。',
    korean: '저는 한국인이고 서울에 살아요.',
  },
  {
    category: '나이/학년',
    emoji: '🎂',
    pinyin: 'Wǒ jīnnián shíèr suì, shì xuésheng.',
    hanzi: '我今年十二岁，是学生。',
    korean: '저는 올해 12살이고 학생이에요.',
  },
  {
    category: '취미(음악)',
    emoji: '🎧',
    pinyin: 'Wǒ xǐhuan tīng yīnyuè.',
    hanzi: '我喜欢听音乐。',
    korean: '저는 음악 듣는 것을 좋아해요.',
  },
  {
    category: '취미(그림)',
    emoji: '🎨',
    pinyin: 'Wǒ xǐhuan huàhuàr.',
    hanzi: '我喜欢画画儿。',
    korean: '저는 그림 그리는 것을 좋아해요.',
  },
  {
    category: '취미(운동)',
    emoji: '🏀',
    pinyin: 'Wǒ xǐhuan dǎ lánqiú hé yóuyǒng.',
    hanzi: '我喜欢打篮球和游泳。',
    korean: '저는 농구와 수영을 좋아해요.',
  },
  {
    category: '좋아하는 음식',
    emoji: '🥟',
    pinyin: 'Wǒ zuì xǐhuan chī bāozi hé làmiàn.',
    hanzi: '我最喜欢吃包子和拉面。',
    korean: '저는 만두와 라면을 가장 좋아해요.',
  },
  {
    category: '좋아하는 색/동물',
    emoji: '🐼',
    pinyin: 'Wǒ xǐhuan xióngmāo, yě xǐhuan lán sè.',
    hanzi: '我喜欢熊猫，也喜欢蓝色。',
    korean: '저는 판다와 파란색을 좋아해요.',
  },
  {
    category: '성격',
    emoji: '✨',
    pinyin: 'Wǒ hěn kāilǎng, yě hěn yǒuhǎo.',
    hanzi: '我很开朗，也很友好。',
    korean: '저는 명랑하고 다정한 성격이에요.',
  },
  {
    category: '꿈',
    emoji: '🚀',
    pinyin: 'Wǒ de mèngxiǎng shì dāng yìshùjiā.',
    hanzi: '我的梦想是当艺术家。',
    korean: '제 꿈은 예술가가 되는 거예요.',
  },
  {
    category: '마무리 인사',
    emoji: '🤝',
    pinyin: 'Hěn gāoxìng rènshi nǐmen! Xièxie!',
    hanzi: '很高兴认识你们！谢谢！',
    korean: '만나서 반가워요! 감사합니다!',
  },
];

export const EMOJI_CHOICES = [
  '👋', '📛', '🇰🇷', '🎂', '🎧', '🎨', '🏀', '🥟', '🐼', '✨', '🚀', '🤝', '📚', '🎮', '🐶', '🌸',
];

export const DEFAULT_PROFILE_STATE: ProfileState = {
  namePinyin: 'Mǐnzhì',
  nameHanzi: '敏智',
  nameKorean: '김민지',
  subtitlePinyin: 'Wǒ de Zhōngwén zìwǒ jièshào',
  theme: 'coral',
  showHanzi: false,
  colorTones: true,
  avatarBg: '#fff8ec',
  avatarDataUrl: null,
  items: [
    {
      id: 'item-1',
      label: '인사',
      emoji: '👋',
      pinyin: 'Nǐ hǎo! Dàjiā hǎo!',
      hanzi: '你好！大家好！',
      korean: '안녕하세요! 여러분 안녕하세요!',
    },
    {
      id: 'item-2',
      label: '이름',
      emoji: '📛',
      pinyin: 'Wǒ jiào Mǐnzhì.',
      hanzi: '我叫敏智。',
      korean: '저는 민지라고 해요.',
    },
    {
      id: 'item-3',
      label: '취미',
      emoji: '🎨',
      pinyin: 'Wǒ xǐhuan huàhuàr hé tīng yīnyuè.',
      hanzi: '我喜欢画画儿和听音乐。',
      korean: '저는 그림 그리기와 음악 듣기를 좋아해요.',
    },
    {
      id: 'item-4',
      label: '마무리',
      emoji: '🤝',
      pinyin: 'Hěn gāoxìng rènshi nǐmen!',
      hanzi: '很高兴认识你们！',
      korean: '여러분과 알게 되어 반가워요!',
    },
  ],
};
