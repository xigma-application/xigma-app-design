// utils
import { getVectorFillCoveringQuad } from '../getVectorFillCoveringQuad';

describe('getVectorFillCoveringQuad', () => {
  it('should wrap the min/max bounds of all points across multiple faces into a 6-vertex covering quad', () => {
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
    const quad = getVectorFillCoveringQuad(faces);

    // result — minX=-5, minY=-3, maxX=10, maxY=20
    expect(quad).toEqual([-5, -3, 10, -3, 10, 20, -5, -3, 10, 20, -5, 20]);
  });

  it('should build the quad from the given node bounds instead of scanning the face points, when bounds are given', () => {
    // mock — face points would produce a totally different quad if actually scanned
    const faces = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 5 },
      ],
    ];
    const nodeBounds = { height: 30, width: 20, x: 5, y: 10 };

    // before
    const quad = getVectorFillCoveringQuad(faces, nodeBounds);

    // result — x=5, y=10, width=20, height=30 → maxX=25, maxY=40
    expect(quad).toEqual([5, 10, 25, 10, 25, 40, 5, 10, 25, 40, 5, 40]);
  });
});
