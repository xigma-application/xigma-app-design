// utils
import { getStrokeDashCapButtons } from '../getStrokeDashCapButtons';

describe('getStrokeDashCapButtons', () => {
  it('should list none, square and round with their icons', () => {
    // before
    const buttons = getStrokeDashCapButtons((cap) => cap);

    // result
    expect(buttons.map((button) => [button.value, button.icon])).toEqual([
      ['none', 'StrokeCapNone'],
      ['square', 'StrokeCapSquare'],
      ['round', 'StrokeCapRound'],
    ]);
  });
});
