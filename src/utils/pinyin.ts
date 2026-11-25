const TONE_MAP: Record<string, [string, string, string, string, string]> = {
  a: ['a', 'ā', 'á', 'ǎ', 'à'],
  o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
  e: ['e', 'ē', 'é', 'ě', 'è'],
  i: ['i', 'ī', 'í', 'ǐ', 'ì'],
  u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
  ü: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
  A: ['A', 'Ā', 'Á', 'Ǎ', 'À'],
  O: ['O', 'Ō', 'Ó', 'Ǒ', 'Ò'],
  E: ['E', 'Ē', 'É', 'Ě', 'È'],
  I: ['I', 'Ī', 'Í', 'Ǐ', 'Ì'],
  U: ['U', 'Ū', 'Ú', 'Ǔ', 'Ù'],
  Ü: ['Ü', 'Ǖ', 'Ǘ', 'Ǚ', 'Ǜ'],
};

export interface ToneVowelGroup {
  base: string;
  tones: [string, string, string, string];
}

export const TONE_KEYPAD_GROUPS: ToneVowelGroup[] = [
  { base: 'a', tones: ['ā', 'á', 'ǎ', 'à'] },
  { base: 'o', tones: ['ō', 'ó', 'ǒ', 'ò'] },
  { base: 'e', tones: ['ē', 'é', 'ě', 'è'] },
  { base: 'i', tones: ['ī', 'í', 'ǐ', 'ì'] },
  { base: 'u', tones: ['ū', 'ú', 'ǔ', 'ù'] },
  { base: 'ü', tones: ['ǖ', 'ǘ', 'ǚ', 'ǜ'] },
];

const CHAR_TO_TONE: Record<string, 1 | 2 | 3 | 4> = {};
for (const [, variants] of Object.entries(TONE_MAP)) {
  CHAR_TO_TONE[variants[1]] = 1;
  CHAR_TO_TONE[variants[2]] = 2;
  CHAR_TO_TONE[variants[3]] = 3;
  CHAR_TO_TONE[variants[4]] = 4;
}

export const TONE_COLORS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: '#475569',
  1: '#e11d48',
  2: '#d97706',
  3: '#059669',
  4: '#2563eb',
};

function applyToneToSyllable(rawSyllable: string, toneNum: number): string {
  const normalized = rawSyllable
    .replace(/u:/g, 'ü')
    .replace(/U:/g, 'Ü')
    .replace(/v/g, 'ü')
    .replace(/V/g, 'Ü');

  if (toneNum === 5 || toneNum === 0) {
    return normalized;
  }

  const lower = normalized.toLowerCase();
  let targetIndex = -1;

  const aIdx = lower.indexOf('a');
  const eIdx = lower.indexOf('e');
  if (aIdx !== -1) {
    targetIndex = aIdx;
  } else if (eIdx !== -1) {
    targetIndex = eIdx;
  } else {
    const ouIdx = lower.indexOf('ou');
    if (ouIdx !== -1) {
      targetIndex = ouIdx;
    } else {
      for (let i = lower.length - 1; i >= 0; i--) {
        if ('iouü'.includes(lower[i])) {
          targetIndex = i;
          break;
        }
      }
    }
  }

  if (targetIndex === -1) {
    return `${normalized}${toneNum}`;
  }

  const targetChar = normalized[targetIndex];
  const mapped = TONE_MAP[targetChar]?.[toneNum];
  if (!mapped) {
    return `${normalized}${toneNum}`;
  }

  return (
    normalized.slice(0, targetIndex) +
    mapped +
    normalized.slice(targetIndex + 1)
  );
}

/**
 * Converts numbered pinyin like "ni3 hao3" or "lv4" into toned pinyin ("nǐ hǎo", "lǜ").
 */
export function convertPinyinNumbersToMarks(input: string): string {
  return input.replace(/([a-zA-ZüÜ:]+)([1-5])/g, (_match, syl: string, digit: string) => {
    // Only convert trailing part if multiple letters precede; handle single syllable directly
    return applyToneToSyllable(syl, Number(digit));
  });
}

export function getToneOfToken(token: string): 0 | 1 | 2 | 3 | 4 {
  for (const ch of token) {
    const tone = CHAR_TO_TONE[ch];
    if (tone) return tone;
  }
  return 0;
}

export interface PinyinToken {
  text: string;
  tone: 0 | 1 | 2 | 3 | 4;
  isWord: boolean;
}

/**
 * Splits a pinyin string into word tokens and punctuation/whitespace tokens with detected tone.
 */
export function tokenizePinyin(text: string): PinyinToken[] {
  const parts = text.split(/(\s+|[.,!?;:'"()[\]—-]+)/);
  return parts
    .filter((part) => part.length > 0)
    .map((part) => {
      const isWord = /[a-zA-ZüÜāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜĀÁǍÀŌÓǑÒĒÉĚÈĪÍǏÌŪÚǓÙǕǗǙǛ]/.test(
        part,
      );
      return {
        text: part,
        tone: isWord ? getToneOfToken(part) : 0,
        isWord,
      };
    });
}
