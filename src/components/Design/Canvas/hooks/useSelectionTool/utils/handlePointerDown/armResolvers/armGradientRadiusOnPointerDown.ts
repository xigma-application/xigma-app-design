// store
import { selectGradientEditor } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armGradientRadiusDrag } from '../armGradientRadiusDrag';
import { getGradientRadiusHandleAtPoint } from '../../../../../utils/getGradientRadiusHandleAtPoint';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isEllipseHandleGradientPaint } from '../../../../../utils/isEllipseHandleGradientPaint';
import { getNodePaints } from 'utils/design/paint/getNodePaints';

export const armGradientRadiusOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const gradientEditor = selectGradientEditor(store.getState());
  const radiusHit = getGradientRadiusHandleAtPoint(point, selectedNodes, viewport, gradientEditor);
  const [node] = selectedNodes;

  if (radiusHit && gradientEditor && isAppearanceNode(node)) {
    const paint = getNodePaints(node, gradientEditor.property)[radiusHit.paintIndex];

    /* v8 ignore if -- getGradientRadiusHandleAtPoint already checked isEllipseHandleGradientPaint on this exact paint before returning a hit, so this is always true here */
    if (isEllipseHandleGradientPaint(paint)) {
      armGradientRadiusDrag(canvas, event, canvasRefs.gradientRadius.gradientRadiusDragRef, radiusHit.nodeId, radiusHit.paintIndex);
      return true;
    }
  }
};
