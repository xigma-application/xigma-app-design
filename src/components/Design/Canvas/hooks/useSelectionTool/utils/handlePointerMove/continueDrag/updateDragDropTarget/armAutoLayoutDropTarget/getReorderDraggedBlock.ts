// store
import { getAutoLayoutContentBox, TAutoLayoutPadding } from 'store/design/utils/autoLayout/getAutoLayoutContentBox';
import { getAutoLayoutDraggedMemberSlots } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutDraggedMemberSlots';

// types
import { AlignmentLayout } from 'types/design/enums';
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions';
import { TAutoLayoutFrame } from '../types';
import { TAutoLayoutReorderPreview } from 'types/design/canvas/types';

// utils
import { getDraggedBlockPreviewMeta } from './getDraggedBlockPreviewMeta';

export const getReorderDraggedBlock = (
  desiredParent: TAutoLayoutFrame,
  itemSpacing: number,
  alignment: AlignmentLayout,
  padding: TAutoLayoutPadding,
  siblingSizes: TAutoLayoutChildSize[],
  dropTargetIndex: number,
  draggedSizes: TAutoLayoutChildSize[],
  orderedMovedIds: string[],
  grabbedNodeId: string | null,
): Pick<TAutoLayoutReorderPreview, 'draggedGrabbedId' | 'draggedMemberSlots'> | undefined => {
  if (orderedMovedIds.length > 1) {
    const memberSlots = getAutoLayoutDraggedMemberSlots(
      desiredParent.layoutMode,
      itemSpacing,
      alignment,
      getAutoLayoutContentBox(desiredParent, padding),
      siblingSizes,
      dropTargetIndex,
      draggedSizes,
    );

    return getDraggedBlockPreviewMeta(orderedMovedIds, grabbedNodeId, memberSlots);
  }

  return undefined;
};
