export const getVisualSelectedVectorVertexIds = (selectedVertexIds: string[], penActiveVertexId: string | null): string[] =>
  penActiveVertexId ? [...selectedVertexIds, penActiveVertexId] : selectedVertexIds;
