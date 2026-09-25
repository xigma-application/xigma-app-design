// store
import { selectNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { RootState } from 'store';

// types
import { TCanvasRefs, TVectorMultiSelectBox } from 'types/design/canvas/types';

// utils
import { getVectorMultiSelectBox } from '../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectVertexIds } from '../../../../utils/getVectorMultiSelectVertexIds';
import { isVectorMultiSelectBoxEligible } from '../../../../utils/isVectorMultiSelectBoxEligible';

export const getVectorMultiSelectBoxForHover = (state: RootState, refs: TCanvasRefs): TVectorMultiSelectBox | null => {
  const nodes = selectNodes(state);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const selectedHandles = refs.vectorEdit.selectedVectorHandlesRef.current;
  const vertexIds = getVectorMultiSelectVertexIds(
    nodes,
    vectorEditingNodeIds,
    refs.vectorEdit.selectedVectorVertexIdsRef.current,
    refs.vectorEdit.selectedVectorSegmentIdsRef.current,
  );

  return isVectorMultiSelectBoxEligible(vertexIds, selectedHandles)
    ? getVectorMultiSelectBox(nodes, vectorEditingNodeIds, vertexIds, selectedHandles, refs.vectorMultiSelect.vectorMultiSelectBoxRef)
    : null;
};
