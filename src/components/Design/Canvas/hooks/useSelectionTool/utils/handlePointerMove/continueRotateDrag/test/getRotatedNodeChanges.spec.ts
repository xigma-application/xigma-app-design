// types
import { TVectorNode } from 'types/design/types';

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

  it('should keep the turn of a group-selected vector in its rotation and move its vertices along the orbit around the group pivot', () => {
    // mock
    const origin = { rotation: 0, segments: {}, vertices: { v1: { id: 'v1', x: 100, y: 50 } } };

    // before
    const changes = getRotatedNodeChanges(origin, { x: 50, y: 50 }, 90, false) as TVectorNode;

    // result — not rounded, so checked with a tolerance for floating-point noise from Math.cos(90deg) not being an exact 0
    expect(changes.rotation).toBe(90);
    expect(changes.vertices.v1.x).toBeCloseTo(50);
    expect(changes.vertices.v1.y).toBeCloseTo(100);
  });

  it('should draw a group-selected vector that is already tilted exactly where composing both turns by hand puts it', () => {
    // mock — the origin itself is already tilted 90deg; the result must keep that tilt and add the delta
    const origin = { rotation: 90, segments: {}, vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } } };

    // before
    const changes = getRotatedNodeChanges(origin, { x: 0, y: 0 }, 45, false) as TVectorNode;

    // result — baking the new rotation lands on the same points as baking the old one and then turning it around the pivot
    const drawn = bakeVectorNodeRotation(changes).vertices;
    const expected = rotateVectorNodeOrigin(bakeVectorNodeRotation(origin), { x: 0, y: 0 }, 45).vertices;

    expect(changes.rotation).toBe(135);
    ['v1', 'v2'].forEach((id) => {
      expect(drawn[id].x).toBeCloseTo(expected[id].x);
      expect(drawn[id].y).toBeCloseTo(expected[id].y);
    });
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
