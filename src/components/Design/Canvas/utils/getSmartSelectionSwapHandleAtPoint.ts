// others
import { SMART_SELECTION_SWAP_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getSmartSelectionLayout } from './getSmartSelectionLayout/getSmartSelectionLayout';

export type TSmartSelectionSwapHandleHit = {
  center: TPoint;
};

export const getSmartSelectionSwapHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): TSmartSelectionSwapHandleHit | null => {
  const layout = getSmartSelectionLayout(selectedNodes, viewport);
  const tolerance = SMART_SELECTION_SWAP_HANDLE_HIT_RADIUS_PX / viewport.zoom;

  if (layout) {
    const nodes = layout.type === 'grid' ? layout.cells.flat() : layout.nodes;

    for (const { bounds } of nodes) {
      const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

      if (Math.hypot(point.x - center.x, point.y - center.y) <= tolerance) {
        return { center };
      }
    }
  }

  return null;
};
