import { RefObject } from 'react';

// types
import { TVectorHandleHover, TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getVectorMultiSelectBox } from '../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectVertexIds } from '../../../../utils/getVectorMultiSelectVertexIds';
import { isVectorMultiSelectBoxEligible } from '../../../../utils/isVectorMultiSelectBoxEligible';

export const getVectorMultiSelectBoxForHover = (
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  vectorMultiSelectBoxRef: RefObject<TVectorMultiSelectBox | null>,
  selectedSegmentIds: string[] = [],
): TVectorMultiSelectBox | null => {
  const vertexIds = getVectorMultiSelectVertexIds(nodes, vectorEditingNodeIds, selectedVertexIds, selectedSegmentIds);

  return isVectorMultiSelectBoxEligible(vertexIds, selectedHandles)
    ? getVectorMultiSelectBox(nodes, vectorEditingNodeIds, vertexIds, selectedHandles, vectorMultiSelectBoxRef)
    : null;
};
