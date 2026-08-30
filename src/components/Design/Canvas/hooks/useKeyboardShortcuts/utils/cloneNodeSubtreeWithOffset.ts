import { nanoid } from '@reduxjs/toolkit';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { cloneNodeWithOffset } from './cloneNodeWithOffset';

export type TClonedSubtree = {
  nodes: TSceneNode[];
  rootIds: string[];
};

const remapClonedNode = (node: TSceneNode, nodeIdMap: Record<string, string>, offsetX: number, offsetY: number): TSceneNode => {
  const clone = { ...cloneNodeWithOffset(node, offsetX, offsetY), id: nodeIdMap[node.id] } as TSceneNode;

  clone.parentId = clone.parentId ? (nodeIdMap[clone.parentId] ?? null) : null;

  if (clone.type === NodeType.group) {
    clone.childIds = clone.childIds.map((childId) => nodeIdMap[childId] ?? childId);
  }

  return clone;
};

export const cloneNodeSubtreeWithOffset = (
  subtreeNodes: TSceneNode[],
  originalRootIds: string[],
  offsetX: number,
  offsetY: number,
): TClonedSubtree => {
  const nodeIdMap: Record<string, string> = Object.fromEntries(subtreeNodes.map((node) => [node.id, nanoid()]));

  return {
    nodes: subtreeNodes.map((node) => remapClonedNode(node, nodeIdMap, offsetX, offsetY)),
    rootIds: originalRootIds.map((id) => nodeIdMap[id]),
  };
};
