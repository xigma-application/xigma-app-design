// types
import { BlendMode } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeBlendMode } from './getNodeBlendMode';

export const hasRealBlendMode = (node: TSceneNode, refs: TCanvasRefs): boolean => {
  const blendMode = getNodeBlendMode(node, refs);
  return Boolean(blendMode) && blendMode !== BlendMode.passThrough;
};
