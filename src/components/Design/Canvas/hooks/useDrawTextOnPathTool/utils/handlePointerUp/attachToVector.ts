// others
import { VECTOR_PATH_START_OFFSET_START } from '../../../../constants';

// store
import { selectNodes } from 'store/design/selectors';
import { setSelection, startTextEdit, updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { createVectorTextPathSampler } from 'utils/canvas/text/pathSampler/createVectorTextPathSampler/createVectorTextPathSampler';
import { getRenderedVectorNode } from '../../../../utils/getRenderedVectorNode';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';

export const attachToVector = (vectorId: string, point: TPoint, dispatch: AppDispatch): void => {
  const vector = selectNodes(store.getState())[vectorId] as TVectorNode;
  const bounds = getVectorNodeBounds(getRenderedVectorNode(vector));
  const sampler = createVectorTextPathSampler({ ...bounds, rotation: 0 }, vector);
  const pathStartOffset = sampler.totalLength > 0 ? sampler.nearestOffsetAtPoint(point).offset : VECTOR_PATH_START_OFFSET_START;

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
        pathStartOffset,
        rotation: 0,
      },
    }),
  );
};
