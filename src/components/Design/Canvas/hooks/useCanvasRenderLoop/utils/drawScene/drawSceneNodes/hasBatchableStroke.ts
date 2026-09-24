// types
import { StrokeSides } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getFaceGroupBlendMode } from '../drawVectorNodeOrTextPathGuide/drawSceneVectorNode/getFaceGroupBlendMode';
import { getRingMode } from '../getBoxStrokeRingPolygons/getRingMode';
import { getStrokeDashPattern } from 'utils/design/stroke/getStrokeDashPattern';
import { getUniformRingPolygons } from '../getBoxStrokeRingPolygons/getUniformRingPolygons';

const hasSolidPaintStroke = (node: TRectangleNode): boolean =>
  !(node.strokeColor && node.strokeWidth) &&
  Array.isArray(node.strokes) &&
  node.strokes.length > 0 &&
  node.strokes.every((paint) => paint.type === 'solid') &&
  !getFaceGroupBlendMode(node.strokes);

const hasSimpleRing = (node: TRectangleNode, width: number): boolean =>
  (node.strokeSides ?? StrokeSides.all) === StrokeSides.all &&
  getRingMode(node, getStrokeDashPattern(node)) === 'uniform' &&
  width * 2 < Math.min(node.width, node.height);

export const hasBatchableStroke = (node: TRectangleNode): boolean => {
  const width = node.strokeWidth ?? 0;

  if (width > 0 && hasSolidPaintStroke(node) && hasSimpleRing(node, width)) {
    const [outer, inner] = getUniformRingPolygons(node);
    return outer.length === inner.length;
  }

  return false;
};
