// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getActivePage } from './getActivePage';
import { getNextFrameName } from './getNextFrameName';
import { getNextSectionName } from './getNextSectionName';

export const handleAddNode = (state: TDesignState, node: TSceneNode): void => {
  const page = getActivePage(state);

  if (node.type === NodeType.frame) {
    node.name = getNextFrameName(page.nodes);
  }

  if (node.type === NodeType.section) {
    node.name = getNextSectionName(page.nodes);
  }

  page.nodes[node.id] = node;
  page.rootOrder.push(node.id);
};
