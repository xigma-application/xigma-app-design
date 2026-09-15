import { RefObject } from 'react';

// store
import { selectNodes, selectOrderedNodes, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// utils
import { doesNodeHavePatternInSubtree } from '../../useSelectionTool/utils/handlePatternSourcePick/doesNodeHavePatternInSubtree';
import { getGroupChildHitAtPoint } from '../../useSelectionTool/utils/handlePointerDown/getGroupChildHitAtPoint';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getSelectionHitAtPoint } from '../../useSelectionTool/utils/handlePointerDown/getSelectionHitAtPoint/getSelectionHitAtPoint';
import { isControlPressed } from 'utils/isControlPressed';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const resolvePatternSourcePickHover = (canvas: HTMLCanvasElement, event: PointerEvent, hoverRef: RefObject<string | null>): void => {
  const state = store.getState();
  const viewport = selectViewport(state);
  const point = screenToWorld(getPointerPosition(canvas, event), viewport);
  const nodesById = selectNodes(state);
  const controlHit = isControlPressed(event) ? getGroupChildHitAtPoint(point, viewport) : null;
  const hit = controlHit ?? getSelectionHitAtPoint(point, selectOrderedNodes(state), viewport);

  hoverRef.current = hit && !doesNodeHavePatternInSubtree(hit, nodesById) ? hit.id : null;
};
