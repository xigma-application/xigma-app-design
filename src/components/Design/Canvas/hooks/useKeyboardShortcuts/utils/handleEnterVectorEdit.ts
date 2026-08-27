// store
import { selectActiveTool, selectSelectedIds, selectVectorEditingNodeIds } from 'store/design/selectors';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { replaceNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { convertNodeToVector, isConvertibleToVectorNode } from 'utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector';
import { enterVectorEditMode } from '../../../utils/enterVectorEditMode';

export const handleEnterVectorEdit = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const state = store.getState();
  const isSelectionTool = selectActiveTool(state) === ToolName.default || selectActiveTool(state) === ToolName.move;

  if (!isSelectionTool || selectVectorEditingNodeIds(state).length > 0) {
    return;
  }

  const selectedNodes = selectSelectedIds(state)
    .map((id) => state.design.nodes[id])
    .filter((node): node is TSceneNode => Boolean(node));
  const alreadyVectorIds = selectedNodes.filter((node) => node.type === NodeType.vector).map((node) => node.id);
  const nodesToConvert = selectedNodes.filter(isConvertibleToVectorNode);

  if (nodesToConvert.length > 0) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
    nodesToConvert.forEach((node) => dispatch(replaceNode({ id: node.id, node: convertNodeToVector(node) })));
    dispatch(endHistoryGesture());
  }

  enterVectorEditMode(dispatch, [...alreadyVectorIds, ...nodesToConvert.map((node) => node.id)]);
};
