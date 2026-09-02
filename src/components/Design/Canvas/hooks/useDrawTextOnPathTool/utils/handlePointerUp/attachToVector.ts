// others
import { VECTOR_PATH_START_OFFSET_START } from '../../../../constants';

// store
import { replaceNode, setSelection, startTextEdit, updateNode } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { convertNodeToVector, isConvertibleToVectorNode } from 'utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector';
import { createVectorTextPathSampler } from 'utils/canvas/text/pathSampler/createVectorTextPathSampler/createVectorTextPathSampler';
import { getRenderedVectorNode } from '../../../../utils/getRenderedVectorNode';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';

export const attachToVector = (nodeId: string, point: TPoint, dispatch: AppDispatch): void => {
  const target = selectNodes(store.getState())[nodeId];

  if (target && isConvertibleToVectorNode(target)) {
    dispatch(replaceNode({ id: nodeId, node: convertNodeToVector(target) }));
  }

  const vector = selectNodes(store.getState())[nodeId] as TVectorNode;
  const bounds = getVectorNodeBounds(getRenderedVectorNode(vector));
  const sampler = createVectorTextPathSampler({ ...bounds, rotation: 0 }, vector);
  const pathStartOffset = sampler.totalLength > 0 ? sampler.nearestOffsetAtPoint(point).offset : VECTOR_PATH_START_OFFSET_START;

  dispatch(updateNode({ changes: { defaultFill: null, fillByKey: {}, filledFaceKeys: [] }, id: nodeId }));
  dispatch(setSelection([nodeId]));
  dispatch(
    startTextEdit({
      box: {
        ...bounds,
        flipX: false,
        flipY: false,
        pathFlip: false,
        pathId: nodeId,
        pathStartOffset,
        rotation: 0,
      },
    }),
  );
};
