// types
import { TRectangleNode } from 'types/design/types';

// utils
import { getUniformRingPolygons } from '../../getBoxStrokeRingPolygons/getUniformRingPolygons';
import { hasBatchableStroke } from '../hasBatchableStroke';

vi.mock('../../getBoxStrokeRingPolygons/getUniformRingPolygons', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../getBoxStrokeRingPolygons/getUniformRingPolygons')>();

  return { getUniformRingPolygons: vi.fn(original.getUniformRingPolygons) };
});

const paint = { color: '#000000', opacity: 100, type: 'solid' };

const createRectangle = (overrides: Record<string, unknown> = {}): TRectangleNode =>
  ({
    fills: [],
    height: 40,
    id: 'r',
    name: 'r',
    parentId: null,
    rotation: 0,
    strokeWidth: 2,
    strokes: [paint],
    type: 'rectangle',
    width: 60,
    x: 0,
    y: 0,
    ...overrides,
  }) as unknown as TRectangleNode;

describe('hasBatchableStroke', () => {
  it('should accept uniform solid stroke paints with a width', () => {
    // result
    expect(hasBatchableStroke(createRectangle())).toBe(true);
  });

  it.each([
    ['no width', { strokeWidth: 0 }],
    ['an unset width', { strokeWidth: undefined }],
    ['no stroke paints', { strokes: [] }],
    ['a legacy stroke color next to the paints', { strokeColor: '#ff0000' }],
    ['a non-solid paint', { strokes: [{ opacity: 100, type: 'image' }] }],
    ['a blend mode', { strokes: [{ ...paint, blendMode: 'multiply' }] }],
    ['a dashed style', { strokeStyle: 'dashed' }],
    ['custom side widths', { strokeSides: 'custom' }],
    ['a width that swallows the rectangle', { strokeWidth: 20 }],
  ])('should reject %s', (_, overrides) => {
    // result
    expect(hasBatchableStroke(createRectangle(overrides))).toBe(false);
  });

  it('should reject a ring whose outer and inner outlines have a different number of points', () => {
    // mock
    vi.mocked(getUniformRingPolygons).mockReturnValueOnce([[{ x: 0, y: 0 }], []]);

    // result
    expect(hasBatchableStroke(createRectangle())).toBe(false);
  });
});
