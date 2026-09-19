// utils
import { getStrokeDirectionButtons } from '../getStrokeDirectionButtons';

describe('getStrokeDirectionButtons', () => {
  it('should offer a mirrored arrow for left and a plain arrow for right', () => {
    // before
    const buttons = getStrokeDirectionButtons((direction) => direction);

    // result
    expect(buttons.map((button) => [button.value, button.icon, button.iconFlipped])).toEqual([
      ['left', 'ArrowRight', true],
      ['right', 'ArrowRight', false],
    ]);
  });
});
