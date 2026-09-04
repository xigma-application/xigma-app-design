// store
import { deleteNode, replaceNode } from 'store/design/slice';
import { selectActiveTool, selectSelectedIds, selectVectorEditingNodeIds } from 'store/design/selectors';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { AppDispatch, store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { convertNodeToVector, isConvertibleToVectorNode } from 'utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector';
import { enterVectorEditMode } from '../../../utils/enterVectorEditMode';
import { getTextFlattenTargets } from './getTextFlattenTargets';
import { isVectorBoundAsTextPath } from 'store/design/utils/isVectorBoundAsTextPath';

export const handleEnterVectorEdit = async (dispatch: AppDispatch, refs: TCanvasRefs): Promise<void> => {
  const state = store.getState();
  const isSelectionTool = selectActiveTool(state) === ToolName.default || selectActiveTool(state) === ToolName.move;

  if (!isSelectionTool || selectVectorEditingNodeIds(state).length > 0) {
    return;
  }

  const selectedNodes = selectSelectedIds(state)
    .map((id) => state.design.pages[state.design.activePageId].nodes[id])
    .filter((node): node is TSceneNode => Boolean(node));
  const nodesById = state.design.pages[state.design.activePageId].nodes;
  const alreadyVectorIds = selectedNodes
    .filter((node) => node.type === NodeType.vector && !isVectorBoundAsTextPath(nodesById, node.id))
    .map((node) => node.id);
  const nodesToConvert = selectedNodes.filter(isConvertibleToVectorNode);
  const textTargets = await getTextFlattenTargets();

  if (nodesToConvert.length > 0 || textTargets.length > 0) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
    nodesToConvert.forEach((node) => dispatch(replaceNode({ id: node.id, node: convertNodeToVector(node) })));
    textTargets.forEach(({ node, vector }) => dispatch(replaceNode({ id: node.id, node: { ...vector, id: node.id } })));
    textTargets.forEach(({ node }) => {
      if (node.pathId) {
        dispatch(deleteNode(node.pathId));
      }
    });
    dispatch(endHistoryGesture());
  }

  enterVectorEditMode(dispatch, [...alreadyVectorIds, ...nodesToConvert.map((node) => node.id), ...textTargets.map(({ node }) => node.id)]);
};
