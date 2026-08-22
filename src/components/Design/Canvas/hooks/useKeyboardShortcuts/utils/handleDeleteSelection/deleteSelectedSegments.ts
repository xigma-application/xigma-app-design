// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { getRemainingVertices } from './getRemainingVertices';

export const deleteSelectedSegments = (dispatch: AppDispatch, owningNodes: TVectorNode[], selectedSegmentIds: string[]): void => {
  owningNodes.forEach((node) => {
    const segments = Object.fromEntries(Object.entries(node.segments).filter(([id]) => !selectedSegmentIds.includes(id)));
    const vertices = getRemainingVertices(node.vertices, segments);

    dispatch(updateNode({ changes: { segments, vertices }, id: node.id }));
  });
};
