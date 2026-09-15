import { RefObject } from 'react';

// store
import { selectNodes, selectOrderedNodes, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// utils
import { doesNodeHavePatternInSubtree } from '../../useSelectionTool/utils/handlePatternSourcePick/doesNodeHavePatternInSubtree';
import { getNodeAtPoint } from '../../../utils/getNodeAtPoint/getNodeAtPoint';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const resolvePatternSourcePickHover = (canvas: HTMLCanvasElement, event: PointerEvent, hoverRef: RefObject<string | null>): void => {
  const state = store.getState();
  const viewport = selectViewport(state);
  const point = screenToWorld(getPointerPosition(canvas, event), viewport);
  const nodesById = selectNodes(state);
  const hit = getNodeAtPoint(point, selectOrderedNodes(state), viewport);

  hoverRef.current = hit && !doesNodeHavePatternInSubtree(hit, nodesById) ? hit.id : null;
};
