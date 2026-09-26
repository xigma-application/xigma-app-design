// types
import { TAppearanceNode } from '../../../../../AppearanceSection/types';

// utils
import { getPanelPaints } from '../getPanelPaints';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const red = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];

describe('getPanelPaints', () => {
  it('should read the shared fill of a vector', () => {
    // result
    expect(getPanelPaints(makeSquareVector({ fillByKey: { a: red }, filledFaceKeys: ['a'] }), 'fills')).toEqual(red);
  });

  it('should read the stroke paints of a vector', () => {
    // result
    expect(getPanelPaints(makeSquareVector({ strokes: red }), 'strokes')).toEqual(red);
  });

  it('should read the paints of any other node', () => {
    // mock
    const node = { fills: red, type: 'rectangle' } as unknown as TAppearanceNode;

    // result
    expect(getPanelPaints(node, 'fills')).toEqual(red);
  });
});
