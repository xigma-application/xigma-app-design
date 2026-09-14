import i18n from 'i18next';

// utils
import { buildDirectionButtons } from '../buildDirectionButtons';

const t = i18n.t;

describe('buildDirectionButtons', () => {
  it('should return a Horizontal and a Vertical button', () => {
    // action
    const buttons = buildDirectionButtons(t);

    // result
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toMatchObject({ icon: 'ArrowRight', value: 'horizontal' });
    expect(buttons[1]).toMatchObject({ icon: 'ArrowDown', value: 'vertical' });
  });
});
