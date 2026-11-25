import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Circle,
  Eraser,
  Highlighter,
  Minus,
  PaintBucket,
  PenTool,
  Redo2,
  Sparkles,
  Square,
  Trash2,
  Undo2,
} from 'lucide-react';
import { AVATAR_BG_COLORS, DRAW_PALETTE } from '../data/presets';
import { DrawTool } from '../types/profile';

interface CharacterCanvasProps {
  initialDataUrl: string | null;
  avatarBg: string;
  onChangeAvatar: (dataUrl: string | null) => void;
  onChangeBg: (bg: string) => void;
}

const CANVAS_SIZE = 480;
const MAX_HISTORY = 30;

function hexToRgba(hex: string): [number, number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 255];
}

function floodFillCanvas(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillHex: string,
) {
  const x0 = Math.floor(startX);
  const y0 = Math.floor(startY);
  if (x0 < 0 || y0 < 0 || x0 >= CANVAS_SIZE || y0 >= CANVAS_SIZE) return;

  const imgData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const data = imgData.data;
  const startOffset = (y0 * CANVAS_SIZE + x0) * 4;
  const targetR = data[startOffset];
  const targetG = data[startOffset + 1];
  const targetB = data[startOffset + 2];
  const targetA = data[startOffset + 3];

  const [fillR, fillG, fillB, fillA] = hexToRgba(fillHex);

  if (
    Math.abs(targetR - fillR) < 4 &&
    Math.abs(targetG - fillG) < 4 &&
    Math.abs(targetB - fillB) < 4 &&
    Math.abs(targetA - fillA) < 4
  ) {
    return;
  }

  const tolerance = 32;
  const visited = new Uint8Array(CANVAS_SIZE * CANVAS_SIZE);
  const stack: number[] = [x0, y0];

  const matchesTarget = (idx: number) => {
    const o = idx * 4;
    return (
      Math.abs(data[o] - targetR) <= tolerance &&
      Math.abs(data[o + 1] - targetG) <= tolerance &&
      Math.abs(data[o + 2] - targetB) <= tolerance &&
      Math.abs(data[o + 3] - targetA) <= tolerance
    );
  };

  while (stack.length > 0) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    const idx = y * CANVAS_SIZE + x;
    if (visited[idx] || !matchesTarget(idx)) continue;

    visited[idx] = 1;
    const o = idx * 4;
    data[o] = fillR;
    data[o + 1] = fillG;
    data[o + 2] = fillB;
    data[o + 3] = fillA;

    if (x > 0) stack.push(x - 1, y);
    if (x < CANVAS_SIZE - 1) stack.push(x + 1, y);
    if (y > 0) stack.push(x, y - 1);
    if (y < CANVAS_SIZE - 1) stack.push(x, y + 1);
  }

  ctx.putImageData(imgData, 0, 0);
}

