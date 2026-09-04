// store
import { createMaskGroup, toggleNodeMask } from 'store/design/slice';
import { selectSelectedNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

export const handleUseSelectionAsMask = (dispatch: AppDispatch): void => {
  const state = store.getState();

  if (selectVectorEditingNodeIds(state).length > 0) {
    return;
  }

  const [selectedNode, ...restSelectedNodes] = selectSelectedNodes(state);

  if (selectedNode && restSelectedNodes.length === 0 && selectedNode.isMask) {
    dispatch(toggleNodeMask(selectedNode.id));
  } else {
    dispatch(createMaskGroup());
  }
};
