// utils
import { remapFilledFaceKeysAfterSegmentSplit } from '../remapFilledFaceKeysAfterSegmentSplit';

const split = { newSegmentId: 's1b', newVertexId: 'vNew', originalEndId: 'v2', originalSegmentId: 's1', originalStartId: 'v1' };

describe('remapFilledFaceKeysAfterSegmentSplit', () => {
  it('should split a stale piece key spanning the original segment into two piece keys around the new midpoint vertex', () => {
    // mock — a triangle face whose 3rd side is the segment about to be split down the middle
    const filledFaceKeys = ['s1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]'];

    // result
    expect(remapFilledFaceKeysAfterSegmentSplit(filledFaceKeys, {}, split).filledFaceKeys).toEqual([
      's1[v:v1|v:vNew],s1b[v:v2|v:vNew],s2[v:v2|v:v3],s3[v:v1|v:v3]',
    ]);
  });

  it('should move a fill-color override from the stale loop key to the recomputed loop key', () => {
    // mock
    const filledFaceKeys = ['s1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]'];
    const fillByKey = { 's1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]': [{ color: '#D9D9D9', opacity: 100, type: 'solid' as const }] };

    // result
    const result = remapFilledFaceKeysAfterSegmentSplit(filledFaceKeys, fillByKey, split);

    expect(result.fillByKey).toEqual({ [result.filledFaceKeys[0]]: [{ color: '#D9D9D9', opacity: 100, type: 'solid' }] });
  });

  it('should leave a loop key untouched when it does not reference the split segment', () => {
    // mock
    const filledFaceKeys = ['s4[v:v4|v:v5],s5[v:v5|v:v6],s6[v:v4|v:v6]'];

    // result
    expect(remapFilledFaceKeysAfterSegmentSplit(filledFaceKeys, {}, split).filledFaceKeys).toEqual(filledFaceKeys);
  });

  it('should leave a loop key untouched when it references the split segment id but not its original full boundary', () => {
    // mock — e.g. the segment was already previously split, and this key already reflects the new topology
    const filledFaceKeys = ['s1[v:v1|v:vNew],s1b[v:v2|v:vNew],s2[v:v2|v:v3],s3[v:v1|v:v3]'];

    // result
    expect(remapFilledFaceKeysAfterSegmentSplit(filledFaceKeys, {}, split).filledFaceKeys).toEqual(filledFaceKeys);
  });
});
