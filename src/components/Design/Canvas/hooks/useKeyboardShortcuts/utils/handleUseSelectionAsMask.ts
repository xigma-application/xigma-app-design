// store
import { createMaskGroup, toggleNodeMask } from 'store/design/slice';
import { selectSelectedNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// utils
import { isLayoutContainerNode } from 'utils/canvas/signals/isLayoutContainerNode';

export const handleUseSelectionAsMask = (dispatch: AppDispatch): void => {
  const state = store.getState();

  if (selectVectorEditingNodeIds(state).length === 0) {
    const selectedNodes = selectSelectedNodes(state);
    const [selectedNode, ...restSelectedNodes] = selectedNodes;
    const isEveryNodeAContainer = selectedNodes.length > 0 && selectedNodes.every(isLayoutContainerNode);

    if (!isEveryNodeAContainer) {
      if (selectedNode && restSelectedNodes.length === 0 && selectedNode.isMask) {
        dispatch(toggleNodeMask(selectedNode.id));
      } else {
        dispatch(createMaskGroup());
      }
    }
  }
};
