// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TVectorNode } from 'types/design/types';

export const removeNodeAlongPath = (
  dispatch: AppDispatch,
  persistedNode: TVectorNode,
  loopKeysOnPath: string[],
  geometryChanged: boolean,
  segments: TVectorNode['segments'],
  vertices: TVectorNode['vertices'],
): void => {
  const alreadyFilledKeys = new Set(persistedNode.filledFaceKeys);
  const loopKeysToRemove = loopKeysOnPath.filter((key) => alreadyFilledKeys.has(key));

  if (loopKeysToRemove.length > 0) {
    const removeSet = new Set(loopKeysToRemove);
    const filledFaceKeys = persistedNode.filledFaceKeys.filter((key) => !removeSet.has(key));
    const changes: Partial<TVectorNode> = geometryChanged ? { filledFaceKeys, segments, vertices } : { filledFaceKeys };

    dispatch(updateNode({ changes, id: persistedNode.id }));
  }
};
