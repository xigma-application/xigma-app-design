// others
import { DEFAULT_BOOLEAN_NAME } from '../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TBooleanNodesPayload } from './handleBooleanNodes';
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { getNodePaintStyle } from '../getNodePaintStyle';
import { isBooleanOperandNode } from '../nodeHierarchy/isBooleanOperandNode';
import { syncAutoLayoutChildren } from '../autoLayout/syncAutoLayoutChildren/syncAutoLayoutChildren';
import { syncGroupBounds } from '../syncGroupBounds';

export const handleConvertGroupToBoolean = (state: TDesignState, { groupId, operation }: TBooleanNodesPayload): void => {
  const page = getActivePage(state);
  const group = page.nodes[groupId];

  if (group?.type === NodeType.group) {
    const { childIds, ...groupFields } = group;
    const children = childIds.map((childId) => page.nodes[childId]).filter(Boolean);

    if (children.length > 0 && children.every((child) => isBooleanOperandNode(child, page.nodes))) {
      page.nodes[groupId] = {
        ...groupFields,
        ...getNodePaintStyle(page.nodes[childIds[childIds.length - 1]]),
        booleanOperation: operation,
        childIds,
        name: DEFAULT_BOOLEAN_NAME[operation],
        type: NodeType.boolean,
      };
      page.selectedIds = [groupId];
      syncGroupBounds(state, groupId);
      syncAutoLayoutChildren(state, group.parentId);
    }
  }
};
