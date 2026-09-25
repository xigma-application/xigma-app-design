// utils
import { getStrokeJoinButtons } from '../getStrokeJoinButtons';

describe('getStrokeJoinButtons', () => {
  it('should list miter, bevel and round with their icons and labels', () => {
    // before
    const buttons = getStrokeJoinButtons((join) => `label-${join}`);

    // result
    expect(buttons.map((button) => [button.value, button.icon, button.ariaLabel, button.tooltip])).toEqual([
      ['miter', 'StrokeJoinMiter', 'label-miter', 'label-miter'],
      ['bevel', 'StrokeJoinBevel', 'label-bevel', 'label-bevel'],
      ['round', 'StrokeJoinRound', 'label-round', 'label-round'],
    ]);
  });
});
