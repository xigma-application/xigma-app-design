// utils
import { translateVertices } from '../translateVertices';

describe('translateVertices', () => {
  it('should add the delta to every vertex while preserving ids', () => {
    // before
    const translated = translateVertices({ v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 5 } }, { x: 3, y: -2 });

    // result
    expect(translated).toEqual({ v1: { id: 'v1', x: 3, y: -2 }, v2: { id: 'v2', x: 13, y: 3 } });
  });
});
