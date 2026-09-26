// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

const getFillByKeyWithPaints = (node: TVectorNode, loopKeys: string[], paints: TPaint[]): Record<string, TPaint[]> => {
  const fillByKey = { ...node.fillByKey };

  loopKeys.forEach((key) => {
    fillByKey[key] = paints;
  });

  return fillByKey;
};

export const addNodeAlongPath = (
  dispatch: AppDispatch,
  persistedNode: TVectorNode,
  loopKeysOnPath: string[],
  paints: TPaint[],
  geometryChanged: boolean,
  segments: TVectorNode['segments'],
  vertices: TVectorNode['vertices'],
): void => {
  if (loopKeysOnPath.length > 0) {
    const alreadyFilledKeys = new Set(persistedNode.filledFaceKeys);
    const newLoopKeys = loopKeysOnPath.filter((key) => !alreadyFilledKeys.has(key));
    const fillByKey = getFillByKeyWithPaints(persistedNode, loopKeysOnPath, paints);
    const changes: Partial<TVectorNode> = geometryChanged
      ? { fillByKey, filledFaceKeys: [...persistedNode.filledFaceKeys, ...newLoopKeys], segments, vertices }
      : { fillByKey, filledFaceKeys: [...persistedNode.filledFaceKeys, ...newLoopKeys] };

    dispatch(updateNode({ changes, id: persistedNode.id }));
  }
};
