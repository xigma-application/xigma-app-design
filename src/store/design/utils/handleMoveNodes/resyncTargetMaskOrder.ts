// types
import { NodeType } from 'types/design/enums';
import { TDesignPage } from '../../types';

// utils
import { getMaskChildOrder } from '../handleUseNodesAsMask/getMaskChildOrder';

export const resyncTargetMaskOrder = (page: TDesignPage, targetParentId: string | null): void => {
  const parent = targetParentId ? page.nodes[targetParentId] : null;

  if (parent && parent.type === NodeType.mask) {
    parent.childIds = getMaskChildOrder(parent.childIds, page.nodes);
  }
};
