// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TSceneNodeChanges } from 'types/design/types';

// utils
import { isVectorWidthProfileEligible } from '../isVectorWidthProfileEligible';

export const invalidateVectorWidthProfile = (node: TSceneNode, changes: TSceneNodeChanges): void => {
  if (node.type === NodeType.vector && 'segments' in changes && !isVectorWidthProfileEligible(node)) {
    node.widthProfile = null;
  }
};
