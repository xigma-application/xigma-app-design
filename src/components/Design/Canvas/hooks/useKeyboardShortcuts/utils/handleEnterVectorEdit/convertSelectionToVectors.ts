// store
import { deleteNode, replaceNode } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TTextFlattenTarget } from '../getTextFlattenTargets';

// utils
import { convertNodeToVector, TConvertibleToVectorNode } from 'utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector';

const replaceConvertedNodes = (dispatch: AppDispatch, nodesToConvert: TConvertibleToVectorNode[]): void => {
  nodesToConvert.forEach((node) => dispatch(replaceNode({ id: node.id, node: convertNodeToVector(node) })));
};

const replaceFlattenedTextNodes = (dispatch: AppDispatch, textTargets: TTextFlattenTarget[]): void => {
  textTargets.forEach(({ node, vector }) => dispatch(replaceNode({ id: node.id, node: { ...vector, id: node.id } })));
};

const deleteFlattenedTextPaths = (dispatch: AppDispatch, textTargets: TTextFlattenTarget[]): void => {
  textTargets.forEach(({ node }) => {
    if (node.pathId) {
      dispatch(deleteNode(node.pathId));
    }
  });
};

export const convertSelectionToVectors = (
  dispatch: AppDispatch,
  refs: TCanvasRefs,
  nodesToConvert: TConvertibleToVectorNode[],
  textTargets: TTextFlattenTarget[],
): void => {
  if (nodesToConvert.length > 0 || textTargets.length > 0) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
    replaceConvertedNodes(dispatch, nodesToConvert);
    replaceFlattenedTextNodes(dispatch, textTargets);
    deleteFlattenedTextPaths(dispatch, textTargets);
    dispatch(endHistoryGesture());
  }
};
