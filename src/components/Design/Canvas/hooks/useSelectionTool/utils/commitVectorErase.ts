// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from '../../../utils/bakeVectorNodeRotation';
import { getVectorEditingNode } from '../../../utils/getVectorEditingNode';
import { subtractCapsuleFromVectorNetwork } from 'utils/canvas/vectorNetwork/eraseVectorNetwork/subtractCapsuleFromVectorNetwork/subtractCapsuleFromVectorNetwork';

export const commitVectorErase = (dispatch: AppDispatch, path: TPoint[], radius: number): void => {
  const state = store.getState();

  selectVectorEditingNodeIds(state).forEach((nodeId) => {
    const node = getVectorEditingNode(state.design.nodes, nodeId);

    if (node) {
      const baked = { ...node, ...bakeVectorNodeRotation(node) };
      const result = subtractCapsuleFromVectorNetwork(baked, path, radius);

      if (result) {
        const changes: Partial<TVectorNode> = node.rotation
          ? {
              fillColorOverrideByKey: result.fillColorOverrideByKey,
              filledFaceKeys: result.filledFaceKeys,
              rotation: 0,
              segments: result.segments,
              vertices: result.vertices,
            }
          : {
              fillColorOverrideByKey: result.fillColorOverrideByKey,
              filledFaceKeys: result.filledFaceKeys,
              segments: result.segments,
              vertices: result.vertices,
            };

        dispatch(updateNode({ changes, id: node.id }));
      }
    }
  });
};
