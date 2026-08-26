// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TVectorFace } from 'utils/canvas/vectorNetwork/deriveVectorFaces';

// utils
import { bakeVectorNodeRotation } from './bakeVectorNodeRotation';
import { getVectorEditingNode } from './getVectorEditingNode';
import { getVectorFacesInRect } from './getVectorFacesInRect';

export const getVectorFacesInRectAcrossOpenNodes = (
  rect: TDraftRect,
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
): { faces: TVectorFace[]; node: TVectorNode }[] =>
  vectorEditingNodeIds
    .map((nodeId) => getVectorEditingNode(nodes, nodeId))
    .filter((node): node is TVectorNode => node !== null)
    .map((node) => {
      const bakedNode = node.rotation ? { ...node, ...bakeVectorNodeRotation(node) } : node;

      return { faces: getVectorFacesInRect(bakedNode, rect), node };
    })
    .filter((candidate) => candidate.faces.length > 0);
