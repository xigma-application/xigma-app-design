// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorConnectedCutResult, TVectorDivideResult } from './types';
import { TVectorNode } from 'types/design/types';

// utils
import { applyConnectedCutResults } from './applyConnectedCutResults';
import { applyDivideResults } from './applyDivideResults';
import { dispatchAsOneGestureIfMultiNode } from '../../../../../../utils/dispatchAsOneGestureIfMultiNode';
import { findVectorConnectedCutResult } from './findVectorConnectedCutResult';
import { findVectorDivideResult } from './findVectorDivideResult';
import { getVectorEditingNode } from '../../../../../../utils/getVectorEditingNode';

export const commitVectorDivide = (
  dispatch: AppDispatch,
  lineStart: TPoint,
  lineEnd: TPoint,
  vectorEditingNodeIds: string[],
  canvasRefs: TCanvasRefs,
): void => {
  const state = store.getState();
  const editingNodes = vectorEditingNodeIds
    .map((nodeId) => getVectorEditingNode(state.design.nodes, nodeId))
    .filter((node): node is TVectorNode => node !== null);
  const divideResults = editingNodes
    .map((node) => findVectorDivideResult(node, lineStart, lineEnd))
    .filter((result): result is TVectorDivideResult => result !== null);
  const dividedNodeIds = new Set(divideResults.map((result) => result.node.id));
  const connectedCutResults = editingNodes
    .filter((node) => !dividedNodeIds.has(node.id))
    .map((node) => findVectorConnectedCutResult(node, lineStart, lineEnd))
    .filter((result): result is TVectorConnectedCutResult => result !== null);

  if (divideResults.length > 0 || connectedCutResults.length > 0) {
    const totalOutputNodeCount = divideResults.reduce((sum, result) => sum + result.components.length, 0) + connectedCutResults.length;

    dispatchAsOneGestureIfMultiNode(dispatch, totalOutputNodeCount, () => {
      const newNodeIds = applyDivideResults(dispatch, divideResults);

      applyConnectedCutResults(dispatch, connectedCutResults);

      const touchedNodeIds = new Set([...dividedNodeIds, ...connectedCutResults.map((result) => result.node.id)]);
      const untouchedNodeIds = vectorEditingNodeIds.filter((id) => !touchedNodeIds.has(id));

      dispatch(setVectorEditingNodeIds([...untouchedNodeIds, ...touchedNodeIds, ...newNodeIds]));
    });

    canvasRefs.selectedVectorVertexIdsRef.current = [];
    canvasRefs.selectedVectorHandlesRef.current = [];
    canvasRefs.selectedVectorSegmentIdsRef.current = [];
  }
};
