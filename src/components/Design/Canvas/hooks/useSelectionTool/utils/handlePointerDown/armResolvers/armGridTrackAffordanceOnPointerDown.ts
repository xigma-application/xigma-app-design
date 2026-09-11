// store
import { selectGridTrackSelection } from 'store/design/selectors';
import { setGridSettingsPanelOpen } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armGridTrackAffordanceDrag } from '../armGridTrackAffordanceDrag';
import { getGridTrackAffordanceClickIndices } from 'utils/canvas/gridSlots/getGridTrackAffordanceClickIndices';
import { publishGridTrackSelection } from 'store/design/utils/publishGridTrackSelection';

export const armGridTrackAffordanceOnPointerDown = ({ canvas, canvasRefs, dispatch, event, point }: TArmContext): true | undefined => {
  const hover = canvasRefs.hover.hoveredGridTrackAffordanceRef.current;

  if (hover?.hoveredPillAxis) {
    const axis = hover.hoveredPillAxis;
    const index = axis === 'column' ? hover.columnIndex : hover.rowIndex;

    if (hover.hoveredHandlePart === 'grip') {
      armGridTrackAffordanceDrag(
        canvas,
        event,
        canvasRefs.transform.gridTrackAffordanceDragRef,
        dispatch,
        hover.frameId,
        axis,
        index,
        point,
      );
      return true;
    }

    const current = selectGridTrackSelection(store.getState());
    const currentIndices = current?.frameId === hover.frameId && current.axis === axis ? current.indices : [];
    const indices = getGridTrackAffordanceClickIndices(currentIndices, index, {
      meta: event.metaKey || event.ctrlKey,
      shift: event.shiftKey,
    });

    publishGridTrackSelection(dispatch, { axis, frameId: hover.frameId, indices });
    dispatch(setGridSettingsPanelOpen(true));

    return true;
  }
};
