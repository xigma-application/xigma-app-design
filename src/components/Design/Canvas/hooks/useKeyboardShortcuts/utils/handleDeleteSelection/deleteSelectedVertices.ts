// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { getRemainingSegments } from './getRemainingSegments';
import { getRemainingVertices } from 'utils/canvas/vectorNetwork/getRemainingVertices';

export const deleteSelectedVertices = (dispatch: AppDispatch, owningNodes: TVectorNode[], selectedVertexIds: string[]): void => {
  owningNodes.forEach((node) => {
    const verticesAfterDeletion = Object.fromEntries(Object.entries(node.vertices).filter(([id]) => !selectedVertexIds.includes(id)));
    const segments = getRemainingSegments(node, selectedVertexIds);
    const vertices = getRemainingVertices(verticesAfterDeletion, segments);

    dispatch(updateNode({ changes: { segments, vertices }, id: node.id }));
  });
};
