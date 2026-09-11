// store
import { AppDispatch, RootState } from 'store';
import { selectNodes, selectViewport } from 'store/design/selectors';
import { setGridTrackValueEditRequest } from 'store/design/slice';

// types
import { TCanvasRefs, TGridTrackValueEditRequest } from 'types/design/canvas/types';

// utils
import { getGridTrackValueEditTarget, TGridTrackValueEditTarget } from 'utils/canvas/gridSlots/getGridTrackValueEditTarget';

export const resolveGridTrackValueEditRequest = (
  dispatch: AppDispatch,
  refs: TCanvasRefs,
  state: RootState,
  request: TGridTrackValueEditRequest | null,
): TGridTrackValueEditTarget | null => {
  if (request) {
    const target = getGridTrackValueEditTarget(request, selectNodes(state), selectViewport(state).zoom);

    if (target) {
      refs.hover.editingGridTrackValueRef.current = { axis: target.axis, frameId: target.frameId, index: target.index, text: target.value };
      return target;
    }

    dispatch(setGridTrackValueEditRequest(null));
    return null;
  }

  refs.hover.editingGridTrackValueRef.current = null;

  return null;
};
