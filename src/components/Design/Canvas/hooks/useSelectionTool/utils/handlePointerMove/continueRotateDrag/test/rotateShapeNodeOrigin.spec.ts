// utils
import { rotateShapeNodeOrigin } from '../rotateShapeNodeOrigin';

describe('rotateShapeNodeOrigin', () => {
  it('should spin the node around its own center, position unchanged', () => {
    // mock — pivot equals the node's own center (50, 50)
    const origin = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // before
    const changes = rotateShapeNodeOrigin(origin, { x: 50, y: 50 }, 90);

    // result — position collapses back to the same x/y, only rotation changes
    expect(changes).toEqual({ rotation: 90, x: 0, y: 0 });
  });

  it('should accumulate on top of a node that already had a non-zero rotation', () => {
    // mock
    const origin = { height: 100, rotation: 30, width: 100, x: 0, y: 0 };

    // before
    const changes = rotateShapeNodeOrigin(origin, { x: 50, y: 50 }, 90);

    // result
    expect(changes.rotation).toBe(120);
  });

  it('should orbit a node around a shared pivot outside its own center', () => {
    // mock — the node's center (50, 50) sits directly west of the pivot (150, 50)
    const origin = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // before — a 90deg delta swings the node from west to north of the pivot
    const changes = rotateShapeNodeOrigin(origin, { x: 150, y: 50 }, 90);

    // result
    expect(changes).toEqual({ rotation: 90, x: 100, y: -100 });
  });
});
