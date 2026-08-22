import { RefObject } from 'react';

// types
import { TVectorHandleHover, TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorMultiSelectBox } from '../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectVertexIds } from '../../../../utils/getVectorMultiSelectVertexIds';
import { isVectorMultiSelectBoxEligible } from '../../../../utils/isVectorMultiSelectBoxEligible';

export const getVectorMultiSelectBoxForHover = (
  vectorEditingNode: TVectorNode | null,
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  vectorMultiSelectBoxRef: RefObject<TVectorMultiSelectBox | null>,
  selectedSegmentIds: string[] = [],
): TVectorMultiSelectBox | null => {
  const vertexIds = vectorEditingNode
    ? getVectorMultiSelectVertexIds(vectorEditingNode, selectedVertexIds, selectedSegmentIds)
    : selectedVertexIds;

  return vectorEditingNode && isVectorMultiSelectBoxEligible(vertexIds, selectedHandles)
    ? getVectorMultiSelectBox(vectorEditingNode, vertexIds, selectedHandles, vectorMultiSelectBoxRef)
    : null;
};
