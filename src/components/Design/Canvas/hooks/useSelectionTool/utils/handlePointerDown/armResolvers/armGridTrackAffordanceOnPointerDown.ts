// store
import { AppDispatch, store } from 'store';
import { selectGridTrackSelection } from 'store/design/selectors';
import { setGridSettingsPanelOpen, setGridTrackModeMenuRequest } from 'store/design/slice';

// types
import { TArmContext } from '../types';
import { TGridTrackAffordanceHandlePart } from 'types/design/canvas/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { armGridTrackAffordanceDrag } from '../armGridTrackAffordanceDrag';
import { getGridTrackAffordanceClickIndices } from 'utils/canvas/gridSlots/getGridTrackAffordanceClickIndices';
import { publishGridTrackSelection } from 'store/design/utils/publishGridTrackSelection';

const openGridTrackAffordanceMenu = (
  dispatch: AppDispatch,
  hoveredHandlePart: TGridTrackAffordanceHandlePart | null,
  axis: TGridTrackAxis,
  frameId: string,
  index: number,
): void => {
  if (hoveredHandlePart === 'chevron') {
    dispatch(setGridTrackModeMenuRequest({ axis, frameId, index }));
  } else {
    dispatch(setGridSettingsPanelOpen(true));
  }
};

export const armGridTrackAffordanceOnPointerDown = ({ canvas, canvasRefs, dispatch, event, point }: TArmContext): true | undefined => {
  const hover = canvasRefs.hover.hoveredGridTrackAffordanceRef.current;

  if (hover?.hoveredPillAxis) {
    const axis = hover.hoveredPillAxis;
    const index = axis === 'column' ? hover.columnIndex : hover.rowIndex;
    const hasSelectModifier = event.metaKey || event.ctrlKey || event.shiftKey;

    if (hover.hoveredHandlePart === 'grip' && !hasSelectModifier) {
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
    const opensModeMenuOnAlreadySelected = hover.hoveredHandlePart === 'chevron' && currentIndices.includes(index);
    const indices = opensModeMenuOnAlreadySelected
      ? currentIndices
      : getGridTrackAffordanceClickIndices(currentIndices, index, { meta: event.metaKey || event.ctrlKey, shift: event.shiftKey });

    publishGridTrackSelection(dispatch, { axis, frameId: hover.frameId, indices });
    openGridTrackAffordanceMenu(dispatch, hover.hoveredHandlePart, axis, hover.frameId, index);

    return true;
  }
};
