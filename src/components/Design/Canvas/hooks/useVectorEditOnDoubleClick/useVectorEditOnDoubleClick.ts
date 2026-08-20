import { useEffect } from 'react';

// store
import { selectOrderedNodes, selectVectorEditingNodeId, selectViewport } from 'store/design/selectors';
import { setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { RootState, useAppDispatch, useAppSelector } from 'store';

// hooks
import { useDoubleClickActivation } from '../useDoubleClickActivation/useDoubleClickActivation';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getDoubleClickedVectorNode } from './utils/getDoubleClickedVectorNode';
import { getNodeAtPoint } from '../../utils/getNodeAtPoint';

export const useVectorEditOnDoubleClick = (refs: TCanvasRefs): void => {
  const { selectedVectorHandlesRef, selectedVectorSegmentIdsRef, selectedVectorVertexIdsRef } = refs;
  const vectorEditingNodeId = useAppSelector(selectVectorEditingNodeId);
  const dispatch = useAppDispatch();

  const getTarget = (point: TPoint, state: RootState): TVectorNode | null =>
    getDoubleClickedVectorNode(point, selectOrderedNodes(state), selectViewport(state));

  const handleHit = (target: TVectorNode): void => {
    dispatch(setSelection([target.id]));
    dispatch(setVectorEditingNodeId(target.id));
  };

  const getEmptySpaceTarget = (point: TPoint, state: RootState): true | null =>
    getNodeAtPoint(point, selectOrderedNodes(state), selectViewport(state)) ? null : true;

  const handleEmptySpaceHit = (): void => {
    dispatch(setVectorEditingNodeId(null));
  };

  useEffect(() => {
    selectedVectorVertexIdsRef.current = [];
    selectedVectorHandlesRef.current = [];
    selectedVectorSegmentIdsRef.current = [];
  }, [selectedVectorHandlesRef, selectedVectorSegmentIdsRef, selectedVectorVertexIdsRef, vectorEditingNodeId]);

  useDoubleClickActivation(refs, Boolean(vectorEditingNodeId), getTarget, handleHit);
  useDoubleClickActivation(refs, !vectorEditingNodeId, getEmptySpaceTarget, handleEmptySpaceHit);
};
