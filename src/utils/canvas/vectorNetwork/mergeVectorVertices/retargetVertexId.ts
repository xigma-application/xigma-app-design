export const retargetVertexId = (id: string, sourceVertexId: string, targetVertexId: string): string =>
  id === targetVertexId ? sourceVertexId : id;
