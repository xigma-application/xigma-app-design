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
import { getDoubleClickedVectorNode } from './utils/getDoubleClickedVectorNode';
import { getNodeAtPoint } from '../../utils/getNodeAtPoint';

export const useVectorEditOnDoubleClick = (refs: TCanvasRefs): void => {
  const { selectedVectorHandlesRef, selectedVectorSegmentIdsRef, selectedVectorVertexIdsRef } = refs;
  const vectorEditingNodeIds = useAppSelector(selectVectorEditingNodeIds);
  const dispatch = useAppDispatch();

  const getTarget = (point: TPoint, state: RootState): TVectorNode | null =>
    getDoubleClickedVectorNode(point, selectOrderedNodes(state), selectViewport(state));

  const handleHit = (target: TVectorNode): void => {
    dispatch(setSelection([target.id]));
    dispatch(setVectorEditingNodeIds([target.id]));
    dispatch(setActiveTool(ToolName.move));
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
