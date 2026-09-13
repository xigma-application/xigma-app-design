// utils
import { getVectorFillBounds } from '../getVectorFillBounds';

describe('getVectorFillBounds', () => {
  it('should scan the min/max bounds of all points across multiple faces when no node bounds are given', () => {
    // mock
    const faces = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 5 },
      ],
      [
        { x: -5, y: 20 },
        { x: 8, y: -3 },
      ],
    ];

    // before
    const bounds = getVectorFillBounds(faces);

    // result
    expect(bounds).toEqual({ height: 23, width: 15, x: -5, y: -3 });
  });

  it('should return the given node bounds unchanged instead of scanning the face points', () => {
    // mock — face points would produce a totally different bounds if actually scanned
    const faces = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 5 },
      ],
    ];
    const nodeBounds = { height: 30, width: 20, x: 5, y: 10 };

    // before
    const bounds = getVectorFillBounds(faces, nodeBounds);

    // result
    expect(bounds).toBe(nodeBounds);
  });
});
