// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TVectorFace } from 'utils/canvas/vectorNetwork/deriveVectorFaces';

// utils
import { bakeVectorNodeRotation } from './bakeVectorNodeRotation';
import { getPolygonArea } from './getPolygonArea';
import { getVectorEditingNode } from './getVectorEditingNode';
import { getVectorFaceAtPoint } from './getVectorFaceAtPoint';

type TVectorFaceHit = { face: TVectorFace; node: TVectorNode };

export const getVectorFaceAtPointAcrossOpenNodes = (
  point: TPoint,
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
): TVectorFaceHit | null =>
  vectorEditingNodeIds
    .map((nodeId) => getVectorEditingNode(nodes, nodeId))
    .filter((node): node is TVectorNode => node !== null)
    .map((node) => {
      const bakedNode = node.rotation ? { ...node, ...bakeVectorNodeRotation(node) } : node;
      const face = getVectorFaceAtPoint(point, bakedNode);

      return face ? { face, node } : null;
    })
    .filter((candidate): candidate is TVectorFaceHit => candidate !== null)
    .reduce<TVectorFaceHit | null>((smallest, candidate) => {
      if (!smallest || getPolygonArea(candidate.face.points) < getPolygonArea(smallest.face.points)) {
        return candidate;
      }

      return smallest;
    }, null);
