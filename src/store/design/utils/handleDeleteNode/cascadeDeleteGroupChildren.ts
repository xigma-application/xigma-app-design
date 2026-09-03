// types
import { TDesignState } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { handleDeleteNode } from './handleDeleteNode';
import { isContainerNode } from '../nodeHierarchy/isContainerNode';

export const cascadeDeleteGroupChildren = (state: TDesignState, node: TSceneNode): void => {
  if (isContainerNode(node)) {
    [...node.childIds].forEach((childId) => handleDeleteNode(state, childId));
  }
};