export const CharacterCanvas: React.FC<CharacterCanvasProps> = ({
  initialDataUrl,
  avatarBg,
  onChangeAvatar,
  onChangeBg,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<DrawTool>('pen');
  const [color, setColor] = useState('#1e293b');
  const [brushSize, setBrushSize] = useState(6);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [historyLen, setHistoryLen] = useState(1);

  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(0);
  const isDrawingRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initializedRef = useRef(false);

  const emitImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChangeAvatar(canvas.toDataURL('image/png'));
  }, [onChangeAvatar]);

  const pushSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const snapshot = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
    trimmed.push(snapshot);
    if (trimmed.length > MAX_HISTORY) {
      trimmed.shift();
    }
    historyRef.current = trimmed;
    historyIndexRef.current = trimmed.length - 1;
    setHistoryIdx(historyIndexRef.current);
    setHistoryLen(trimmed.length);
    emitImage();
  }, [emitImage]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const initEmpty = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      const blank = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      historyRef.current = [blank];
      historyIndexRef.current = 0;
      setHistoryIdx(0);
      setHistoryLen(1);
    };

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        const snap = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        historyRef.current = [snap];
        historyIndexRef.current = 0;
        setHistoryIdx(0);
        setHistoryLen(1);
      };
      img.onerror = initEmpty;
      img.src = initialDataUrl;
    } else {
      initEmpty();
    }
  }, [initialDataUrl]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE,
    };
  };

  const applyStrokeStyle = (
    ctx: CanvasRenderingContext2D,
    activeTool: DrawTool,
  ) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = brushSize * 1.8;
    } else if (activeTool === 'marker') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.42;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * 2.2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
  };

  const drawShape = (
    ctx: CanvasRenderingContext2D,
    activeTool: DrawTool,
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) => {
    ctx.save();
    applyStrokeStyle(ctx, activeTool);
    ctx.beginPath();
    if (activeTool === 'line') {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
    } else if (activeTool === 'rect') {
      ctx.rect(from.x, from.y, to.x - from.x, to.y - from.y);
    } else if (activeTool === 'circle') {
      const rx = Math.abs(to.x - from.x) / 2;
      const ry = Math.abs(to.y - from.y) / 2;
      const cx = (from.x + to.x) / 2;
      const cy = (from.y + to.y) / 2;
      ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
    }
    ctx.stroke();
    ctx.restore();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getCanvasPoint(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    if (tool === 'fill') {
      floodFillCanvas(ctx, pt.x, pt.y, color);
      pushSnapshot();
      return;
    }

    isDrawingRef.current = true;
    startPointRef.current = pt;
    lastPointRef.current = pt;

    if (tool === 'pen' || tool === 'marker' || tool === 'eraser') {
      ctx.save();
      applyStrokeStyle(ctx, tool);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color;
      ctx.fill();
      ctx.restore();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const pt = getCanvasPoint(e);

    if (tool === 'pen' || tool === 'marker' || tool === 'eraser') {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.save();
      applyStrokeStyle(ctx, tool);
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      ctx.restore();
      lastPointRef.current = pt;
    } else {
      const pCanvas = previewCanvasRef.current;
      const pCtx = pCanvas?.getContext('2d');
      if (!pCtx) return;
      pCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawShape(pCtx, tool, startPointRef.current, pt);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const pt = getCanvasPoint(e);

    const pCtx = previewCanvasRef.current?.getContext('2d');
    if (pCtx) {
      pCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    if (tool === 'line' || tool === 'circle' || tool === 'rect') {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        drawShape(ctx, tool, startPointRef.current, pt);
      }
    }

    pushSnapshot();
  };

  const handleUndo = () => {
    if (historyIndexRef.current <= 0) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    historyIndexRef.current -= 1;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setHistoryIdx(historyIndexRef.current);
    emitImage();
  };

  const handleRedo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    historyIndexRef.current += 1;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setHistoryIdx(historyIndexRef.current);
    emitImage();
  };

  const handleClear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    pushSnapshot();
  };

  const stampGuide = (
    kind: 'face' | 'smile' | 'cat' | 'glasses' | 'sample' | 'heart',
  ) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (kind === 'face') {
      // Head & shoulders guide
      ctx.fillStyle = '#fde6d8';
      ctx.beginPath();
      ctx.arc(240, 220, 118, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(240, 440, 120, Math.PI, 0);
      ctx.fillStyle = '#60a5fa';
      ctx.fill();
      ctx.stroke();
    } else if (kind === 'smile') {
      // Cute eyes, blush & smile
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(195, 210, 10, 0, Math.PI * 2);
      ctx.arc(285, 210, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.ellipse(172, 238, 16, 9, 0, 0, Math.PI * 2);
      ctx.ellipse(308, 238, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(240, 235, 28, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    } else if (kind === 'cat') {
      // Cat ears on top of head
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(148, 145);
      ctx.lineTo(132, 68);
      ctx.lineTo(205, 110);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(332, 145);
      ctx.lineTo(348, 68);
      ctx.lineTo(275, 110);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (kind === 'glasses') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(192, 210, 32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(288, 210, 32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(224, 210);
      ctx.lineTo(256, 210);
      ctx.stroke();
    } else if (kind === 'heart') {
      ctx.fillStyle = '#fb7185';
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(385, 115);
      ctx.bezierCurveTo(385, 92, 350, 92, 350, 115);
      ctx.bezierCurveTo(350, 136, 385, 152, 385, 166);
      ctx.bezierCurveTo(385, 152, 420, 136, 420, 115);
      ctx.bezierCurveTo(420, 92, 385, 92, 385, 115);
      ctx.fill();
      ctx.stroke();
    } else if (kind === 'sample') {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      // Shoulders
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(240, 445, 128, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Hair back
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(240, 205, 130, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Face
      ctx.fillStyle = '#fde6d8';
      ctx.beginPath();
      ctx.arc(240, 224, 110, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bangs
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(240, 190, 108, Math.PI * 1.05, Math.PI * 1.95);
      ctx.quadraticCurveTo(280, 165, 240, 178);
      ctx.quadraticCurveTo(200, 165, 135, 195);
      ctx.fill();
      ctx.stroke();

      // Eyes & Blush & Smile
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(196, 226, 9, 0, Math.PI * 2);
      ctx.arc(284, 226, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.ellipse(174, 250, 15, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(306, 250, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(240, 246, 24, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }

    ctx.restore();
    pushSnapshot();
  };

  const tools: { id: DrawTool; label: string; icon: React.ReactNode }[] = [
    { id: 'pen', label: '펜', icon: <PenTool size={16} /> },
    { id: 'marker', label: '마커', icon: <Highlighter size={16} /> },
    { id: 'eraser', label: '지우개', icon: <Eraser size={16} /> },
    { id: 'fill', label: '채우기', icon: <PaintBucket size={16} /> },
    { id: 'line', label: '직선', icon: <Minus size={16} /> },
    { id: 'circle', label: '원', icon: <Circle size={16} /> },
    { id: 'rect', label: '사각형', icon: <Square size={16} /> },
  ];

  return (
    <div className="canvas-studio">
      <div className="canvas-toolbar">
        <div className="tool-group" role="group" aria-label="그리기 도구">
          {tools.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tool-btn ${tool === t.id ? 'active' : ''}`}
              onClick={() => setTool(t.id)}
              title={t.label}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="history-group">
          <button
            type="button"
            className="icon-btn"
            onClick={handleUndo}
            disabled={historyIdx <= 0}
            title="실행 취소"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={handleRedo}
            disabled={historyIdx >= historyLen - 1}
            title="다시 실행"
          >
            <Redo2 size={16} />
          </button>
          <button
            type="button"
            className="icon-btn danger"
            onClick={handleClear}
            title="캔버스 비우기"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="canvas-main-row">
        <div
          className="canvas-stage"
          style={{ backgroundColor: avatarBg }}
          aria-label="캐릭터 그리기 캔버스"
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="draw-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
          <canvas
            ref={previewCanvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="preview-canvas"
          />
        </div>

        <div className="canvas-side-controls">
          <div className="control-block">
            <span className="control-label">선 굵기 ({brushSize}px)</span>
            <div className="size-row">
              {[3, 6, 12, 20].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`size-dot-btn ${brushSize === s ? 'active' : ''}`}
                  onClick={() => setBrushSize(s)}
                  title={`${s}px`}
                >
                  <span
                    className="size-dot"
                    style={{ width: Math.min(s + 4, 20), height: Math.min(s + 4, 20) }}
                  />
                </button>
              ))}
              <input
                type="range"
                min={2}
                max={28}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                aria-label="선 굵기 슬라이더"
                className="size-slider"
              />
            </div>
          </div>

          <div className="control-block">
            <span className="control-label">그리기 색상</span>
            <div className="palette-grid">
              {DRAW_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`swatch-btn ${color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    setColor(c);
                    if (tool === 'eraser') setTool('pen');
                  }}
                  title={c}
                />
              ))}
              <label className="custom-color-label" title="직접 색상 고르기">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    if (tool === 'eraser') setTool('pen');
                  }}
                />
                <span>+</span>
              </label>
            </div>
          </div>

          <div className="control-block">
            <span className="control-label">프로필 배경색</span>
            <div className="bg-row">
              {AVATAR_BG_COLORS.map((bg) => (
                <button
                  key={bg.value}
                  type="button"
                  className={`bg-swatch ${avatarBg === bg.value ? 'active' : ''}`}
                  style={{ backgroundColor: bg.value }}
                  onClick={() => onChangeBg(bg.value)}
                  title={bg.label}
                />
              ))}
            </div>
          </div>

          <div className="control-block">
            <span className="control-label">
              <Sparkles size={13} /> 캐릭터 도우미 스탬프
            </span>
            <div className="stamp-grid">
              <button
                type="button"
                className="stamp-btn"
                onClick={() => stampGuide('face')}
              >
                😊 얼굴 틀
              </button>
              <button
                type="button"
                className="stamp-btn"
                onClick={() => stampGuide('smile')}
              >
                😄 표정
              </button>
              <button
                type="button"
                className="stamp-btn"
                onClick={() => stampGuide('cat')}
              >
                🐱 고양이 귀
              </button>
              <button
                type="button"
                className="stamp-btn"
                onClick={() => stampGuide('glasses')}
              >
                👓 안경
              </button>
              <button
                type="button"
                className="stamp-btn"
                onClick={() => stampGuide('heart')}
              >
                💖 하트
              </button>
              <button
                type="button"
                className="stamp-btn accent"
                onClick={() => stampGuide('sample')}
              >
                ✨ 예시 캐릭터
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
