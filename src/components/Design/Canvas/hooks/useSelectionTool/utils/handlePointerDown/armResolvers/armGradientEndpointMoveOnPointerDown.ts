// store
import { selectGradientEditor } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armGradientEndpointMoveDrag } from '../armGradientEndpointMoveDrag';
import { getGradientEndpointMoveHandleAtPoint } from '../../../../../utils/getGradientEndpointMoveHandleAtPoint';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isLineHandleGradientPaint } from '../../../../../utils/isLineHandleGradientPaint';

export const armGradientEndpointMoveOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const gradientEditor = selectGradientEditor(store.getState());
  const moveHit = getGradientEndpointMoveHandleAtPoint(point, selectedNodes, viewport, gradientEditor);
  const [node] = selectedNodes;

  if (moveHit && gradientEditor && isAppearanceNode(node)) {
    const paint = node.fills[moveHit.paintIndex];

    if (isLineHandleGradientPaint(paint)) {
      armGradientEndpointMoveDrag(
        canvas,
        event,
        canvasRefs.gradientEndpointMove.gradientEndpointMoveDragRef,
        moveHit.nodeId,
        moveHit.paintIndex,
        moveHit.endpoint,
      );

      return true;
    }
  }
};
