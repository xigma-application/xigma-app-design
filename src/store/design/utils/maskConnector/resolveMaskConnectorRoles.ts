// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TMaskConnectorInfo, TMaskConnectorLine } from '../../types';

// utils
import { getChangedNodes } from '../getChangedNodes';
import { walkMaskConnectorNode } from './walkMaskConnectorNode';

type TNodesById = Record<string, TSceneNode>;

let memo: { infoById: Map<string, TMaskConnectorInfo>; nodes: TNodesById } | null = null;

const buildRoles = (nodes: TNodesById): Map<string, TMaskConnectorInfo> => {
  const infoById = new Map<string, TMaskConnectorLine[]>();

  Object.values(nodes).forEach((node) => {
    if (!node.parentId || !nodes[node.parentId]) {
      walkMaskConnectorNode(nodes, infoById, node.id, []);
    }
  });

  return infoById;
};

const isGroupLike = (node: TSceneNode): boolean => node.type === NodeType.group || node.type === NodeType.mask;

const isUnaffectedByChanges = (previous: TNodesById, nodes: TNodesById): boolean => {
  const changed = getChangedNodes(previous, nodes);

  return !changed.all && !changed.nodes.some(isGroupLike);
};

const rebuildRoles = (nodes: TNodesById): Map<string, TMaskConnectorInfo> => {
  const infoById = buildRoles(nodes);
  memo = { infoById, nodes };

  return infoById;
};

export const resolveMaskConnectorRoles = (nodes: TNodesById): Map<string, TMaskConnectorInfo> => {
  if (!memo || (memo.nodes !== nodes && !isUnaffectedByChanges(memo.nodes, nodes))) {
    return rebuildRoles(nodes);
  }

  memo = { infoById: memo.infoById, nodes };
  return memo.infoById;
};
