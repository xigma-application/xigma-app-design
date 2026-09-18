// store
import { selectGradientEditor } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientRotateEndpoint, TGradientRotateMode } from 'types/design/canvas/types';

// utils
import { armGradientRotateDrag } from '../armGradientRotateDrag';
import { getGradientRotateHandleAtPoint } from '../../../../../utils/getGradientRotateHandleAtPoint';
import { getTouchedRectEdges, TRectEdge } from 'utils/canvas/getTouchedRectEdges';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isEllipseHandleGradientPaint } from '../../../../../utils/isEllipseHandleGradientPaint';
import { getNodePaints } from 'utils/design/paint/getNodePaints';

const GRADIENT_EDGE_ATTACH_TOLERANCE_PX = 0.5;

const hasDistinctEdge = (edgesA: Set<TRectEdge>, edgesB: Set<TRectEdge>): boolean =>
  [...edgesA].some((edge) => !edgesB.has(edge)) && [...edgesB].some((edge) => !edgesA.has(edge));

const isGradientLineAttachedToBox = (localStart: TPoint, localEnd: TPoint, bounds: TDraftRect): boolean => {
  const startEdges = getTouchedRectEdges(localStart, bounds, GRADIENT_EDGE_ATTACH_TOLERANCE_PX);
  const endEdges = getTouchedRectEdges(localEnd, bounds, GRADIENT_EDGE_ATTACH_TOLERANCE_PX);

  return hasDistinctEdge(startEdges, endEdges);
};

const getGradientRotateAngleOffset = (
  localStart: TPoint,
  localEnd: TPoint,
  bounds: TDraftRect,
  draggedEndpoint: TGradientRotateEndpoint,
): number => {
  const boundsCenter: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const [draggedLocal, otherLocal] = draggedEndpoint === 'start' ? [localStart, localEnd] : [localEnd, localStart];
  const draggedAngle = Math.atan2(draggedLocal.y - boundsCenter.y, draggedLocal.x - boundsCenter.x);
  const otherAngle = Math.atan2(otherLocal.y - boundsCenter.y, otherLocal.x - boundsCenter.x);

  return otherAngle - (draggedAngle + Math.PI);
};

export const armGradientRotateOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const gradientEditor = selectGradientEditor(store.getState());
  const rotateHit = getGradientRotateHandleAtPoint(point, selectedNodes, viewport, gradientEditor);
  const [node] = selectedNodes;

  if (rotateHit && gradientEditor && isAppearanceNode(node)) {
    const paint = getNodePaints(node, gradientEditor.property)[rotateHit.paintIndex];

    if (paint?.type === 'gradient-linear') {
      const { bounds } = rotateHit;
      const localStart: TPoint = { x: bounds.x + paint.start.x * bounds.width, y: bounds.y + paint.start.y * bounds.height };
      const localEnd: TPoint = { x: bounds.x + paint.end.x * bounds.width, y: bounds.y + paint.end.y * bounds.height };
      const isAttachedToBox = isGradientLineAttachedToBox(localStart, localEnd, bounds);
      const mode: TGradientRotateMode = isAttachedToBox ? 'box' : 'line';
      const pivot: TPoint = { x: (localStart.x + localEnd.x) / 2, y: (localStart.y + localEnd.y) / 2 };
      const radius = Math.hypot(localEnd.x - localStart.x, localEnd.y - localStart.y) / 2;
      const angleOffset = mode === 'box' ? getGradientRotateAngleOffset(localStart, localEnd, bounds, rotateHit.endpoint) : 0;

      armGradientRotateDrag(
        canvas,
        event,
        canvasRefs.gradientRotate.gradientRotateDragRef,
        rotateHit.nodeId,
        rotateHit.paintIndex,
        rotateHit.endpoint,
        point,
        mode,
        pivot,
        radius,
        angleOffset,
      );

      return true;
    }

    /* v8 ignore if -- getGradientRotateHandleAtPoint already guarantees paint is line/radial/angular/diamond, and the branch above just excluded linear, so whatever remains is always an ellipse-handle paint */
    if (isEllipseHandleGradientPaint(paint)) {
      const { bounds } = rotateHit;
      const localStart: TPoint = { x: bounds.x + paint.start.x * bounds.width, y: bounds.y + paint.start.y * bounds.height };
      const localEnd: TPoint = { x: bounds.x + paint.end.x * bounds.width, y: bounds.y + paint.end.y * bounds.height };
      const radius = Math.hypot(localEnd.x - localStart.x, localEnd.y - localStart.y);

      armGradientRotateDrag(
        canvas,
        event,
        canvasRefs.gradientRotate.gradientRotateDragRef,
        rotateHit.nodeId,
        rotateHit.paintIndex,
        'end',
        point,
        'radial',
        localStart,
        radius,
        0,
      );

      return true;
    }
  }
};
