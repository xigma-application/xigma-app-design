// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { ToolName } from 'types/design/enums';

// utils
import { getVectorFaceAtPointAcrossOpenNodes } from '../../../../../utils/getVectorFaceAtPointAcrossOpenNodes';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';
import { getVectorFillLoopKeyAtPoint } from 'utils/canvas/vectorNetwork/getVectorFillLoopKeyAtPoint';

export const armVectorPaintOnPointerDown = ({ activeTool, dispatch, point }: TArmContext): true | undefined => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (activeTool === ToolName.paint && vectorEditingNodeIds.length > 0) {
    const hit = getVectorFaceAtPointAcrossOpenNodes(point, vectorEditingNodeIds, state.design.nodes);

    if (hit) {
      const { face, node } = hit;
      const existingLoopKey = getVectorFillLoopKeyAtPoint(node, point);

      if (existingLoopKey) {
        const filledFaceKeys = node.filledFaceKeys.filter((key) => key !== existingLoopKey);
        dispatch(updateNode({ changes: { filledFaceKeys }, id: node.id }));
      } else {
        const filledFaceKeys = [...node.filledFaceKeys, getVectorFillLoopKey(face.pieceKeys)];
        dispatch(updateNode({ changes: { filledFaceKeys }, id: node.id }));
      }
    }

    return true;
  }
};
