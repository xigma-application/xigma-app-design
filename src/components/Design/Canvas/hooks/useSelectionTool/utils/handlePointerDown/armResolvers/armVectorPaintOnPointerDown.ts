// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { TVectorNode } from 'types/design/types';
import { ToolName } from 'types/design/enums';

// utils
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { getVectorFaceAtPoint } from '../../../../../utils/getVectorFaceAtPoint';
import { getVectorFaceAtPointAcrossOpenNodes } from '../../../../../utils/getVectorFaceAtPointAcrossOpenNodes';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';
import { getVectorFillLoopKeyAtPoint } from 'utils/canvas/vectorNetwork/getVectorFillLoopKeyAtPoint';
import { persistVectorNetworkCrossings } from 'utils/canvas/vectorNetwork/planarizeVectorNetwork/persistVectorNetworkCrossings';

export const armVectorPaintOnPointerDown = ({ activeTool, dispatch, point }: TArmContext): true | undefined => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (activeTool === ToolName.paint && vectorEditingNodeIds.length > 0) {
    const hit = getVectorFaceAtPointAcrossOpenNodes(point, vectorEditingNodeIds, state.design.nodes);

    if (hit) {
      const { segments, vertices } = persistVectorNetworkCrossings(hit.node.segments, hit.node.vertices);
      const geometryChanged = segments !== hit.node.segments;
      const node = { ...hit.node, segments, vertices };
      const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
      const face = getVectorFaceAtPoint(point, bakedNode)!;
      const existingLoopKey = getVectorFillLoopKeyAtPoint(node, point);
      const filledFaceKeys = existingLoopKey
        ? node.filledFaceKeys.filter((key) => key !== existingLoopKey)
        : [...node.filledFaceKeys, getVectorFillLoopKey(face.pieceKeys)];
      const changes: Partial<TVectorNode> = geometryChanged ? { filledFaceKeys, segments, vertices } : { filledFaceKeys };

      dispatch(updateNode({ changes, id: node.id }));
    }

    return true;
  }
};
