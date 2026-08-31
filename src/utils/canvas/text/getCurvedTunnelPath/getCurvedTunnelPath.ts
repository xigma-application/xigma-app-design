// constant
import { MAX_CURVED_SELECTION_SPAN_DEGREES } from 'constant/canvas';

// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TPoint } from 'types/canvas';
import { TTextPathSampler } from '../pathSampler/types';

// utils
import { buildTunnelCenterline } from './buildTunnelCenterline';
import { getCurvedGlyphBoundaries } from '../getCurvedGlyphBoundaries';
import { offsetBoundary } from './offsetBoundary';

export type TCurvedTunnelPath = {
  bottom: TPoint[];
  top: TPoint[];
};

export const getCurvedTunnelPath = (
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
): TCurvedTunnelPath => {
  const boundaries = getCurvedGlyphBoundaries(atlas, content, fontSize, startOffset, flip, sampler.totalLength);
  const clampedStart = Math.max(0, Math.min(start, content.length));
  const clampedEnd = Math.max(0, Math.min(end, content.length));

  if (clampedEnd <= clampedStart) {
    return { bottom: [], top: [] };
  }

  const direction = flip ? -1 : 1;
  const startLength = boundaries[clampedStart];
  const rawEndLength = boundaries[clampedEnd];
  const maxSpan = (MAX_CURVED_SELECTION_SPAN_DEGREES / 360) * sampler.totalLength;
  const endLength = direction > 0 ? Math.min(rawEndLength, startLength + maxSpan) : Math.max(rawEndLength, startLength - maxSpan);
  const centerline = buildTunnelCenterline(sampler, pathCenter, startLength, endLength);

  if (centerline.length < 2) {
    return { bottom: [], top: [] };
  }

  const baseRatio = atlas.common.base / atlas.common.lineHeight;

  return {
    bottom: offsetBoundary(centerline, lineHeight * (1 - baseRatio)),
    top: offsetBoundary(centerline, -lineHeight * baseRatio),
  };
};
