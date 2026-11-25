import { CARD_THEMES } from '../data/presets';
import { ProfileState } from '../types/profile';
import { TONE_COLORS, tokenizePinyin } from './pinyin';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function exportProfileCardPng(profile: ProfileState): Promise<void> {
  const theme = CARD_THEMES[profile.theme];
  const width = 920;
  const padding = 44;
  const contentWidth = width - padding * 2;
  const itemTextWidth = contentWidth - 48;

  // Measure height dynamically using a temporary canvas context
  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d');
  if (!mCtx) return;

  mCtx.font = '800 24px "Nunito", "Noto Sans KR", sans-serif';
  const itemLayouts = profile.items.map((item) => {
    mCtx.font = '800 24px "Nunito", "Noto Sans KR", sans-serif';
    const pinyinLines = wrapTextLines(mCtx, item.pinyin || '...', itemTextWidth);
    const hasHanzi = profile.showHanzi && item.hanzi.trim().length > 0;
    const hasKorean = item.korean.trim().length > 0;

    let boxH = 54 + pinyinLines.length * 32;
    if (hasHanzi) boxH += 24;
    if (hasKorean) boxH += 26;
    boxH += 18;
    return { item, pinyinLines, hasHanzi, hasKorean, boxH };
  });

  const headerH = 270;
  const itemsTotalH = itemLayouts.reduce((sum, l) => sum + l.boxH + 16, 0);
  const footerH = 54;
  const height = Math.max(520, padding + headerH + 28 + itemsTotalH + footerH);

  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // Outer soft background
  ctx.fillStyle = theme.accentSoft;
  ctx.fillRect(0, 0, width, height);

  // Card Container
  roundRect(ctx, 20, 20, width - 40, height - 40, 28);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = theme.cardBorder;
  ctx.stroke();

  // Header Banner
  ctx.save();
  roundRect(ctx, 20, 20, width - 40, headerH, 28);
  ctx.clip();
  const grad = ctx.createLinearGradient(20, 20, width - 20, 20 + headerH);
  grad.addColorStop(0, theme.accent);
  grad.addColorStop(1, theme.badgeText);
  ctx.fillStyle = grad;
  ctx.fillRect(20, 20, width - 40, headerH);
  ctx.restore();

  // Avatar frame on left of header
  const avatarSize = 196;
  const avatarX = padding + 14;
  const avatarY = 56;

  roundRect(ctx, avatarX - 6, avatarY - 6, avatarSize + 12, avatarSize + 12, 28);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  roundRect(ctx, avatarX, avatarY, avatarSize, avatarSize, 22);
  ctx.fillStyle = profile.avatarBg;
  ctx.fill();

  if (profile.avatarDataUrl) {
    try {
      const img = await loadImage(profile.avatarDataUrl);
      ctx.save();
      roundRect(ctx, avatarX, avatarY, avatarSize, avatarSize, 22);
      ctx.clip();
      ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    } catch {
      // Fallback if image failed
    }
  } else {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 18px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('My Character', avatarX + avatarSize / 2, avatarY + avatarSize / 2);
    ctx.textAlign = 'left';
  }

  // Name & Title on right of header
  const textX = avatarX + avatarSize + 36;
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  roundRect(ctx, textX, 66, 330, 32, 16);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 15px "Nunito", "Noto Sans KR", sans-serif';
  ctx.fillText(
    profile.subtitlePinyin || 'Wǒ de Zhōngwén zìwǒ jièshào',
    textX + 14,
    87,
  );

  ctx.font = '900 44px "Nunito", "Noto Sans KR", sans-serif';
  ctx.fillText(profile.namePinyin || 'Nǐ hǎo!', textX, 148);

  if (profile.showHanzi && profile.nameHanzi.trim()) {
    ctx.font = '700 22px "Noto Sans SC", "Noto Sans KR", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(profile.nameHanzi, textX, 186);
  }

  if (profile.nameKorean.trim()) {
    ctx.font = '600 18px "Noto Sans KR", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fillText(
      `한국어 이름: ${profile.nameKorean}`,
      textX,
      profile.showHanzi && profile.nameHanzi.trim() ? 220 : 190,
    );
  }

  // Items
  let curY = 20 + headerH + 26;
  for (const layout of itemLayouts) {
    const { item, pinyinLines, hasHanzi, hasKorean, boxH } = layout;

    roundRect(ctx, padding, curY, contentWidth, boxH, 18);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = theme.cardBorder;
    ctx.stroke();

    // Label pill
    ctx.font = '700 14px "Noto Sans KR", sans-serif';
    const labelText = `${item.emoji} ${item.label}`;
    const pillW = Math.max(82, ctx.measureText(labelText).width + 22);
    roundRect(ctx, padding + 18, curY + 14, pillW, 28, 14);
    ctx.fillStyle = theme.badgeBg;
    ctx.fill();

    ctx.fillStyle = theme.badgeText;
    ctx.fillText(labelText, padding + 29, curY + 33);

    // Pinyin lines (Primary)
    let lineY = curY + 72;
    ctx.font = '800 24px "Nunito", "Noto Sans KR", sans-serif';
    for (const line of pinyinLines) {
      if (profile.colorTones) {
        let cursorX = padding + 20;
        const tokens = tokenizePinyin(line);
        for (const token of tokens) {
          ctx.fillStyle = token.isWord ? TONE_COLORS[token.tone] : '#334155';
          ctx.fillText(token.text, cursorX, lineY);
          cursorX += ctx.measureText(token.text).width;
        }
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillText(line, padding + 20, lineY);
      }
      lineY += 32;
    }

    if (hasHanzi) {
      ctx.font = '500 16px "Noto Sans SC", "Noto Sans KR", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(item.hanzi, padding + 20, lineY);
      lineY += 24;
    }

    if (hasKorean) {
      ctx.font = '600 15px "Noto Sans KR", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(item.korean, padding + 20, lineY + 2);
    }

    curY += boxH + 16;
  }

  // Footer
  ctx.font = '600 13px "Nunito", "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText('Nǐ hǎo! 중국어 자기소개 프로필 스튜디오', width / 2, height - 34);

  const link = document.createElement('a');
  const safeName = (profile.namePinyin || 'profile')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();
  link.download = `nihao-profile-${safeName}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
