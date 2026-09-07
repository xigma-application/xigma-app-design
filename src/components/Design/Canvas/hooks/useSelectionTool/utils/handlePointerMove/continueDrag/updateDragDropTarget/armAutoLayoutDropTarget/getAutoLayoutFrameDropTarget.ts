// store
import {
  getAutoLayoutDropTarget,
  TAutoLayoutDropTarget,
} from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutDropTarget';
import { getAutoLayoutWrappedDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutWrappedDropTarget/getAutoLayoutWrappedDropTarget';

// types
import { LayoutMode, SizingMode } from 'types/design/enums';
import { TAutoLayoutDropTargetContext } from './types';
import { TAutoLayoutFrame } from '../types';
import { TPoint } from 'types/canvas';

export const getAutoLayoutFrameDropTarget = (
  desiredParent: TAutoLayoutFrame,
  context: TAutoLayoutDropTargetContext,
  draggedSize: { height: number; width: number },
  point: TPoint,
): TAutoLayoutDropTarget => {
  const isHorizontal = desiredParent.layoutMode === LayoutMode.horizontal;
  const primaryMode = isHorizontal ? desiredParent.widthSizingMode : desiredParent.heightSizingMode;
  const isWrapEnabled = Boolean(desiredParent.layoutWrap) && primaryMode !== SizingMode.hug;

  return isWrapEnabled
    ? getAutoLayoutWrappedDropTarget(
        desiredParent.layoutMode,
        context.itemSpacing,
        context.counterAxisSpacing,
        context.alignment,
        desiredParent,
        context.padding,
        context.siblingSizes,
        context.originalIndex,
        draggedSize,
        context.draggedSizes,
        point,
      )
    : getAutoLayoutDropTarget(
        desiredParent.layoutMode,
        context.itemSpacing,
        context.alignment,
        desiredParent,
        context.padding,
        context.siblingSizes,
        context.realPositions,
        context.originalIndex,
        draggedSize,
        point,
      );
};
