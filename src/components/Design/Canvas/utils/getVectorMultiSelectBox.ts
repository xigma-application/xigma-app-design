import { RefObject } from 'react';

// types
import { TVectorHandleHover, TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getVectorMultiSelectBounds } from 'utils/canvas/vectorNetwork/getVectorMultiSelectBounds';
import { getVectorMultiSelectPoints } from './getVectorMultiSelectPoints';
import { getVectorMultiSelectSelectionKey } from './getVectorMultiSelectSelectionKey';

export const getVectorMultiSelectBox = (
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  boxRef: RefObject<TVectorMultiSelectBox | null>,
): TVectorMultiSelectBox | null => {
  const selectionKey = getVectorMultiSelectSelectionKey(selectedVertexIds, selectedHandles);

  if (boxRef.current?.selectionKey === selectionKey) {
    return boxRef.current;
  }

  const points = getVectorMultiSelectPoints(nodes, vectorEditingNodeIds, selectedVertexIds, selectedHandles);
  const bounds = getVectorMultiSelectBounds(points);

  boxRef.current = bounds ? { bounds, rotation: 0, selectionKey } : null;

  return boxRef.current;
};
