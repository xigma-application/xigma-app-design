import { current, isDraft } from '@reduxjs/toolkit';

// types
import { TDesignPage } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getGroupSubtreeNodes } from '../nodeHierarchy/getGroupSubtreeNodes';

export const relocateNodeSubtree = (sourcePage: TDesignPage, targetPage: TDesignPage, nodeId: string): void => {
  const nodesById = isDraft(sourcePage.nodes) ? current(sourcePage.nodes) : sourcePage.nodes;

  getGroupSubtreeNodes(nodesById[nodeId], nodesById).forEach((subtreeNode) => {
    const clone: TSceneNode = structuredClone(subtreeNode);

    if (clone.id === nodeId) {
      clone.parentId = null;
    }

    delete sourcePage.nodes[clone.id];
    targetPage.nodes[clone.id] = clone;
  });

  sourcePage.rootOrder = sourcePage.rootOrder.filter((id) => id !== nodeId);
  targetPage.rootOrder.push(nodeId);
};
