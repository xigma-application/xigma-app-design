// store
import { setDesignHintLabelKey, setSelection } from 'store/design/slice';
import { selectCanSelectMatchingLayers, selectNodes, selectRootOrder, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, RootState, store } from 'store';

// utils
import { getMatchingLayerIds } from 'store/design/utils/matchingLayers/getMatchingLayerIds';

const NO_MATCHING_LAYERS_HINT_LABEL_KEY = 'design.toolbar.matchingLayersHint.none';

const getNextSelectedIds = (state: RootState): string[] => {
  const selectedIds = selectSelectedIds(state);

  if (selectCanSelectMatchingLayers(state)) {
    return getMatchingLayerIds(selectedIds, selectNodes(state), selectRootOrder(state));
  }

  return selectedIds;
};

export const handleSelectMatchingLayers = (dispatch: AppDispatch): void => {
  const state = store.getState();
  const nextSelectedIds = getNextSelectedIds(state);

  if (nextSelectedIds.length > selectSelectedIds(state).length) {
    dispatch(setSelection(nextSelectedIds));
  } else {
    dispatch(setDesignHintLabelKey(NO_MATCHING_LAYERS_HINT_LABEL_KEY));
  }
};
