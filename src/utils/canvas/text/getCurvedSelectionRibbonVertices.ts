// types
import { TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextPathSampler } from './pathSampler/types';

// utils
import { getCurvedSelectionEdges } from './getCurvedSelectionEdges';
import { getQuadVertices } from '../getQuadVertices';

export const getCurvedSelectionRibbonVertices = (
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
): number[] => {
  const edges = getCurvedSelectionEdges(atlas, content, fontSize, pathCenter, startOffset, flip, sampler, lineHeight, start, end);

  return edges.slice(0, -1).flatMap((edge, index) => {
    const next = edges[index + 1];
    return getQuadVertices(edge.top.x, edge.top.y, next.top.x, next.top.y, next.bottom.x, next.bottom.y, edge.bottom.x, edge.bottom.y);
  });
};
