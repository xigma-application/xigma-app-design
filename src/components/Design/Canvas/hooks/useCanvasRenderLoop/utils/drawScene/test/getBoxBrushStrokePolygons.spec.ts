// types
import { NodeType, StrokeMode } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getBoxBrushStrokePolygons } from '../getBoxBrushStrokePolygons';
import { memoizeBrushPolygons } from '../memoizeBrushPolygons';

const outer = [
  { x: -8, y: -8 },
  { x: 108, y: -8 },
  { x: 108, y: 108 },
  { x: -8, y: 108 },
];
const inner = [
  { x: 8, y: 8 },
  { x: 92, y: 8 },
  { x: 92, y: 92 },
  { x: 8, y: 92 },
];
const node = {
  fills: [],
  height: 100,
  id: 'a',
  name: 'Rect',
  rotation: 0,
  strokeMode: StrokeMode.brush,
  strokeWidth: 16,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
} as unknown as TRectangleNode;

const getBoxStrokePolygonsFor = (changes: Partial<TRectangleNode>): ReturnType<typeof getBoxBrushStrokePolygons> =>
  getBoxBrushStrokePolygons({ ...node, ...changes }, outer, inner);

describe('getBoxBrushStrokePolygons', () => {
  it('should draw a stretch brush as a ring with holes and a scatter brush as dot chunks', () => {
    // action
    const stretch = getBoxStrokePolygonsFor({ strokeBrush: 'heist' });
    const scatter = getBoxStrokePolygonsFor({ strokeBrush: 'bubblegum' });

    // result
    expect(stretch![0].length).toBeGreaterThan(50);
    expect(scatter!.length).toBeGreaterThan(5);
    expect(scatter![0].length).toBeGreaterThan(100);
  });

  it('should return null for an unknown brush and reuse the same result for the same input', () => {
    // result
    expect(getBoxStrokePolygonsFor({ strokeBrush: 'nope' })).toBeNull();
    expect(getBoxStrokePolygonsFor({ strokeBrush: 'heist' })).toBe(getBoxStrokePolygonsFor({ strokeBrush: 'heist' }));
  });
});

describe('memoizeBrushPolygons', () => {
  it('should compute once per key', () => {
    // before
    const compute = vi.fn(() => [[{ x: 0, y: 0 }]]);

    // action
    memoizeBrushPolygons('memo-key', compute);
    memoizeBrushPolygons('memo-key', compute);

    // result
    expect(compute).toHaveBeenCalledTimes(1);
  });
});
