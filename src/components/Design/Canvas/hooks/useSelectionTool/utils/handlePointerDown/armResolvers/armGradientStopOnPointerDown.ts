// store
import { selectGradientEditor } from 'store/design/selectors';
import { setGradientEditor } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armGradientStopDrag } from '../armGradientStopDrag';
import { getGradientStopHandleAtPoint } from '../../../../../utils/getGradientStopHandleAtPoint';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isLineHandleGradientPaint } from '../../../../../utils/isLineHandleGradientPaint';

export const armGradientStopOnPointerDown = ({
  canvas,
  canvasRefs,
  dispatch,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const gradientEditor = selectGradientEditor(store.getState());
  const gradientStopHit = getGradientStopHandleAtPoint(point, selectedNodes, viewport, gradientEditor);
  const [node] = selectedNodes;

  if (gradientStopHit && gradientEditor && isAppearanceNode(node)) {
    const paint = node.fills[gradientStopHit.paintIndex];

    /* v8 ignore if -- getGradientStopHandleAtPoint already checked isLineHandleGradientPaint on this exact paint before returning a hit, so this is always true here */
    if (isLineHandleGradientPaint(paint)) {
      const stop = paint.stops[gradientStopHit.stopIndex];

      armGradientStopDrag(
        canvas,
        event,
        canvasRefs.gradientStop.gradientStopDragRef,
        gradientStopHit.nodeId,
        gradientStopHit.paintIndex,
        gradientStopHit.stopIndex,
        stop.color,
        stop.opacity,
      );
      dispatch(setGradientEditor({ ...gradientEditor, selectedStopIndex: gradientStopHit.stopIndex }));

      return true;
    }
  }
};
