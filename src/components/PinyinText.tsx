import React from 'react';
import { TONE_COLORS, tokenizePinyin } from '../utils/pinyin';

interface PinyinTextProps {
  text: string;
  colorTones: boolean;
  className?: string;
}

export const PinyinText: React.FC<PinyinTextProps> = ({
  text,
  colorTones,
  className = '',
}) => {
  if (!colorTones) {
    return <span className={className}>{text}</span>;
  }

  const tokens = tokenizePinyin(text);
  return (
    <span className={className}>
      {tokens.map((token, idx) =>
        token.isWord ? (
          <span key={idx} style={{ color: TONE_COLORS[token.tone] }}>
            {token.text}
          </span>
        ) : (
          <React.Fragment key={idx}>{token.text}</React.Fragment>
        ),
      )}
    </span>
  );
};
