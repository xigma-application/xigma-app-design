import i18n from 'i18next';

// utils
import { buildTileTypeButtons } from '../buildTileTypeButtons';

const t = i18n.t;

describe('buildTileTypeButtons', () => {
  it('should return a Rectangular and a Circular button', () => {
    // action
    const buttons = buildTileTypeButtons(t);

    // result
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toMatchObject({ icon: 'RectangularPattern', value: 'rectangular' });
    expect(buttons[1]).toMatchObject({ icon: 'CircularPattern', value: 'circular' });
  });
});
