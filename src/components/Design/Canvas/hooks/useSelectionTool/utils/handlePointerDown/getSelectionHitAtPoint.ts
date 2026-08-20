// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getNodeAtPoint } from '../../../../utils/getNodeAtPoint';

// while a vector node is open for editing, clicking its own body (interior fill or near-outline stroke)
// must never count as a whole-node hit — only its vertices/handles/segments are interactive in Vector
// Edit Mode (each has its own dedicated resolver, arming independently of this hit), so a click that
// lands anywhere else on that same node falls through to armVectorMarqueeOnPointerDown's empty-canvas
// case (deselect/marquee) instead of triggering an ordinary whole-node drag
export const getSelectionHitAtPoint = (point: TPoint, orderedNodes: TSceneNode[], viewport: TViewport): TSceneNode | null => {
  const hit = getNodeAtPoint(point, orderedNodes, viewport);
  const vectorEditingNodeId = selectVectorEditingNodeId(store.getState());

  return hit && hit.id === vectorEditingNodeId ? null : hit;
};
