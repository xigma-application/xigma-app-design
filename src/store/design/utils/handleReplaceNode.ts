// types
import { TDesignState } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { cascadeDeleteGroupChildren } from './handleDeleteNode/cascadeDeleteGroupChildren';
import { getActivePage } from './getActivePage';

export const handleReplaceNode = (state: TDesignState, payload: { id: string; node: TSceneNode }): void => {
  const page = getActivePage(state);
  const previousNode = page.nodes[payload.id];

  if (previousNode) {
    page.nodes[payload.id] = payload.node;
    cascadeDeleteGroupChildren(state, previousNode);
  }
};
