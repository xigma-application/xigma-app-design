import { RefObject } from 'react';

// types
import { TVectorHandleHover, TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorMultiSelectBounds } from 'utils/canvas/vectorNetwork/getVectorMultiSelectBounds';
import { getVectorMultiSelectSelectionKey } from './getVectorMultiSelectSelectionKey';

export const getVectorMultiSelectBox = (
  node: TVectorNode,
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  boxRef: RefObject<TVectorMultiSelectBox | null>,
): TVectorMultiSelectBox | null => {
  const selectionKey = getVectorMultiSelectSelectionKey(selectedVertexIds, selectedHandles);

  if (boxRef.current?.selectionKey === selectionKey) {
    return boxRef.current;
  }

  const bounds = getVectorMultiSelectBounds(node, selectedVertexIds, selectedHandles);

  boxRef.current = bounds ? { bounds, rotation: 0, selectionKey } : null;

  return boxRef.current;
};
