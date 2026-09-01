// types
import { TSceneNode } from 'types/design/types';
import { TMaskConnectorInfo, TMaskConnectorLine } from '../../types';

// utils
import { walkMaskConnectorNode } from './walkMaskConnectorNode';

export const resolveMaskConnectorRoles = (nodes: Record<string, TSceneNode>): Map<string, TMaskConnectorInfo> => {
  const infoById = new Map<string, TMaskConnectorLine[]>();

  Object.values(nodes).forEach((node) => {
    if (!node.parentId || !nodes[node.parentId]) {
      walkMaskConnectorNode(nodes, infoById, node.id, []);
    }
  });

  return infoById;
};
