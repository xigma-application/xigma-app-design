// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from '../../../utils/bakeVectorNodeRotation';
import { eraseVectorNetworkAlongCapsule } from 'utils/canvas/vectorNetwork/eraseVectorNetwork/eraseVectorNetworkAlongCapsule';
import { getVectorEditingNode } from '../../../utils/getVectorEditingNode';

export const eraseVectorNetworkStep = (dispatch: AppDispatch, capsuleStart: TPoint, capsuleEnd: TPoint, radius: number): void => {
  const state = store.getState();

  selectVectorEditingNodeIds(state).forEach((nodeId) => {
    const node = getVectorEditingNode(state.design.nodes, nodeId);

    if (node) {
      const baked = { ...node, ...bakeVectorNodeRotation(node) };
      const result = eraseVectorNetworkAlongCapsule(baked, capsuleStart, capsuleEnd, radius);

      if (result) {
        const changes: Partial<TVectorNode> = node.rotation
          ? { rotation: 0, segments: result.segments, vertices: result.vertices }
          : { segments: result.segments, vertices: result.vertices };

        dispatch(updateNode({ changes, id: node.id }));
      }
    }
  });
};
