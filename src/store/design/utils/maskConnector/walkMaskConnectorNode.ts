// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TMaskConnectorLine } from '../../types';

// utils
import { addMaskConnectorLine } from './addMaskConnectorLine';
import { getMaskConnectorOwnRole } from './getMaskConnectorOwnRole';
import { getMaskConnectorPassthroughForChildren } from './getMaskConnectorPassthroughForChildren';

export const walkMaskConnectorNode = (
  nodes: Record<string, TSceneNode>,
  infoById: Map<string, TMaskConnectorLine[]>,
  nodeId: string,
  passthrough: TMaskConnectorLine[],
): void => {
  const node = nodes[nodeId];

  if (node) {
    passthrough.forEach((line) => addMaskConnectorLine(infoById, nodeId, line));

    if (node.type === NodeType.group) {
      const maskIndex = node.childIds.findIndex((childId) => nodes[childId]?.isMask);
      const passthroughForChildren = getMaskConnectorPassthroughForChildren(passthrough);

      node.childIds.forEach((childId, index) => {
        const ownRole = getMaskConnectorOwnRole(maskIndex, index);
        const ownLines: TMaskConnectorLine[] = ownRole ? [{ depthOffset: 0, role: ownRole }] : [];

        walkMaskConnectorNode(nodes, infoById, childId, [...ownLines, ...passthroughForChildren]);
      });
    }
  }
};
