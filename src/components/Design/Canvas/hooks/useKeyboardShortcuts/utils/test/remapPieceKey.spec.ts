// utils
import { remapPieceKey } from '../remapPieceKey';

describe('remapPieceKey', () => {
  it('should remap the real segment id and both vertex boundary markers, re-sorted', () => {
    // mock
    const idMap = new Map([
      ['v1', 'w1'],
      ['v2', 'w2'],
    ]);
    const segmentIdMap = new Map([['s1', 't1']]);

    // action
    const result = remapPieceKey('s1[v:v1|v:v2]', idMap, segmentIdMap);

    // result
    expect(result).toBe('t1[v:w1|v:w2]');
  });

  it('should remap a crossing boundary marker onto the referenced segment id via the same segment map', () => {
    // mock
    const idMap = new Map([['v1', 'w1']]);
    const segmentIdMap = new Map([
      ['s1', 't1'],
      ['s2', 't2'],
    ]);

    // action
    const result = remapPieceKey('s1[v:v1|x:s2:0]', idMap, segmentIdMap);

    // result
    expect(result).toBe('t1[v:w1|x:t2:0]');
  });

  it('should leave an id untouched when it has no entry in the map', () => {
    // action
    const result = remapPieceKey('s1[v:v1|v:v2]', new Map(), new Map());

    // result
    expect(result).toBe('s1[v:v1|v:v2]');
  });
});
