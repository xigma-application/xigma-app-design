// utils
import { getVectorFaceVertexIds } from '../getVectorFaceVertexIds';
import { TVectorFace } from '../deriveVectorFaces/deriveVectorFaces';

describe('getVectorFaceVertexIds', () => {
  it('should return the deduped set of real vertex ids bounding the face', () => {
    // mock — a closed triangle, every boundary already a persisted vertex
    const face: TVectorFace = { key: 'k1', pieceKeys: ['s1[v:v1|v:v2]', 's2[v:v2|v:v3]', 's3[v:v1|v:v3]'], points: [] };

    // before
    const result = getVectorFaceVertexIds(face);

    // result
    expect(result.sort()).toEqual(['v1', 'v2', 'v3']);
  });

  it('should omit a boundary that only sits on a virtual, not-yet-persisted crossing', () => {
    // mock — one piece bounded by a real vertex and an un-persisted crossing (x: token)
    const face: TVectorFace = { key: 'k1', pieceKeys: ['s1[v:v1|x:s2:0]'], points: [] };

    // before
    const result = getVectorFaceVertexIds(face);

    // result
    expect(result).toEqual(['v1']);
  });

  it('should return an empty array when every boundary is a virtual crossing', () => {
    // mock
    const face: TVectorFace = { key: 'k1', pieceKeys: ['s1[x:s2:0|x:s3:0]'], points: [] };

    // before
    const result = getVectorFaceVertexIds(face);

    // result
    expect(result).toEqual([]);
  });
});
