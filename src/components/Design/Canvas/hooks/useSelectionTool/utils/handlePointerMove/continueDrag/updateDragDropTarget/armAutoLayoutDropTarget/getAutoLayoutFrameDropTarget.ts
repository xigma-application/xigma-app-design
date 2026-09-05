// store
import {
  getAutoLayoutDropTarget,
  TAutoLayoutDropTarget,
} from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutDropTarget';
import { getAutoLayoutWrappedDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutWrappedDropTarget/getAutoLayoutWrappedDropTarget';
import { TAutoLayoutPadding } from 'store/design/utils/autoLayout/getAutoLayoutContentBox';

// types
import { AlignmentLayout, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions';
import { TAutoLayoutFrame } from '../types';
import { TPoint } from 'types/canvas';

export const getAutoLayoutFrameDropTarget = (
  desiredParent: TAutoLayoutFrame,
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  padding: TAutoLayoutPadding,
  siblingSizes: TAutoLayoutChildSize[],
  realPositions: TAutoLayoutChildPosition[],
  originalIndex: number | null,
  draggedSize: { height: number; width: number },
  draggedSizes: TAutoLayoutChildSize[],
  point: TPoint,
): TAutoLayoutDropTarget => {
  const isWrapEnabled = Boolean(desiredParent.layoutWrap) && desiredParent.primaryAxisSizingMode !== SizingMode.hug;

  return isWrapEnabled
    ? getAutoLayoutWrappedDropTarget(
        desiredParent.layoutMode,
        itemSpacing,
        counterAxisSpacing,
        alignment,
        desiredParent,
        padding,
        siblingSizes,
        originalIndex,
        draggedSize,
        draggedSizes,
        point,
      )
    : getAutoLayoutDropTarget(
        desiredParent.layoutMode,
        itemSpacing,
        alignment,
        desiredParent,
        padding,
        siblingSizes,
        realPositions,
        originalIndex,
        draggedSize,
        point,
      );
};
