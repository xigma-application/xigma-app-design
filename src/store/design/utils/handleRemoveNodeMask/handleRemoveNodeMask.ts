// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';

export const handleRemoveNodeMask = (state: TDesignState, id: string): void => {
  const page = getActivePage(state);
  const node = page.nodes[id];
  const parent = node?.parentId ? page.nodes[node.parentId] : null;

  if (parent && parent.type === NodeType.mask) {
    if (parent.childIds[parent.childIds.length - 1] === id) {
      page.nodes[parent.id] = { ...parent, type: NodeType.group };
    }
  }
};
