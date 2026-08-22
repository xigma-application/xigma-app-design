// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { ToolName } from 'types/design/enums';

// utils
import { getVectorFaceAtPointAcrossOpenNodes } from '../../../../../utils/getVectorFaceAtPointAcrossOpenNodes';

export const armVectorPaintOnPointerDown = ({ activeTool, dispatch, point }: TArmContext): true | undefined => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (activeTool === ToolName.paint && vectorEditingNodeIds.length > 0) {
    const hit = getVectorFaceAtPointAcrossOpenNodes(point, vectorEditingNodeIds, state.design.nodes);

    if (hit) {
      const { faceKey, node } = hit;
      const filledFaceKeys = node.filledFaceKeys.includes(faceKey)
        ? node.filledFaceKeys.filter((key) => key !== faceKey)
        : [...node.filledFaceKeys, faceKey];

      dispatch(updateNode({ changes: { filledFaceKeys }, id: node.id }));
    }

    return true;
  }
};
