import { nanoid } from '@reduxjs/toolkit';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TTextNode } from 'types/design/types';

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
  } else if (clone.type === NodeType.text && clone.pathId) {
    clone.pathId = nodeIdMap[clone.pathId] ?? null;
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
  const clonedNodes = subtreeNodes.map((node) => remapClonedNode(node, nodeIdMap, offsetX, offsetY));
  const boundGuideIds = new Set(
    clonedNodes
      .filter((node): node is TTextNode => node.type === NodeType.text && Boolean(node.pathId))
      .map((node) => node.pathId as string),
  );

  return {
    nodes: clonedNodes,
    rootIds: [...originalRootIds.map((id) => nodeIdMap[id]), ...boundGuideIds],
  };
};
