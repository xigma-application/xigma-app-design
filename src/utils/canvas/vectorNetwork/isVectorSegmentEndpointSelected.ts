export const isVectorSegmentEndpointSelected = (segmentStartId: string, segmentEndId: string, selectedVertexIds: string[]): boolean =>
  selectedVertexIds.includes(segmentStartId) || selectedVertexIds.includes(segmentEndId);
