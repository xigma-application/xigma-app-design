import { RefObject } from 'react';

// store
import { selectGradientEditor, selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TGradientRadiusDragState } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// utils
import { getGradientRadiusRatioFromPoint } from '../../../../utils/getGradientRadiusRatioFromPoint';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isEllipseHandleGradientPaint } from '../../../../utils/isEllipseHandleGradientPaint';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { toNormalizedGradientPoint } from '../../../../utils/toNormalizedGradientPoint';
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { getPaintsChange } from 'utils/design/paint/getPaintsChange';

export const continueGradientRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  gradientRadiusDragRef: RefObject<TGradientRadiusDragState | null>,
): void => {
  const dragState = gradientRadiusDragRef.current;

  if (dragState) {
    const { nodeId, paintIndex } = dragState;
    const state = store.getState();
    const property = selectGradientEditor(state)?.property;
    const node = selectNodes(state)[nodeId];

    if (isAppearanceNode(node)) {
      const paint = getNodePaints(node, property)[paintIndex];

      if (isEllipseHandleGradientPaint(paint)) {
        const bounds = getNodeBounds(node);
        const boundsCenter: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
        const viewport = selectViewport(state);
        const worldPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
        const localPoint = node.rotation === 0 ? worldPoint : rotatePoint(worldPoint, boundsCenter, -node.rotation);
        const normalized = toNormalizedGradientPoint(localPoint, bounds);
        const radiusRatio = getGradientRadiusRatioFromPoint(paint.start, paint.end, normalized);
        const fills = getNodePaints(node, property).map((fill, index) => (index === paintIndex ? { ...paint, radiusRatio } : fill));

        dispatch(updateNode({ changes: getPaintsChange(property, fills), id: nodeId }));
      }
    }
  }
};
