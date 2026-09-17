// utils
import { getImageFillQuadVertices } from '../getImageFillQuadVertices';

const FULL_UV = { uMax: 1, uMin: 0, vMax: 1, vMin: 0 };

describe('getImageFillQuadVertices behaviors', () => {
  it('should lay out the quad corners in tl,tr,br,tl,br,bl order with matching UVs when unrotated', () => {
    // before
    const vertices = getImageFillQuadVertices({ height: 40, width: 40, x: 0, y: 0 }, FULL_UV, 0);

    // result
    expect(Array.from(vertices.slice(0, 4))).toEqual([0, 0, 0, 0]);
    expect(Array.from(vertices.slice(4, 8))).toEqual([40, 0, 1, 0]);
    expect(Array.from(vertices.slice(8, 12))).toEqual([40, 40, 1, 1]);
  });

  it('should rotate the quad geometry around its own center when given a quad rotation', () => {
    // before — a 40x40 rect centered at (20,20), rotated 90deg
    const vertices = getImageFillQuadVertices({ height: 40, width: 40, x: 0, y: 0 }, FULL_UV, 0, 90);

    // result — the tl corner (0,0) rotates to (40,0)
    expect(vertices[0]).toBeCloseTo(40);
    expect(vertices[1]).toBeCloseTo(0);
  });

  it('should leave the quad geometry untouched when quad rotation is 0, regardless of uv rotation', () => {
    // before
    const vertices = getImageFillQuadVertices({ height: 40, width: 40, x: 0, y: 0 }, FULL_UV, 90);

    // result — geometry positions unchanged, only the UVs rotate
    expect(Array.from(vertices.slice(0, 2))).toEqual([0, 0]);
    expect(Array.from(vertices.slice(4, 6))).toEqual([40, 0]);
    // the sampled UV at the tl corner is now the uv-rotated one (0,1) instead of (0,0)
    expect(Array.from(vertices.slice(2, 4))).toEqual([0, 1]);
  });
});
