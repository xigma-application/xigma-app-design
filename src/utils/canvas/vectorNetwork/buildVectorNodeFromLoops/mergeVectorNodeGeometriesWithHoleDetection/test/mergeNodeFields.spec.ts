// types
import { TVectorNode } from 'types/design/types';

// utils
import { mergeNodeFields } from '../mergeNodeFields';

describe('mergeNodeFields', () => {
  it('should merge the vertices, segments, filled faces and face fills of every node', () => {
    // mock
    const nodes = [
      { fillByKey: { k1: ['p1'] }, filledFaceKeys: ['k1'], segments: { s1: 's1' }, vertices: { v1: 'v1' } },
      { filledFaceKeys: ['k2'], segments: { s2: 's2' }, vertices: { v2: 'v2' } },
    ] as unknown as TVectorNode[];

    // result
    expect(mergeNodeFields(nodes)).toEqual({
      fillByKey: { k1: ['p1'] },
      filledFaceKeys: ['k1', 'k2'],
      segments: { s1: 's1', s2: 's2' },
      vertices: { v1: 'v1', v2: 'v2' },
    });
  });
});
