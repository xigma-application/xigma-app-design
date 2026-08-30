// types
import { TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextPathSampler } from './pathSampler/types';

// utils
import { getCurvedSelectionEdges } from './getCurvedSelectionEdges';

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
  const edges = getCurvedSelectionEdges(atlas, content, fontSize, pathCenter, startOffset, flip, sampler, lineHeight, start, end);

  if (edges.length < 2) {
    return [];
  }

  const first = edges[0];
  const last = edges[edges.length - 1];
  const includeCaps = Math.hypot(last.top.x - first.top.x, last.top.y - first.top.y) >= lineHeight;
  const segments: TPoint[] = [];

  for (let index = 0; index < edges.length - 1; index++) {
    segments.push(edges[index].top, edges[index + 1].top, edges[index].bottom, edges[index + 1].bottom);
  }

  if (includeCaps) {
    segments.push(first.top, first.bottom, last.top, last.bottom);
  }

  return segments;
};
