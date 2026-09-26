// types
import { TAppearanceNode } from '../../../../../AppearanceSection/types';

// utils
import { hasMixedPaints } from '../hasMixedPaints';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const node = (color: string): TAppearanceNode =>
  ({
    fills: [{ color, opacity: 100, type: 'solid' }],
    strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  }) as unknown as TAppearanceNode;

describe('hasMixedPaints', () => {
  it('should report nodes whose paints differ', () => {
    // result
    expect(hasMixedPaints([node('#111111'), node('#222222')], 'fills')).toBe(true);
  });

  it('should report a vector whose areas have different fills', () => {
    // mock
    const vector = makeSquareVector({
      fillByKey: { a: [{ color: '#111111', opacity: 100, type: 'solid' }], b: [] },
      filledFaceKeys: ['a', 'b'],
    });

    // result
    expect(hasMixedPaints([vector], 'fills')).toBe(true);
  });

  it('should not report nodes with equal paints', () => {
    // result
    expect(hasMixedPaints([node('#111111'), node('#222222')], 'strokes')).toBe(false);
  });
});
