// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { buildClosedVectorLoop } from './utils/buildClosedVectorLoop';
import { getFillDataForClosedLoop } from './utils/getFillDataForClosedLoop';
import { getMaxCornerRadius } from 'utils/canvas/cornerRadius/getMaxCornerRadius';

const SHAPE_VECTOR_STROKE_WIDTH = 0;

const getRectangleCorners = (node: TRectangleNode): TPoint[] => [
  { x: node.x, y: node.y },
  { x: node.x + node.width, y: node.y },
  { x: node.x + node.width, y: node.y + node.height },
  { x: node.x, y: node.y + node.height },
];

export const convertRectangleToVector = (node: TRectangleNode): TVectorNode => {
  const radius = Math.min(Math.max(node.cornerRadius ?? 0, 0), getMaxCornerRadius(node));
  const { segments, vertices } = buildClosedVectorLoop(getRectangleCorners(node), radius);
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
