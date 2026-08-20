import { RefObject } from 'react';

// types
import { TVectorHandleHover, TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorMultiSelectBox } from '../../../../utils/getVectorMultiSelectBox';
import { isVectorMultiSelectBoxEligible } from '../../../../utils/isVectorMultiSelectBoxEligible';

export const getVectorMultiSelectBoxForHover = (
  vectorEditingNode: TVectorNode | null,
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  vectorMultiSelectBoxRef: RefObject<TVectorMultiSelectBox | null>,
): TVectorMultiSelectBox | null =>
  vectorEditingNode && isVectorMultiSelectBoxEligible(selectedVertexIds, selectedHandles)
    ? getVectorMultiSelectBox(vectorEditingNode, selectedVertexIds, selectedHandles, vectorMultiSelectBoxRef)
    : null;
