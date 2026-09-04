// others
import { TOOL_DEFAULT_NODE_NAMES } from '../constants';

// types
import { TDesignState } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getActivePage } from './getActivePage';
import { getNextNodeName } from './getNextNodeName';

export const handleAddNode = (state: TDesignState, node: TSceneNode): void => {
  const page = getActivePage(state);

  if (TOOL_DEFAULT_NODE_NAMES.has(node.name)) {
    node.name = getNextNodeName(page.nodes, node.type, node.name);
  }

  page.nodes[node.id] = node;
  page.rootOrder.push(node.id);
};
