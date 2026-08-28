// types
import { TDesignState } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getActivePage } from './getActivePage';

export const handleReplaceNode = (state: TDesignState, payload: { id: string; node: TSceneNode }): void => {
  const page = getActivePage(state);

  if (page.nodes[payload.id]) {
    page.nodes[payload.id] = payload.node;
  }
};
