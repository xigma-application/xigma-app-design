// types
import { TAutoLayoutChildPosition } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TBoxSceneNode, TFrameNode, TSceneNode } from 'types/design/types';
import { TDraftRect } from 'types/canvas';

// utils
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { scaleFillsCrop } from 'components/Design/Canvas/utils/scaleFillsCrop';

const scaleChildFillsCrop = (child: TBoxSceneNode, target: TAutoLayoutChildPosition): void => {
  if (isAppearanceNode(child)) {
    const fills = scaleFillsCrop(child.fills, {
      newCenterX: child.x + target.width / 2,
      newCenterY: child.y + target.height / 2,
      oldCenterX: child.x + child.width / 2,
      oldCenterY: child.y + child.height / 2,
      scaleX: child.width !== 0 ? target.width / child.width : 1,
      scaleY: child.height !== 0 ? target.height / child.height : 1,
    });

    if (fills) {
      child.fills = fills;
    }
  }
};

export const applySyncedChildSize = (
  frame: TFrameNode,
  child: TSceneNode,
  bound: TDraftRect,
  target: TAutoLayoutChildPosition,
): { appliedHeight: number; appliedWidth: number } => {
  if (isBoxSceneNode(child) && child.rotation === frame.rotation && (target.width !== bound.width || target.height !== bound.height)) {
    scaleChildFillsCrop(child, target);

    child.width = target.width;
    child.height = target.height;

    return { appliedHeight: target.height, appliedWidth: target.width };
  }

  return { appliedHeight: bound.height, appliedWidth: bound.width };
};
