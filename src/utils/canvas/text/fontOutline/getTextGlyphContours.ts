// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode, TVectorTangent } from 'types/design/types';

// utils
import { flipTextPoint } from '../flipTextPoint';
import { getGlyphEdgeLoops } from './getGlyphEdgeLoops/getGlyphEdgeLoops';
import { getStraightTextGlyphPlacements } from './getStraightTextGlyphPlacements';
import { loadInterFont } from './loadInterFont';
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

const flipTangent = (tangent: TVectorTangent, node: TTextNode): TVectorTangent =>
  tangent && { x: node.flipX ? -tangent.x : tangent.x, y: node.flipY ? -tangent.y : tangent.y };

const flipEdge = (edge: TLoopEdge, node: TTextNode): TLoopEdge => ({
  end: flipTextPoint(edge.end, node),
  start: flipTextPoint(edge.start, node),
  tangentEnd: flipTangent(edge.tangentEnd, node),
  tangentStart: flipTangent(edge.tangentStart, node),
});

export const getTextGlyphContours = async (atlas: TGlyphAtlasJson, node: TTextNode): Promise<TLoopEdge[][][]> => {
  const font = await loadInterFont();
  const placements = getStraightTextGlyphPlacements(atlas, node);

  return placements.map(({ char, penX, baselineY }) => {
    const path = font.charToGlyph(char).getPath(penX, baselineY, node.fontSize);
    const contours = getGlyphEdgeLoops(path);

    return node.flipX || node.flipY ? contours.map((edges) => edges.map((edge) => flipEdge(edge, node))) : contours;
  });
};
