// others
import { DEFAULT_MASK_GROUP_NAME } from '../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { handleGroupNodes } from '../handleGroupNodes/handleGroupNodes';

export const handleUseNodesAsMask = (state: TDesignState, groupId: string): void => {
  handleGroupNodes(state, groupId);

  const page = getActivePage(state);
  const group = page.nodes[groupId];

  if (group?.type === NodeType.group) {
    group.name = DEFAULT_MASK_GROUP_NAME;
    page.nodes[group.childIds[0]].isMask = true;
  }
};
