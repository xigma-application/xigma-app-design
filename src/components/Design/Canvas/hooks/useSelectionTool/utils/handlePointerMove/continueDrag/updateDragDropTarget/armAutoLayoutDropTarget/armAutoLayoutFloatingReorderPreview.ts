// store
import { getAutoLayoutContentBox } from 'store/design/utils/autoLayout/getAutoLayoutContentBox';
import { getAutoLayoutSingleLineSiblingPositions } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutSingleLineSiblingPositions';
import { getAutoLayoutWrappedSiblingPositions } from 'store/design/utils/autoLayout/getAutoLayoutWrappedDropTarget/getAutoLayoutWrappedSiblingPositions';
import { getNodesBoundingBox } from 'store/design/utils/getNodesBoundingBox';

// types
import { TAutoLayoutDropTargetContext } from './types';
import { TAutoLayoutFrame } from '../types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutFrameDropTarget } from './getAutoLayoutFrameDropTarget';

export const armAutoLayoutFloatingReorderPreview = (
  canvasRefs: TCanvasRefs,
  desiredParent: TAutoLayoutFrame,
  desiredParentId: string,
  selectedNodes: TSceneNode[],
  point: TPoint,
  context: TAutoLayoutDropTargetContext,
): void => {
  const draggedSize = getNodesBoundingBox(selectedNodes);
  const dropTarget = getAutoLayoutFrameDropTarget(
    desiredParent,
    context.itemSpacing,
    context.counterAxisSpacing,
    context.alignment,
    context.padding,
    context.siblingSizes,
    context.realPositions,
    context.originalIndex,
    draggedSize,
    context.draggedSizes,
    point,
  );
  const contentBox = getAutoLayoutContentBox(desiredParent, context.padding);
  const siblingPositions = context.isWrapEnabled
    ? getAutoLayoutWrappedSiblingPositions(
        desiredParent.layoutMode,
        context.itemSpacing,
        context.counterAxisSpacing,
        context.alignment,
        contentBox,
        context.siblingSizes,
        dropTarget.index,
        [],
      )
    : getAutoLayoutSingleLineSiblingPositions(
        desiredParent.layoutMode,
        context.itemSpacing,
        context.alignment,
        contentBox,
        context.siblingSizes,
        dropTarget.index,
        [],
      );

  canvasRefs.transform.autoLayoutDropTargetRef.current = { frameId: desiredParentId, ...dropTarget };
  canvasRefs.transform.autoLayoutReorderPreviewRef.current = {
    activeIndex: dropTarget.index,
    frameId: desiredParentId,
    positions: siblingPositions,
  };
};
