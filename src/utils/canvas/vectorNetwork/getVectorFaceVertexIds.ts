// utils
import { TVectorFace } from './deriveVectorFaces/deriveVectorFaces';

const PIECE_KEY_PATTERN = /^(.+)\[(.+)\|(.+)]$/;
const VERTEX_BOUNDARY_PATTERN = /^v:(.+)$/;

const cache = new WeakMap<TVectorFace, string[]>();

export const getVectorFaceVertexIds = (face: TVectorFace): string[] => {
  const cached = cache.get(face);

  if (!cached) {
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

    const result = [...vertexIds];
    cache.set(face, result);

    return result;
  }

  return cached;
};
