// store
import { updateNode } from 'store/design/slice';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getNodesBoundingBox } from 'store/design/utils/getNodesBoundingBox';
import { getRotatedGroupBounds } from 'store/design/utils/getRotatedGroupBounds';

export const handleResizeToFit = (dispatch: AppDispatch): void => {
  const state = store.getState();
  const [selectedNode, ...restSelectedNodes] = selectSelectedNodes(state);

  if (selectedNode && restSelectedNodes.length === 0 && selectedNode.type === NodeType.frame) {
    const nodes = selectNodes(state);
    const children = selectedNode.childIds.map((childId) => nodes[childId]).filter(Boolean);

    if (children.length > 0) {
      const bounds = selectedNode.rotation === 0 ? getNodesBoundingBox(children) : getRotatedGroupBounds(children, selectedNode.rotation);

      dispatch(updateNode({ changes: { height: bounds.height, width: bounds.width, x: bounds.x, y: bounds.y }, id: selectedNode.id }));
    }
  }
};
