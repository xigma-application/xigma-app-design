// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TVectorFace } from 'utils/canvas/vectorNetwork/deriveVectorFaces';

// utils
import { bakeVectorNodeRotation } from './bakeVectorNodeRotation';
import { getVectorEditingNode } from './getVectorEditingNode';
import { getVectorFacesOnPath } from './getVectorFacesOnPath';

export const getVectorFacesOnPathAcrossOpenNodes = (
  path: TPoint[],
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
): { faces: TVectorFace[]; node: TVectorNode }[] =>
  vectorEditingNodeIds
    .map((nodeId) => getVectorEditingNode(nodes, nodeId))
    .filter((node): node is TVectorNode => node !== null)
    .map((node) => {
      const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };

      return { faces: getVectorFacesOnPath(bakedNode, path), node };
    })
    .filter((candidate) => candidate.faces.length > 0);
