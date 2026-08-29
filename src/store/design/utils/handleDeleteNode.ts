// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';

// utils
import { getActivePage } from './getActivePage';

export const handleDeleteNode = (state: TDesignState, id: string): void => {
  const page = getActivePage(state);
  const node = page.nodes[id];

  if (node) {
    delete page.nodes[id];
    page.rootOrder = page.rootOrder.filter((nodeId) => nodeId !== id);
    page.selectedIds = page.selectedIds.filter((nodeId) => nodeId !== id);

    if (node.type === NodeType.text && node.pathId) {
      handleDeleteNode(state, node.pathId);
    }

    Object.values(page.nodes)
      .filter((candidate) => candidate.type === NodeType.text && candidate.pathId === id)
      .forEach((textNode) => handleDeleteNode(state, textNode.id));
  }
};
