// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';

export const handleToggleFrameClipContent = (state: TDesignState, id: string): void => {
  const node = getActivePage(state).nodes[id];

  if (node && node.type === NodeType.frame) {
    node.clipContent = !node.clipContent;
  }
};
