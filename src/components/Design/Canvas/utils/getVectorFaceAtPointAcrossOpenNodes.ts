// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TVectorFace } from 'utils/canvas/vectorNetwork/deriveVectorFaces';

// utils
import { bakeVectorNodeRotation } from './bakeVectorNodeRotation';
import { getVectorEditingNode } from './getVectorEditingNode';
import { getVectorFaceAtPoint } from './getVectorFaceAtPoint';

export const getVectorFaceAtPointAcrossOpenNodes = (
  point: TPoint,
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
): { face: TVectorFace; node: TVectorNode } | null => {
  const hit = vectorEditingNodeIds
    .map((nodeId) => getVectorEditingNode(nodes, nodeId))
    .filter((node): node is TVectorNode => node !== null)
    .map((node) => {
      const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
      const face = getVectorFaceAtPoint(point, bakedNode);

      return face ? { face, node } : null;
    })
    .find((candidate) => candidate !== null);

  return hit ?? null;
};
