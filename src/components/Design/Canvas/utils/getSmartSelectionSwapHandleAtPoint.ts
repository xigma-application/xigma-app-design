// others
import { SMART_SELECTION_SWAP_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';

// utils
import { getSmartSelectionLayout } from './getSmartSelectionLayout/getSmartSelectionLayout';
import { getSmartSelectionSwapSlots } from './getSmartSelectionSwapSlots';

export type TSmartSelectionSwapHandleHit = {
  center: TPoint;
  index: number;
  layout: TSmartSelectionLayout;
};

export const getSmartSelectionSwapHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): TSmartSelectionSwapHandleHit | null => {
  const layout = getSmartSelectionLayout(selectedNodes, viewport);
  const tolerance = SMART_SELECTION_SWAP_HANDLE_HIT_RADIUS_PX / viewport.zoom;

  if (layout) {
    const slots = getSmartSelectionSwapSlots(layout);

    for (let index = 0; index < slots.length; index += 1) {
      const { bounds, id } = slots[index];
      const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

      if (id !== null && Math.hypot(point.x - center.x, point.y - center.y) <= tolerance) {
        return { center, index, layout };
      }
    }
  }

  return null;
};
