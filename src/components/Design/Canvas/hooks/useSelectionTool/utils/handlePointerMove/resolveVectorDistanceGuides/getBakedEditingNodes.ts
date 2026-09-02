// types
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';

export const getBakedEditingNodes = (nodes: Record<string, TSceneNode>, editingNodeIds: string[]): TVectorNode[] =>
  editingNodeIds
    .map((id) => getVectorEditingNode(nodes, id))
    .filter((node): node is TVectorNode => Boolean(node))
    .map((node) => ({ ...node, ...bakeVectorNodeRotation(node) }));
