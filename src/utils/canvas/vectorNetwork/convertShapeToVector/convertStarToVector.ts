// types
import { NodeType } from 'types/design/enums';
import { TStarNode, TVectorNode } from 'types/design/types';

// utils
import { buildClosedVectorLoop } from './utils/buildClosedVectorLoop';
import { getFillDataForClosedLoop } from './utils/getFillDataForClosedLoop';
import { getMaxStarCornerRadius } from 'utils/canvas/cornerRadius/star/getMaxStarCornerRadius';
import { getStarPoints } from 'utils/canvas/shapes/getStarPoints';
import { flipPoint } from 'utils/math/flipPoint';

const SHAPE_VECTOR_STROKE_WIDTH = 0;

export const convertStarToVector = (node: TStarNode): TVectorNode => {
  const center = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const sharpVertices = getStarPoints(node, node.points, node.ratio).map((point) => flipPoint(point, center, node.flipX, node.flipY));
  const radius = Math.min(Math.max(node.cornerRadius ?? 0, 0), getMaxStarCornerRadius(node, node.points, node.ratio));
  const { segments, vertices } = buildClosedVectorLoop(sharpVertices, radius);
  const base: TVectorNode = {
    fillColor: node.fill,
    filledFaceKeys: [],
    id: node.id,
    name: node.name,
    parentId: node.parentId,
    rotation: node.rotation,
    segments,
    strokeColor: node.fill,
    strokeWidth: SHAPE_VECTOR_STROKE_WIDTH,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices,
  };

  return { ...base, ...getFillDataForClosedLoop(base, node.fill) };
};
