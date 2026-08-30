// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { handleDeleteNode } from './handleDeleteNode';

export const cascadeDeleteGroupChildren = (state: TDesignState, node: TSceneNode): void => {
  if (node.type === NodeType.group) {
    [...node.childIds].forEach((childId) => handleDeleteNode(state, childId));
  }
};
