// types
import { TGradientStop } from 'types/design/paint/types';

// utils
import { hexToRgbFloat } from 'utils/canvas/hexToRgbFloat';
import { rgbToHex } from 'utils/color/rgbToHex';

type TColorSegment = { c0: [number, number, number]; c1: [number, number, number]; lower: number; o0: number; o1: number; upper: number };

const getColorSegments = (stops: TGradientStop[]): TColorSegment[] => {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const segments: TColorSegment[] = [];

  if (first.position > 0) {
    segments.push({
      c0: hexToRgbFloat(first.color),
      c1: hexToRgbFloat(first.color),
      lower: 0,
      o0: first.opacity,
      o1: first.opacity,
      upper: first.position,
    });
  }

  for (let index = 0; index < sorted.length - 1; index += 1) {
    segments.push({
      c0: hexToRgbFloat(sorted[index].color),
      c1: hexToRgbFloat(sorted[index + 1].color),
      lower: sorted[index].position,
      o0: sorted[index].opacity,
      o1: sorted[index + 1].opacity,
      upper: sorted[index + 1].position,
    });
  }

  if (last.position < 1) {
    segments.push({
      c0: hexToRgbFloat(last.color),
      c1: hexToRgbFloat(last.color),
      lower: last.position,
      o0: last.opacity,
      o1: last.opacity,
      upper: 1,
    });
  }

  return segments;
};

const lerp = (v0: number, v1: number, t: number): number => v0 + (v1 - v0) * t;

export const getSvgGradientColorAt = (stops: TGradientStop[], position: number): { color: string; opacity: number } => {
  const segments = getColorSegments(stops);
  const clamped = Math.min(1, Math.max(0, position));
  const segment = segments.find((candidate) => clamped <= candidate.upper) as TColorSegment;
  const span = segment.upper - segment.lower || 1;
  const t = (clamped - segment.lower) / span;
  const [r, g, b] = segment.c0.map((channel, index) => lerp(channel, segment.c1[index], t) * 255);

  return { color: rgbToHex({ b, g, r }), opacity: lerp(segment.o0, segment.o1, t) / 100 };
};
