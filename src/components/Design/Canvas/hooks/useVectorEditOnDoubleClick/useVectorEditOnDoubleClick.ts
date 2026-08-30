import { useEffect } from 'react';

// store
import { selectOrderedNodes, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { setActiveTool, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { RootState, useAppDispatch, useAppSelector } from 'store';

// hooks
import { useDoubleClickActivation } from '../useDoubleClickActivation/useDoubleClickActivation';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { enterVectorEditMode } from '../../utils/enterVectorEditMode';
import { getDoubleClickedVectorNode } from './utils/getDoubleClickedVectorNode';
import { getNodeAtPoint } from '../../utils/getNodeAtPoint/getNodeAtPoint';

export const useVectorEditOnDoubleClick = (refs: TCanvasRefs): void => {
  const { selectedVectorHandlesRef, selectedVectorSegmentIdsRef, selectedVectorVertexIdsRef } = refs.vectorEdit;
  const vectorEditingNodeIds = useAppSelector(selectVectorEditingNodeIds);
  const dispatch = useAppDispatch();

  const getTarget = (point: TPoint, state: RootState): TVectorNode | null =>
    getDoubleClickedVectorNode(point, selectOrderedNodes(state), selectViewport(state));

  const handleHit = (target: TVectorNode): void => {
    dispatch(setSelection([target.id]));
    enterVectorEditMode(dispatch, [target.id]);
  };

  const getEmptySpaceTarget = (point: TPoint, state: RootState): true | null =>
    getNodeAtPoint(point, selectOrderedNodes(state), selectViewport(state)) ? null : true;

  const handleEmptySpaceHit = (): void => {
    dispatch(setActiveTool(ToolName.default));
    dispatch(setVectorEditingNodeIds([]));
  };

  useEffect(() => {
    selectedVectorVertexIdsRef.current = [];
    selectedVectorHandlesRef.current = [];
    selectedVectorSegmentIdsRef.current = [];
  }, [selectedVectorHandlesRef, selectedVectorSegmentIdsRef, selectedVectorVertexIdsRef, vectorEditingNodeIds]);
  useDoubleClickActivation(refs, vectorEditingNodeIds.length > 0, getTarget, handleHit);
  useDoubleClickActivation(refs, vectorEditingNodeIds.length === 0, getEmptySpaceTarget, handleEmptySpaceHit);
};
