// types
import { TEllipseArcLengthSample, TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getCurvedSelectionEdges } from './getCurvedSelectionEdges';

export const getCurvedSelectionOutlinePoints = (
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
): TPoint[] => {
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

  if (edges.length > 0) {
    return [...edges.map((edge) => edge.top), ...edges.map((edge) => edge.bottom).reverse()];
  }

  return [];
};
