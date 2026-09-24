// others
import { DEFAULT_BOOLEAN_NAME } from '../../constants';

// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { getBooleanStyleFromNode } from './getBooleanStyleFromNode';
import { handleGroupNodes } from '../handleGroupNodes/handleGroupNodes';
import { isBooleanOperandNode } from '../nodeHierarchy/isBooleanOperandNode';
import { syncAutoLayoutChildren } from '../autoLayout/syncAutoLayoutChildren/syncAutoLayoutChildren';
import { syncGroupBounds } from '../syncGroupBounds';

export type TBooleanNodesPayload = { groupId: string; operation: BooleanOperation };

export const handleBooleanNodes = (state: TDesignState, { groupId, operation }: TBooleanNodesPayload): void => {
  const page = getActivePage(state);
  const selectedNodes = page.selectedIds.map((id) => page.nodes[id]).filter(Boolean);
  const [selectedNode] = selectedNodes;

  if (selectedNodes.length === 1 && selectedNode.type === NodeType.boolean) {
    const isDefaultName = Object.values(DEFAULT_BOOLEAN_NAME).includes(selectedNode.name);

    page.nodes[selectedNode.id] = {
      ...selectedNode,
      booleanOperation: operation,
      name: isDefaultName ? DEFAULT_BOOLEAN_NAME[operation] : selectedNode.name,
    };
  } else if (selectedNodes.length > 0 && selectedNodes.every((node) => isBooleanOperandNode(node, page.nodes))) {
    handleGroupNodes(state, groupId);
    const group = page.nodes[groupId];

    if (group?.type === NodeType.group) {
      const { childIds, ...groupFields } = group;

      page.nodes[groupId] = {
        ...groupFields,
        ...getBooleanStyleFromNode(page.nodes[childIds[childIds.length - 1]]),
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
