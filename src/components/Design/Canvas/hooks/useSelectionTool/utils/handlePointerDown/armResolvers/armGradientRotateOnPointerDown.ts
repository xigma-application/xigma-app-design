// store
import { selectGradientEditor } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armGradientRotateDrag } from '../armGradientRotateDrag';
import { getGradientRotateHandleAtPoint } from '../../../../../utils/getGradientRotateHandleAtPoint';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

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
    const paint = node.fills[rotateHit.paintIndex];

    if (paint?.type === 'gradient-linear') {
      armGradientRotateDrag(
        canvas,
        event,
        canvasRefs.gradientRotate.gradientRotateDragRef,
        rotateHit.nodeId,
        rotateHit.paintIndex,
        rotateHit.endpoint,
        point,
      );

      return true;
    }
  }
};
