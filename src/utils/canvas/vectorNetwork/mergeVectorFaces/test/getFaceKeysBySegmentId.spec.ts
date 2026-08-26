// utils
import { getFaceKeysBySegmentId } from '../getFaceKeysBySegmentId';
import { TVectorFace } from '../../deriveVectorFaces';

describe('getFaceKeysBySegmentId', () => {
  it('should return an empty map for an empty face list', () => {
    // before
    const result = getFaceKeysBySegmentId([]);

    // result
    expect(result.size).toBe(0);
  });

  it('should index a face’s key under every segment id in its comma-separated key', () => {
    // mock
    const faces: TVectorFace[] = [{ key: 's1,s2,s3', pieceKeys: [], points: [] }];

    // before
    const result = getFaceKeysBySegmentId(faces);

    // result
    expect(result.get('s1')).toEqual(new Set(['s1,s2,s3']));
    expect(result.get('s2')).toEqual(new Set(['s1,s2,s3']));
    expect(result.get('s3')).toEqual(new Set(['s1,s2,s3']));
  });

  it('should collect multiple face keys under a segment id they all share', () => {
    // mock
    const faces: TVectorFace[] = [
      { key: 's1,s2,s3', pieceKeys: [], points: [] },
      { key: 's1,s4,s5', pieceKeys: [], points: [] },
    ];

    // before
    const result = getFaceKeysBySegmentId(faces);

    // result
    expect(result.get('s1')).toEqual(new Set(['s1,s2,s3', 's1,s4,s5']));
    expect(result.get('s2')).toEqual(new Set(['s1,s2,s3']));
    expect(result.get('s4')).toEqual(new Set(['s1,s4,s5']));
  });
});
