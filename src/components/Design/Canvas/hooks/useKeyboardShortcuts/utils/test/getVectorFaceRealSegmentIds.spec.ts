// types
import { TVectorFace } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';

// utils
import { getVectorFaceRealSegmentIds } from '../getVectorFaceRealSegmentIds';

describe('getVectorFaceRealSegmentIds', () => {
  it('should strip the boundary suffix off every piece key and dedupe the result', () => {
    // mock
    const face: TVectorFace = { key: '', pieceKeys: ['s1[v:v1|v:v2]', 's1[v:v2|v:v1]', 's2[v:v1|v:v2]'], points: [] };

    // action
    const result = getVectorFaceRealSegmentIds(face);

    // result
    expect(result).toEqual(['s1', 's2']);
  });

  it('should return an empty array for a face with no piece keys', () => {
    // mock
    const face: TVectorFace = { key: '', pieceKeys: [], points: [] };

    // action
    const result = getVectorFaceRealSegmentIds(face);

    // result
    expect(result).toEqual([]);
  });
});
