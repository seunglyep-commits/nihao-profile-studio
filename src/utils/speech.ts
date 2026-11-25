export interface SpeechItem {
  id: string;
  hanzi?: string;
  pinyin: string;
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

function pickChineseVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase() === 'zh-cn') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('zh')) ||
    null
  );
}

export function speakChineseItem(
  item: SpeechItem,
  rate = 0.9,
  onEnd?: () => void,
): boolean {
  if (!isSpeechSupported()) return false;
  window.speechSynthesis.cancel();

  const text = item.hanzi?.trim() ? item.hanzi.trim() : item.pinyin.trim();
  if (!text) return false;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate;
  const voice = pickChineseVoice();
  if (voice) {
    utterance.voice = voice;
  }
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
  return true;
}

export function speakChineseSequence(
  items: SpeechItem[],
  rate = 0.9,
  onItemStart?: (id: string) => void,
  onFinish?: () => void,
): () => void {
  if (!isSpeechSupported() || items.length === 0) {
    onFinish?.();
    return () => {};
  }

  let cancelled = false;
  window.speechSynthesis.cancel();
  const voice = pickChineseVoice();

  const speakNext = (index: number) => {
    if (cancelled || index >= items.length) {
      if (!cancelled) onFinish?.();
      return;
    }

    const item = items[index];
    const text = item.hanzi?.trim() ? item.hanzi.trim() : item.pinyin.trim();
    if (!text) {
      speakNext(index + 1);
      return;
    }

    onItemStart?.(item.id);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = rate;
    if (voice) {
      utterance.voice = voice;
    }
    utterance.onend = () => {
      if (!cancelled) speakNext(index + 1);
    };
    utterance.onerror = () => {
      if (!cancelled) speakNext(index + 1);
    };
    window.speechSynthesis.speak(utterance);
  };

  speakNext(0);

  return () => {
    cancelled = true;
    window.speechSynthesis.cancel();
  };
}
