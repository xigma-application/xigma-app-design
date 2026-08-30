// others
import { VECTOR_PATH_START_OFFSET_START } from '../../../../constants';

// store
import { selectNodes } from 'store/design/selectors';
import { setSelection, startTextEdit, updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { getRenderedVectorNode } from '../../../../utils/getRenderedVectorNode';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';

export const attachToVector = (vectorId: string, dispatch: AppDispatch): void => {
  const vector = selectNodes(store.getState())[vectorId] as TVectorNode;
  const bounds = getVectorNodeBounds(getRenderedVectorNode(vector));

  dispatch(updateNode({ changes: { fillColor: null, fillColorOverrideByKey: {}, filledFaceKeys: [] }, id: vectorId }));
  dispatch(setSelection([vectorId]));
  dispatch(
    startTextEdit({
      box: {
        ...bounds,
        flipX: false,
        flipY: false,
        pathFlip: false,
        pathId: vectorId,
        pathStartOffset: VECTOR_PATH_START_OFFSET_START,
        rotation: 0,
      },
    }),
  );
};
