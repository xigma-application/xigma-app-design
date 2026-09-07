// types
import { SizingMode } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export const getChildrenFillResetChanges = (frame: TFrameNode, axis: 'height' | 'width', nodes: Record<string, TSceneNode>): string[] =>
  frame.childIds.filter((childId) => {
    const child = nodes[childId];

    if (child && isBoxSceneNode(child)) {
      const mode = axis === 'width' ? child.widthSizingMode : child.heightSizingMode;
      return mode === SizingMode.fill;
    }

    return false;
  });
