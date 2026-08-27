// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TVectorNode } from 'types/design/types';

export const addNodeAlongPath = (
  dispatch: AppDispatch,
  persistedNode: TVectorNode,
  loopKeysOnPath: string[],
  paintColor: string,
  geometryChanged: boolean,
  segments: TVectorNode['segments'],
  vertices: TVectorNode['vertices'],
): void => {
  if (loopKeysOnPath.length > 0) {
    const alreadyFilledKeys = new Set(persistedNode.filledFaceKeys);
    const newLoopKeys = loopKeysOnPath.filter((key) => !alreadyFilledKeys.has(key));
    const fillColorOverrideByKey = { ...persistedNode.fillColorOverrideByKey };

    loopKeysOnPath.forEach((key) => {
      fillColorOverrideByKey[key] = paintColor;
    });

    const changes: Partial<TVectorNode> = geometryChanged
      ? { fillColorOverrideByKey, filledFaceKeys: [...persistedNode.filledFaceKeys, ...newLoopKeys], segments, vertices }
      : { fillColorOverrideByKey, filledFaceKeys: [...persistedNode.filledFaceKeys, ...newLoopKeys] };

    dispatch(updateNode({ changes, id: persistedNode.id }));
  }
};
