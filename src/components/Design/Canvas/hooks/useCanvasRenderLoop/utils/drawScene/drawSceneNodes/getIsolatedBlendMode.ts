// types
import { BlendMode } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeBlendMode } from './getNodeBlendMode';

export const getIsolatedBlendMode = (node: TSceneNode, refs: TCanvasRefs): BlendMode => {
  const blendMode = getNodeBlendMode(node, refs);

  if (blendMode && blendMode !== BlendMode.passThrough) {
    return blendMode;
  }

  return BlendMode.normal;
};
