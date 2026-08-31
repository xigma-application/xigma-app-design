// types
import { NodeType } from 'types/design/enums';

// utils
import { buildVectorNodeFromLoops } from '../buildVectorNodeFromLoops';
import { groupFilledFacesByColor } from 'utils/canvas/drawVectorNode/groupFilledFacesByColor';

const BASE = { id: 'outline-1', name: 'Rectangle outline', parentId: 'frame-1', rotation: 12 };

const SQUARE = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

describe('buildVectorNodeFromLoops', () => {
  it('should build a single-face vector node from one closed loop', () => {
    // action
    const result = buildVectorNodeFromLoops([SQUARE], BASE, '#ff0000');

    // result
    expect(result?.type).toBe(NodeType.vector);
    expect(result?.id).toBe('outline-1');
    expect(result?.name).toBe('Rectangle outline');
    expect(result?.parentId).toBe('frame-1');
    expect(result?.rotation).toBe(12);
    expect(result?.fillColor).toBe('#ff0000');
    expect(result?.strokeWidth).toBe(0);
    expect(Object.keys(result?.vertices ?? {})).toHaveLength(4);
    expect(result?.filledFaceKeys).toHaveLength(1);
  });

  it('should build a ring-shaped vector node from two nested closed loops', () => {
    // mock — an inner square nested inside the outer one
    const innerSquare = [
      { x: 2, y: 2 },
      { x: 8, y: 2 },
      { x: 8, y: 8 },
      { x: 2, y: 8 },
    ];

    // action
    const result = buildVectorNodeFromLoops([SQUARE, innerSquare], BASE, '#ff0000');

    // result — outer and inner loop each stay their own independent face (no bridge segment);
    // `drawVectorFill`'s stencil pass XORs their overlap into a ring, so both must independently
    // resolve back to real points via `groupFilledFacesByColor`, not just report a key
    expect(Object.keys(result?.vertices ?? {})).toHaveLength(8);
    expect(Object.keys(result?.segments ?? {})).toHaveLength(8);
    expect(result?.filledFaceKeys).toHaveLength(2);

    const facesByColor = groupFilledFacesByColor(result!);

    expect(facesByColor.get('#ff0000')).toHaveLength(2);
  });

  it('should drop a degenerate loop with fewer than 3 points', () => {
    // action
    const result = buildVectorNodeFromLoops(
      [
        SQUARE,
        [
          { x: 5, y: 5 },
          { x: 6, y: 6 },
        ],
      ],
      BASE,
      '#ff0000',
    );

    // result — only the valid square loop's 4 vertices remain
    expect(Object.keys(result?.vertices ?? {})).toHaveLength(4);
  });

  it('should return null when every loop is degenerate', () => {
    // action
    const result = buildVectorNodeFromLoops([[{ x: 0, y: 0 }]], BASE, '#ff0000');

    // result
    expect(result).toBeNull();
  });

  it('should return null when given no loops at all', () => {
    // action
    const result = buildVectorNodeFromLoops([], BASE, '#ff0000');

    // result
    expect(result).toBeNull();
  });
});
