import { describe, expect, it } from 'vitest';
import {
  convertPinyinNumbersToMarks,
  getToneOfToken,
  tokenizePinyin,
} from './pinyin';

describe('convertPinyinNumbersToMarks', () => {
  it('converts standard numbered pinyin syllables', () => {
    expect(convertPinyinNumbersToMarks('ni3 hao3!')).toBe('nǐ hǎo!');
    expect(convertPinyinNumbersToMarks('Wo3 jiao4 Min3zhi4.')).toBe(
      'Wǒ jiào Mǐnzhì.',
    );
  });

  it('follows standard tone placement rules (a > e > ou > last vowel)', () => {
    expect(convertPinyinNumbersToMarks('hao3')).toBe('hǎo');
    expect(convertPinyinNumbersToMarks('xie4xie5')).toBe('xièxie');
    expect(convertPinyinNumbersToMarks('shou3')).toBe('shǒu');
    expect(convertPinyinNumbersToMarks('liu2')).toBe('liú');
    expect(convertPinyinNumbersToMarks('gui4')).toBe('guì');
    expect(convertPinyinNumbersToMarks('xue2')).toBe('xué');
  });

  it('supports v and u: for ü', () => {
    expect(convertPinyinNumbersToMarks('lv4')).toBe('lǜ');
    expect(convertPinyinNumbersToMarks('nv3')).toBe('nǚ');
    expect(convertPinyinNumbersToMarks('nu:3')).toBe('nǚ');
  });

  it('leaves standalone numbers untouched', () => {
    expect(convertPinyinNumbersToMarks('Wo3 jin1nian2 12 sui4.')).toBe(
      'Wǒ jīnnián 12 suì.',
    );
  });
});

describe('tone detection & tokenization', () => {
  it('detects tones accurately', () => {
    expect(getToneOfToken('mā')).toBe(1);
    expect(getToneOfToken('má')).toBe(2);
    expect(getToneOfToken('mǎ')).toBe(3);
    expect(getToneOfToken('mà')).toBe(4);
    expect(getToneOfToken('ma')).toBe(0);
  });

  it('tokenizes sentence preserving punctuation and tones', () => {
    const tokens = tokenizePinyin('Nǐ hǎo!');
    expect(tokens).toEqual([
      { text: 'Nǐ', tone: 3, isWord: true },
      { text: ' ', tone: 0, isWord: false },
      { text: 'hǎo', tone: 3, isWord: true },
      { text: '!', tone: 0, isWord: false },
    ]);
  });
});
