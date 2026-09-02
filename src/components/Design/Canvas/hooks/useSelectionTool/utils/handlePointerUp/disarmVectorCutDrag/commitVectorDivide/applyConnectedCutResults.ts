// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TVectorConnectedCutResult } from './types';

export const applyConnectedCutResults = (dispatch: AppDispatch, connectedCutResults: TVectorConnectedCutResult[]): void => {
  connectedCutResults.forEach(({ fillByKey, filledFaceKeys, node, segments, vertices }) => {
    dispatch(updateNode({ changes: { fillByKey, filledFaceKeys, rotation: 0, segments, vertices }, id: node.id }));
  });
};
