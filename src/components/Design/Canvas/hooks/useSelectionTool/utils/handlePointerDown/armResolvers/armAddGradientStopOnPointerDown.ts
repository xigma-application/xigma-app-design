// store
import { selectGradientEditor } from 'store/design/selectors';
import { setGradientEditor, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { TGradientStop } from 'types/design/paint/types';

// utils
import { getGradientAddStopPositionAtPoint } from '../../../../../utils/getGradientAddStopPositionAtPoint';
import { getInterpolatedGradientColor } from '../../../../../utils/getInterpolatedGradientColor';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isLineHandleGradientPaint } from '../../../../../utils/isLineHandleGradientPaint';
import { MAX_STOPS } from 'shared/UITools/ColorPicker/Body/GradientPanel/constants';

export const armAddGradientStopOnPointerDown = ({ dispatch, point, selectedNodes, viewport }: TArmContext): true | undefined => {
  const gradientEditor = selectGradientEditor(store.getState());
  const gradientAddStopHit = getGradientAddStopPositionAtPoint(point, selectedNodes, viewport, gradientEditor);
  const [node] = selectedNodes;

  if (gradientAddStopHit && gradientEditor && isAppearanceNode(node)) {
    const paint = node.fills[gradientAddStopHit.paintIndex];

    if (isLineHandleGradientPaint(paint) && paint.stops.length < MAX_STOPS) {
      const { color, opacity } = getInterpolatedGradientColor(paint.stops, gradientAddStopHit.position);
      const newStop: TGradientStop = { color, opacity, position: gradientAddStopHit.position };
      const sortedStops = [...paint.stops, newStop].sort((a, b) => a.position - b.position);
      const fills = node.fills.map((fill, index) => (index === gradientAddStopHit.paintIndex ? { ...paint, stops: sortedStops } : fill));
      const newStopIndex = sortedStops.indexOf(newStop);

      dispatch(updateNode({ changes: { fills }, id: node.id }));
      dispatch(setGradientEditor({ ...gradientEditor, selectedStopIndex: newStopIndex }));

      return true;
    }
  }
};
