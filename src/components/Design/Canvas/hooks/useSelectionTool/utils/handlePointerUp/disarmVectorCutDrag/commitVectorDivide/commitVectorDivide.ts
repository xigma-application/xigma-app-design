// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TVectorConnectedCutResult, TVectorDivideResult } from './types';

// utils
import { applyConnectedCutResults } from './applyConnectedCutResults';
import { applyDivideResults } from './applyDivideResults';
import { dispatchAsOneGestureIfMultiNode } from '../../../../../../utils/dispatchAsOneGestureIfMultiNode';
import { findVectorConnectedCutResult } from './findVectorConnectedCutResult';
import { findVectorDivideResult } from './findVectorDivideResult';
import { getVectorEditingNode } from '../../../../../../utils/getVectorEditingNode';

const getVectorDivideEditingNodes = (nodes: Record<string, TSceneNode>, vectorEditingNodeIds: string[]): TVectorNode[] =>
  vectorEditingNodeIds.map((nodeId) => getVectorEditingNode(nodes, nodeId)).filter((node): node is TVectorNode => node !== null);

const findAllVectorDivideResults = (editingNodes: TVectorNode[], lineStart: TPoint, lineEnd: TPoint): TVectorDivideResult[] =>
  editingNodes
    .map((node) => findVectorDivideResult(node, lineStart, lineEnd))
    .filter((result): result is TVectorDivideResult => result !== null);

const findAllVectorConnectedCutResults = (
  editingNodes: TVectorNode[],
  dividedNodeIds: Set<string>,
  lineStart: TPoint,
  lineEnd: TPoint,
): TVectorConnectedCutResult[] =>
  editingNodes
    .filter((node) => !dividedNodeIds.has(node.id))
    .map((node) => findVectorConnectedCutResult(node, lineStart, lineEnd))
    .filter((result): result is TVectorConnectedCutResult => result !== null);

export const commitVectorDivide = (
  dispatch: AppDispatch,
  lineStart: TPoint,
  lineEnd: TPoint,
  vectorEditingNodeIds: string[],
  canvasRefs: TCanvasRefs,
): boolean => {
  const editingNodes = getVectorDivideEditingNodes(
    store.getState().design.pages[store.getState().design.activePageId].nodes,
    vectorEditingNodeIds,
  );
  const divideResults = findAllVectorDivideResults(editingNodes, lineStart, lineEnd);
  const dividedNodeIds = new Set(divideResults.map((result) => result.node.id));
  const connectedCutResults = findAllVectorConnectedCutResults(editingNodes, dividedNodeIds, lineStart, lineEnd);
  const didCut = divideResults.length > 0 || connectedCutResults.length > 0;

  if (didCut) {
    const totalOutputNodeCount = divideResults.reduce((sum, result) => sum + result.components.length, 0) + connectedCutResults.length;

    dispatchAsOneGestureIfMultiNode(dispatch, totalOutputNodeCount, () => {
      const newNodeIds = applyDivideResults(dispatch, divideResults);
      applyConnectedCutResults(dispatch, connectedCutResults);
      const touchedNodeIds = new Set([...dividedNodeIds, ...connectedCutResults.map((result) => result.node.id)]);
      const untouchedNodeIds = vectorEditingNodeIds.filter((id) => !touchedNodeIds.has(id));

      dispatch(setVectorEditingNodeIds([...untouchedNodeIds, ...touchedNodeIds, ...newNodeIds]));
    });

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = [];
    canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [];
    canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = [];
  }

  return didCut;
};
