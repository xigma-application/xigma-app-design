// utils
import { bakeVectorNodeRotation } from '../../../../../../utils/bakeVectorNodeRotation';
import { getRotatedNodeChanges } from '../getRotatedNodeChanges';
import { rotateVectorNodeOrigin } from '../../../../../../utils/rotateVectorNodeOrigin';

describe('getRotatedNodeChanges', () => {
  it('should rotate a line origin by its endpoints', () => {
    // mock
    const origin = { x1: 100, x2: 100, y1: 0, y2: 100 };

    // before
    const changes = getRotatedNodeChanges(origin, { x: 100, y: 50 }, 90, false);

    // result
    expect(changes).toMatchObject({ x1: 150, x2: 50, y1: 50, y2: 50 });
  });

  it('should leave a single-selected vector origin untouched and accumulate onto its live rotation field', () => {
    // mock — origin already carries a rotation from a previous gesture; a fresh rotate must add to it,
    // not replace it (replacing it is the bug that made the outline snap back on a second grab)
    const origin = { rotation: 10, segments: {}, vertices: { v1: { id: 'v1', x: 100, y: 50 } } };

    // before
    const changes = getRotatedNodeChanges(origin, { x: 50, y: 50 }, 90, true);

    // result
    expect(changes).toEqual({ rotation: 100, segments: {}, vertices: { v1: { id: 'v1', x: 100, y: 50 } } });
  });

  it('should bake the delta into a group-selected vector origin by its vertices and reset rotation to 0', () => {
    // mock
    const origin = { rotation: 0, segments: {}, vertices: { v1: { id: 'v1', x: 100, y: 50 } } };

    // before
    const changes = getRotatedNodeChanges(origin, { x: 50, y: 50 }, 90, false);

    // result
    expect(changes).toMatchObject({ rotation: 0, vertices: { v1: { id: 'v1', x: 50, y: 100 } } });
  });

  it('should fold a group-selected vector origin’s own rotation in around its own bounds before rotating it around the external group pivot', () => {
    // mock — the origin itself is already tilted 90deg; a naive group rotate that ignored this would
    // silently drop that tilt instead of composing the two rotations
    const origin = { rotation: 90, segments: {}, vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } } };

    // before
    const changes = getRotatedNodeChanges(origin, { x: 0, y: 0 }, 45, false);

    // result — must match composing the same two rotations by hand: bake the origin's own 90deg around
    // its own bounds center first, then rotate that result around the external pivot by the 45deg delta
    const selfBaked = bakeVectorNodeRotation(origin);

    expect(changes).toEqual({ rotation: 0, ...rotateVectorNodeOrigin(selfBaked, { x: 0, y: 0 }, 45) });
  });

  it('should rotate a shape origin by its center, falling back to the default case', () => {
    // mock
    const origin = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // before
    const changes = getRotatedNodeChanges(origin, { x: 50, y: 50 }, 90, false);

    // result
    expect(changes).toEqual({ rotation: 90, x: 0, y: 0 });
  });
});
