// types
import { TAutoLayoutDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutDropTarget';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { animateAutoLayoutReorder } from 'components/Design/Canvas/utils/animateAutoLayoutReorder';

export const armAutoLayoutReorderPreview = (
  canvasRefs: TCanvasRefs,
  desiredParentId: string,
  dropTarget: TAutoLayoutDropTarget,
  siblingEntries: { bounds: TDraftRect; sibling: TSceneNode }[],
): void => {
  const activePreview = canvasRefs.transform.autoLayoutReorderPreviewRef.current;
  const isAlreadyAnimatingThisIndex =
    activePreview !== null && activePreview.frameId === desiredParentId && activePreview.activeIndex === dropTarget.index;

  if (!isAlreadyAnimatingThisIndex) {
    const from = siblingEntries.reduce<Record<string, TPoint>>((positions, { bounds, sibling }) => {
      positions[sibling.id] = activePreview?.positions[sibling.id] ?? { x: bounds.x, y: bounds.y };

      return positions;
    }, {});

    animateAutoLayoutReorder(
      canvasRefs.transform.autoLayoutReorderPreviewRef,
      desiredParentId,
      dropTarget.index,
      from,
      dropTarget.siblingPositions,
    );
  }
};
