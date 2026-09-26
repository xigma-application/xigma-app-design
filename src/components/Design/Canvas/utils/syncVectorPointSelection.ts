import { isEqual } from 'lodash';

// store
import { selectVectorPointSelection } from 'store/design/selectors';
import { setVectorPointSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { TVectorEditRefs } from 'types/design/canvas/types';

export const syncVectorPointSelection = (vectorEdit: TVectorEditRefs): void => {
  const selection = {
    segmentIds: vectorEdit.selectedVectorSegmentIdsRef.current,
    vertexIds: vectorEdit.selectedVectorVertexIdsRef.current,
  };

  if (!isEqual(selectVectorPointSelection(store.getState()), selection)) {
    store.dispatch(setVectorPointSelection(selection));
  }
};
