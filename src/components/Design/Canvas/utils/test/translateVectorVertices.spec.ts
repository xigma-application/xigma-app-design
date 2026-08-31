// utils
import { translateVectorVertices } from '../translateVectorVertices';

describe('translateVectorVertices', () => {
  it('should round the delta once and apply the same whole-pixel shift to every origin point, preserving their original relative fractional offsets', () => {
    // mock — v2's fractional part relative to v1 (.2, .4) must survive the shift unchanged
    const origins = { v1: { x: 0, y: 0 }, v2: { x: 10.2, y: -5.6 } };

    // before
    const translated = translateVectorVertices(origins, 2.6, 3.4);

    // result — delta rounds once to (3, 3), then adds unrounded to each origin
    expect(translated.v1).toEqual({ id: 'v1', x: 3, y: 3 });
    expect(translated.v2.id).toBe('v2');
    expect(translated.v2.x).toBeCloseTo(13.2);
    expect(translated.v2.y).toBeCloseTo(-2.6);
  });

  it('should re-attach the record key as id', () => {
    // mock
    const origins = { 'vertex-a': { x: 5, y: 5 } };

    // action
    const translated = translateVectorVertices(origins, 1, 1);

    // result
    expect(translated['vertex-a'].id).toBe('vertex-a');
  });
});
