// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TPoint } from 'types/canvas';
import { TSceneNode, TTextNode, TVectorTangent } from 'types/design/types';
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

// utils
import { getGlyph } from '../getGlyph';
import { getGlyphAdvance } from '../getGlyphAdvance';
import { getGlyphEdgeLoops } from './getGlyphEdgeLoops/getGlyphEdgeLoops';
import { getTextPathSampler } from '../pathSampler/getTextPathSampler';
import { getVisibleCurvedContent } from '../getVisibleCurvedContent';
import { loadInterFont } from './loadInterFont';
import { rotatePoint } from 'utils/math/rotatePoint';

const ORIGIN: TPoint = { x: 0, y: 0 };

const rotateTangent = (tangent: TVectorTangent, angleDegrees: number): TVectorTangent =>
  tangent && rotatePoint(tangent, ORIGIN, angleDegrees);

const transformPoint = (point: TPoint, angleDegrees: number, anchor: TPoint): TPoint => {
  const rotated = rotatePoint(point, ORIGIN, angleDegrees);

  return { x: anchor.x + rotated.x, y: anchor.y + rotated.y };
};

const transformEdge = (edge: TLoopEdge, angleDegrees: number, anchor: TPoint): TLoopEdge => ({
  end: transformPoint(edge.end, angleDegrees, anchor),
  start: transformPoint(edge.start, angleDegrees, anchor),
  tangentEnd: rotateTangent(edge.tangentEnd, angleDegrees),
  tangentStart: rotateTangent(edge.tangentStart, angleDegrees),
});

export const getCurvedTextGlyphContours = async (
  atlas: TGlyphAtlasJson,
  node: TTextNode,
  pathNode: TSceneNode | undefined,
): Promise<TLoopEdge[][][]> => {
  const font = await loadInterFont();
  const { content, fontSize, height, pathFlip, pathStartOffset, width, x, y } = node;
  const sampler = getTextPathSampler({ height, rotation: node.rotation, width, x, y }, pathNode, new Map());
  const visibleContent = getVisibleCurvedContent(
    atlas,
    content,
    fontSize,
    pathStartOffset ?? 0,
    pathFlip ?? false,
    sampler.totalLength,
    sampler.isClosed,
  );
  const center: TPoint = { x: x + width / 2, y: y + height / 2 };
  const direction = pathFlip ? -1 : 1;
  let cumulativeLength = (pathStartOffset ?? 0) * sampler.totalLength;

  return visibleContent.split('').flatMap((char) => {
    const charCode = char.charCodeAt(0);
    const glyph = getGlyph(atlas, charCode);
    const advance = getGlyphAdvance(atlas, charCode, fontSize);

    if (glyph) {
      const sample = sampler.sampleAtLength(cumulativeLength);
      const anchor: TPoint = { x: center.x + sample.x, y: center.y + sample.y };
      const angleDegrees = sample.angleDegrees + (pathFlip ? 180 : 0);
      const path = font.charToGlyph(char).getPath(0, 0, fontSize);
      const contours = getGlyphEdgeLoops(path).map((edges) => edges.map((edge) => transformEdge(edge, angleDegrees, anchor)));

      cumulativeLength += direction * advance;

      return [contours];
    }

    cumulativeLength += direction * advance;
    return [];
  });
};
