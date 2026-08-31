// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TPoint } from 'types/canvas';
import { TTextPathSampler } from './pathSampler/types';

// utils
import { getCurvedTunnelPath } from './getCurvedTunnelPath/getCurvedTunnelPath';

const polyline = (points: TPoint[]): TPoint[] => points.slice(0, -1).flatMap((point, index) => [point, points[index + 1]]);

export const getCurvedSelectionOutlinePoints = (
  atlas: TGlyphAtlasJson,
  content: string,
  fontSize: number,
  pathCenter: TPoint,
  startOffset: number,
  flip: boolean,
  sampler: TTextPathSampler,
  lineHeight: number,
  start: number,
  end: number,
): TPoint[] => {
  const { bottom, top } = getCurvedTunnelPath(atlas, content, fontSize, pathCenter, startOffset, flip, sampler, lineHeight, start, end);

  if (top.length !== 0) {
    const includeCaps = Math.hypot(top[top.length - 1].x - top[0].x, top[top.length - 1].y - top[0].y) >= lineHeight;
    const segments = [...polyline(top), ...polyline(bottom)];

    if (includeCaps) {
      segments.push(top[0], bottom[0], top[top.length - 1], bottom[bottom.length - 1]);
    }

    return segments;
  }

  return [];
};
