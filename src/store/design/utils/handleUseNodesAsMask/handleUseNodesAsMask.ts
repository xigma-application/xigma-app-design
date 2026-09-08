// others
import { DEFAULT_MASK_GROUP_NAME } from '../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { getMaskChildOrder } from './getMaskChildOrder';
import { handleGroupNodes } from '../handleGroupNodes/handleGroupNodes';
import { syncGroupBounds } from '../syncGroupBounds';

export const handleUseNodesAsMask = (state: TDesignState, groupId: string): void => {
  handleGroupNodes(state, groupId);

  const page = getActivePage(state);
  const group = page.nodes[groupId];

  if (group?.type === NodeType.group) {
    const childIds = getMaskChildOrder(group.childIds, page.nodes);

    page.nodes[groupId] = { ...group, childIds, name: DEFAULT_MASK_GROUP_NAME, type: NodeType.mask };
    page.selectedIds = [childIds[childIds.length - 1]];
    syncGroupBounds(state, groupId);
  }
};
