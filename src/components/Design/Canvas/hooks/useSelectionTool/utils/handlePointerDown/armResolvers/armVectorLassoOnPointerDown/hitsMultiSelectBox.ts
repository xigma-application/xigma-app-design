// store
import { store } from 'store';

// types
import { TArmContext } from '../../types';

// utils
import { getVectorMultiSelectBox } from '../../../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectVertexIds } from '../../../../../../utils/getVectorMultiSelectVertexIds';
import { isPointOnVectorMultiSelectBox } from '../../../../../../utils/isPointOnVectorMultiSelectBox';
import { isVectorMultiSelectBoxEligible } from '../../../../../../utils/isVectorMultiSelectBoxEligible';

export const hitsMultiSelectBox = (context: TArmContext, vectorEditingNodeIds: string[]): boolean => {
  const { canvasRefs, point, viewport } = context;
  const state = store.getState();
  const selectedVertexIds = canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current;
  const selectedHandles = canvasRefs.vectorEdit.selectedVectorHandlesRef.current;
  const selectedSegmentIds = canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current;
  const vertexIds = getVectorMultiSelectVertexIds(state.design.nodes, vectorEditingNodeIds, selectedVertexIds, selectedSegmentIds);

  if (!isVectorMultiSelectBoxEligible(vertexIds, selectedHandles)) {
    return false;
  }

  const box = getVectorMultiSelectBox(
    state.design.nodes,
    vectorEditingNodeIds,
    vertexIds,
    selectedHandles,
    canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef,
  );

  return Boolean(box && isPointOnVectorMultiSelectBox(point, box.bounds, viewport, box.rotation));
};
