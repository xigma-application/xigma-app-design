// utils
import { translateVectorVertices } from '../translateVectorVertices';

describe('translateVectorVertices', () => {
  it('should add the delta to every origin point, round the result, and re-attach the record key as id', () => {
    // mock
    const origins = { v1: { x: 0, y: 0 }, v2: { x: 10.2, y: -5.6 } };

    // before
    const translated = translateVectorVertices(origins, 2.6, 3.4);

    // result
    expect(translated).toEqual({
      v1: { id: 'v1', x: 3, y: 3 },
      v2: { id: 'v2', x: 13, y: -2 },
    });
  });
});
