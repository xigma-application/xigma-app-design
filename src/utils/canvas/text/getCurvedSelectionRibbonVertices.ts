// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TPoint } from 'types/canvas';
import { TTextPathSampler } from './pathSampler/types';

// utils
import { getCurvedTunnelPath } from './getCurvedTunnelPath/getCurvedTunnelPath';
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
  const { bottom, top } = getCurvedTunnelPath(atlas, content, fontSize, pathCenter, startOffset, flip, sampler, lineHeight, start, end);

  return top.slice(0, -1).flatMap((point, index) => {
    const nextTop = top[index + 1];
    const nextBottom = bottom[index + 1];

    return getQuadVertices(point.x, point.y, nextTop.x, nextTop.y, nextBottom.x, nextBottom.y, bottom[index].x, bottom[index].y);
  });
};
