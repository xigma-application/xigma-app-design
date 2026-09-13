// types
import { BlendMode } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeBlendMode } from './getNodeBlendMode';

export const hasRealBlendMode = (node: TSceneNode): boolean => {
  const blendMode = getNodeBlendMode(node);
  return Boolean(blendMode) && blendMode !== BlendMode.passThrough;
};
