// types
import { TBatchShape } from '../types';

// utils
import { getShapeStrokeReach } from '../getShapeStrokeReach';

const shape = (overrides: Record<string, unknown>): TBatchShape => ({ type: 'rectangle', ...overrides }) as unknown as TBatchShape;

describe('getShapeStrokeReach', () => {
  it('should be the stroke width for a rectangle with stroke paints', () => {
    // result
    expect(getShapeStrokeReach(shape({ strokeWidth: 5, strokes: [{ type: 'solid' }] }))).toBe(5);
  });

  it.each([
    ['an ellipse', { type: 'ellipse' }],
    ['a rectangle without stroke paints', { strokeWidth: 5 }],
    ['an empty paint list', { strokeWidth: 5, strokes: [] }],
    ['no width', { strokes: [{ type: 'solid' }] }],
  ])('should be zero for %s', (_, overrides) => {
    // result
    expect(getShapeStrokeReach(shape(overrides))).toBe(0);
  });
});
