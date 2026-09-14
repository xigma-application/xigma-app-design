// store
import { selectGradientEditor } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armGradientRadiusDrag } from '../armGradientRadiusDrag';
import { getGradientRadiusHandleAtPoint } from '../../../../../utils/getGradientRadiusHandleAtPoint';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

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
    const paint = node.fills[radiusHit.paintIndex];

    if (paint?.type === 'gradient-radial') {
      armGradientRadiusDrag(canvas, event, canvasRefs.gradientRadius.gradientRadiusDragRef, radiusHit.nodeId, radiusHit.paintIndex);

      return true;
    }
  }
};
