// store
import { createMaskGroup, removeNodeMask } from 'store/design/slice';
import { selectNodes, selectSelectedNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// utils
import { getIsMaskChild } from 'store/design/utils/getIsMaskChild';
import { isLayoutContainerNode } from 'utils/canvas/signals/isLayoutContainerNode';

export const handleUseSelectionAsMask = (dispatch: AppDispatch): void => {
  const state = store.getState();

  if (selectVectorEditingNodeIds(state).length === 0) {
    const nodes = selectNodes(state);
    const selectedNodes = selectSelectedNodes(state);
    const [selectedNode, ...restSelectedNodes] = selectedNodes;
    const isEveryNodeAContainer = selectedNodes.length > 0 && selectedNodes.every(isLayoutContainerNode);

    if (!isEveryNodeAContainer) {
      if (selectedNode && restSelectedNodes.length === 0 && getIsMaskChild(selectedNode, nodes)) {
        dispatch(removeNodeMask(selectedNode.id));
      } else {
        dispatch(createMaskGroup());
      }
    }
  }
};
