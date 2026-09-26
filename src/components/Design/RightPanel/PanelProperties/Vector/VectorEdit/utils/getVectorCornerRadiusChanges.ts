// others
import { CORNER_RADIUS_MAX, CORNER_RADIUS_MIN } from '../../../Common/AppearanceSection/CornerRadius/constants';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { clamp } from 'utils/math/clamp';
import { getVectorVertexCornerRadius } from 'utils/canvas/vectorNetwork/roundVectorCorners/getVectorVertexCornerRadius';

export const getVectorCornerRadiusChanges = (
  node: TVectorNode,
  vertexIds: string[],
  getValue: TFunc<[number], number>,
): Partial<TVectorNode> => {
  const getRadius = (radius: number): number => clamp(getValue(radius), CORNER_RADIUS_MIN, CORNER_RADIUS_MAX);

  return vertexIds.length > 0
    ? {
        cornerRadiusByVertexId: {
          ...node.cornerRadiusByVertexId,
          ...Object.fromEntries(vertexIds.map((vertexId) => [vertexId, getRadius(getVectorVertexCornerRadius(node, vertexId))])),
        },
      }
    : { cornerRadius: getRadius(node.cornerRadius ?? 0), cornerRadiusByVertexId: undefined };
};
