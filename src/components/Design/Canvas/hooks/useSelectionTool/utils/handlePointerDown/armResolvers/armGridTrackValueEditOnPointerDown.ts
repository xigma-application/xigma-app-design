// store
import { selectGridTrackSelection } from 'store/design/selectors';
import { setGridTrackValueEditRequest } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';

export const armGridTrackValueEditOnPointerDown = ({ canvasRefs, dispatch }: TArmContext): true | undefined => {
  const hover = canvasRefs.hover.hoveredGridTrackAffordanceRef.current;

  if (hover && hover.hoveredHandlePart === 'value' && hover.hoveredPillAxis) {
    const axis = hover.hoveredPillAxis;
    const index = axis === 'column' ? hover.columnIndex : hover.rowIndex;
    const current = selectGridTrackSelection(store.getState());
    const isAlreadySelected = current?.frameId === hover.frameId && current.axis === axis && current.indices.includes(index);

    if (isAlreadySelected) {
      dispatch(setGridTrackValueEditRequest({ axis, frameId: hover.frameId, index }));
      return true;
    }
  }
};
