// store
import { selectGridTrackSelection } from 'store/design/selectors';
import { setGridSettingsPanelOpen, setGridTrackSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { getGridTrackAffordanceClickIndices } from 'utils/canvas/gridSlots/getGridTrackAffordanceClickIndices';

export const armGridTrackAffordanceOnPointerDown = ({ canvasRefs, dispatch, event }: TArmContext): true | undefined => {
  const hover = canvasRefs.hover.hoveredGridTrackAffordanceRef.current;

  if (hover?.hoveredPillAxis) {
    const axis = hover.hoveredPillAxis;
    const index = axis === 'column' ? hover.columnIndex : hover.rowIndex;
    const current = selectGridTrackSelection(store.getState());
    const currentIndices = current?.frameId === hover.frameId && current.axis === axis ? current.indices : [];
    const indices = getGridTrackAffordanceClickIndices(currentIndices, index, {
      meta: event.metaKey || event.ctrlKey,
      shift: event.shiftKey,
    });

    dispatch(setGridTrackSelection({ axis, frameId: hover.frameId, indices }));
    dispatch(setGridSettingsPanelOpen(true));

    return true;
  }
};
