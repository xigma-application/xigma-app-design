// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { ToolName } from 'types/design/enums';

// utils
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVectorFaceAtPoint } from '../../../../../utils/getVectorFaceAtPoint';

export const armVectorPaintOnPointerDown = ({ activeTool, dispatch, point }: TArmContext): true | undefined => {
  const node = getVectorEditingNode(store.getState().design.nodes, selectVectorEditingNodeId(store.getState()));

  if (activeTool === ToolName.paint && node) {
    const faceKey = getVectorFaceAtPoint(point, node);

    if (faceKey) {
      const filledFaceKeys = node.filledFaceKeys.includes(faceKey)
        ? node.filledFaceKeys.filter((key) => key !== faceKey)
        : [...node.filledFaceKeys, faceKey];

      dispatch(updateNode({ changes: { filledFaceKeys }, id: node.id }));
    }

    return true;
  }
};
