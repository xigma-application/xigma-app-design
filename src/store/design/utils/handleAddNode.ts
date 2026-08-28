// types
import { TDesignState } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getActivePage } from './getActivePage';

export const handleAddNode = (state: TDesignState, node: TSceneNode): void => {
  const page = getActivePage(state);

  page.nodes[node.id] = node;
  page.rootOrder.push(node.id);
};
