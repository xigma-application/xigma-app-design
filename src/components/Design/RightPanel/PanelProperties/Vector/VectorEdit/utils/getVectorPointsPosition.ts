// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getNodePositionInParent } from 'store/design/utils/getNodePositionInParent';

type TParentBox = Parameters<typeof getNodePositionInParent>[1];

export type TVectorPointsPosition = TPoint & { origin: TPoint; parent: TParentBox | undefined };

export const getVectorPointsPosition = (node: TVectorNode, points: TPoint[], nodes: Record<string, TSceneNode>): TVectorPointsPosition => {
  const parentNode = node.parentId ? nodes[node.parentId] : undefined;
  const parent = parentNode && 'width' in parentNode ? parentNode : undefined;
  const origin = { x: Math.min(...points.map((point) => point.x)), y: Math.min(...points.map((point) => point.y)) };

  return { ...(parent ? getNodePositionInParent(origin, parent) : origin), origin, parent };
};
