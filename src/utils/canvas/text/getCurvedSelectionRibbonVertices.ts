// types
import { TEllipseArcLengthSample, TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getCurvedSelectionEdges } from './getCurvedSelectionEdges';
import { getQuadVertices } from '../drawThickOutline';

export const getCurvedSelectionRibbonVertices = (
  atlas: TGlyphAtlasJson,
  content: string,
  fontSize: number,
  ellipseWidth: number,
  ellipseHeight: number,
  ellipseCenter: TPoint,
  startOffset: number,
  flip: boolean,
  arcLengthTable: TEllipseArcLengthSample[],
  lineHeight: number,
  start: number,
  end: number,
): number[] => {
  const edges = getCurvedSelectionEdges(
    atlas,
    content,
    fontSize,
    ellipseWidth,
    ellipseHeight,
    ellipseCenter,
    startOffset,
    flip,
    arcLengthTable,
    lineHeight,
    start,
    end,
  );

  return edges.slice(0, -1).flatMap((edge, index) => {
    const next = edges[index + 1];

    return getQuadVertices(edge.top.x, edge.top.y, next.top.x, next.top.y, next.bottom.x, next.bottom.y, edge.bottom.x, edge.bottom.y);
  });
};
