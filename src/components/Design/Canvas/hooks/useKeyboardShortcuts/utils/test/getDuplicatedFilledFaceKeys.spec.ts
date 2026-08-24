// utils
import { getDuplicatedFilledFaceKeys } from '../getDuplicatedFilledFaceKeys';

describe('getDuplicatedFilledFaceKeys', () => {
  it('should return an empty array when nothing was filled', () => {
    // action
    const result = getDuplicatedFilledFaceKeys([], new Map(), new Map());

    // result
    expect(result).toEqual([]);
  });

  it('should remap every piece key in a captured face onto the fresh ids and re-sort the loop key', () => {
    // mock — the real "two curves between the same two points" shape reported live: duplicating it
    // previously left the clone unfilled because getDuplicatedFilledFaceKeys re-derived faces on the
    // merged node instead of remapping the already-known-good original key
    const pieceKeys = ['s1[v:v1|v:v2]', 's2[v:v1|v:v2]'];
    const idMap = new Map([
      ['v1', 'w1'],
      ['v2', 'w2'],
    ]);
    const segmentIdMap = new Map([
      ['s1', 't1'],
      ['s2', 't2'],
    ]);

    // action
    const result = getDuplicatedFilledFaceKeys([pieceKeys], idMap, segmentIdMap);

    // result
    expect(result).toEqual(['t1[v:w1|v:w2],t2[v:w1|v:w2]']);
  });

  it('should remap multiple captured faces independently', () => {
    // mock
    const idMap = new Map([
      ['v1', 'w1'],
      ['v2', 'w2'],
      ['v3', 'w3'],
      ['v4', 'w4'],
    ]);
    const segmentIdMap = new Map([
      ['s1', 't1'],
      ['s2', 't2'],
    ]);

    // action
    const result = getDuplicatedFilledFaceKeys([['s1[v:v1|v:v2]'], ['s2[v:v3|v:v4]']], idMap, segmentIdMap);

    // result
    expect(result).toEqual(['t1[v:w1|v:w2]', 't2[v:w3|v:w4]']);
  });
});
