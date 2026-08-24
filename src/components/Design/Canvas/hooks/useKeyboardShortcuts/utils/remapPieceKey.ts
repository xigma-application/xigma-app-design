const VERTEX_BOUNDARY_PATTERN = /^v:(.+)$/;
const CROSSING_BOUNDARY_PATTERN = /^x:(.+):(\d+)$/;

const remapBoundary = (boundary: string, idMap: Map<string, string>, segmentIdMap: Map<string, string>): string => {
  const vertexMatch = VERTEX_BOUNDARY_PATTERN.exec(boundary);

  if (vertexMatch) {
    return `v:${idMap.get(vertexMatch[1]) ?? vertexMatch[1]}`;
  }

  const crossingMatch = CROSSING_BOUNDARY_PATTERN.exec(boundary);

  if (crossingMatch) {
    return `x:${segmentIdMap.get(crossingMatch[1]) ?? crossingMatch[1]}:${crossingMatch[2]}`;
  }

  return boundary;
};

export const remapPieceKey = (pieceKey: string, idMap: Map<string, string>, segmentIdMap: Map<string, string>): string => {
  const [realSegmentId, boundaries] = [pieceKey.slice(0, pieceKey.indexOf('[')), pieceKey.slice(pieceKey.indexOf('[') + 1, -1)];
  const [start, end] = boundaries.split('|');
  const newRealSegmentId = segmentIdMap.get(realSegmentId) ?? realSegmentId;
  const newBoundaries = [remapBoundary(start, idMap, segmentIdMap), remapBoundary(end, idMap, segmentIdMap)].sort();

  return `${newRealSegmentId}[${newBoundaries.join('|')}]`;
};
