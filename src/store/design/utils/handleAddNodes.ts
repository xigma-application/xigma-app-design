// types
import { TAddNodesPayload, TDesignState } from '../types';

// utils
import { getActivePage } from './getActivePage';

export const handleAddNodes = (state: TDesignState, { nodes, rootIds }: TAddNodesPayload): void => {
  const page = getActivePage(state);

  nodes.forEach((node) => {
    page.nodes[node.id] = node;
  });

  page.rootOrder.push(...rootIds);
};
