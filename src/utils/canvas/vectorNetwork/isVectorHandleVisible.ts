// types
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorSegment } from 'types/design/types';

// utils
import { isVectorSegmentEndpointSelected } from './isVectorSegmentEndpointSelected';

export const isVectorHandleVisible = (
  segment: TVectorSegment,
  end: 'end' | 'start',
  selectedVertexIds: ReadonlySet<string>,
  oneHopVertexIds: ReadonlySet<string>,
  selectedSegmentIds: ReadonlySet<string>,
  selectedHandles: TVectorHandleHover[],
): boolean => {
  const isSegmentDirectlyTouchingSelection =
    isVectorSegmentEndpointSelected(segment.startId, segment.endId, selectedVertexIds) || selectedSegmentIds.has(segment.id);
  const vertexId = end === 'start' ? segment.startId : segment.endId;
  const isHandleSelected = selectedHandles.some((handle) => handle.segmentId === segment.id && handle.end === end);

  return isSegmentDirectlyTouchingSelection || oneHopVertexIds.has(vertexId) || isHandleSelected;
};
