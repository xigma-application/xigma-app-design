// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { handleDeleteNode } from './handleDeleteNode';

export const cascadeDeletePathTextBinding = (state: TDesignState, node: TSceneNode): void => {
  if (node.type === NodeType.text && node.pathId) {
    handleDeleteNode(state, node.pathId);
  }

  Object.values(getActivePage(state).nodes)
    .filter((candidate) => candidate.type === NodeType.text && candidate.pathId === node.id)
    .forEach((textNode) => handleDeleteNode(state, textNode.id));
};
