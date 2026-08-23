// utils
import { TVectorFace } from './deriveVectorFaces';

const PIECE_KEY_PATTERN = /^(.+)\[(.+)\|(.+)]$/;
const VERTEX_BOUNDARY_PATTERN = /^v:(.+)$/;

export const getVectorFaceVertexIds = (face: TVectorFace): string[] => {
  const vertexIds = new Set<string>();

  face.pieceKeys.forEach((pieceKey) => {
    const match = PIECE_KEY_PATTERN.exec(pieceKey);

    [match?.[2], match?.[3]].forEach((boundary) => {
      const vertexMatch = boundary && VERTEX_BOUNDARY_PATTERN.exec(boundary);

      if (vertexMatch) {
        vertexIds.add(vertexMatch[1]);
      }
    });
  });

  return [...vertexIds];
};
