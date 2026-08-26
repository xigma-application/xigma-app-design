export const isVectorSegmentEndpointSelected = (
  segmentStartId: string,
  segmentEndId: string,
  selectedVertexIds: ReadonlySet<string>,
): boolean => selectedVertexIds.has(segmentStartId) || selectedVertexIds.has(segmentEndId);
