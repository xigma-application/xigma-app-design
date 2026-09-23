// others
import { TOOL_DEFAULT_NODE_NAMES } from '../constants';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { applyNewNodeGridPlacement } from './autoLayout/applyNewNodeGridPlacement';
import { getActivePage } from './getActivePage';
import { getNewNodeTargetIndex } from './getNewNodeTargetIndex';
import { getNextNodeName } from './getNextNodeName';
import { insertNodesIntoContainer } from './handleMoveNodes/insertNodesIntoContainer';
import { syncAutoLayoutChildren } from './autoLayout/syncAutoLayoutChildren/syncAutoLayoutChildren';

const applyDefaultNodeName = (page: TDesignPage, node: TSceneNode): void => {
  if (TOOL_DEFAULT_NODE_NAMES.has(node.name)) {
    node.name = getNextNodeName(page.nodes, node.type, node.name);
  }
};

const registerNode = (page: TDesignPage, node: TSceneNode): void => {
  page.nodes[node.id] = node;
};

const syncNewNodeParentLayout = (state: TDesignState, page: TDesignPage, node: TSceneNode, index: number): void => {
  const parent = node.parentId ? page.nodes[node.parentId] : null;

  if (parent && parent.type === NodeType.frame) {
    switch (parent.layoutMode) {
      case LayoutMode.grid:
        applyNewNodeGridPlacement(state, parent, node.id, index);
        syncAutoLayoutChildren(state, parent.id);
        break;
      case LayoutMode.horizontal:
      case LayoutMode.vertical:
        syncAutoLayoutChildren(state, parent.id);
        break;
      default:
        break;
    }
  }
};

const placeNewNode = (state: TDesignState, page: TDesignPage, node: TSceneNode, targetIndex?: number): void => {
  const index = targetIndex ?? getNewNodeTargetIndex(page, node.parentId);

  insertNodesIntoContainer(page, node.parentId, [node.id], index);
  syncNewNodeParentLayout(state, page, node, index);
};

export const handleAddNode = (state: TDesignState, payload: TSceneNode & { targetIndex?: number }): void => {
  const { targetIndex, ...node } = payload;
  const page = getActivePage(state);

  applyDefaultNodeName(page, node as TSceneNode);
  registerNode(page, node as TSceneNode);
  placeNewNode(state, page, node as TSceneNode, targetIndex);
};
