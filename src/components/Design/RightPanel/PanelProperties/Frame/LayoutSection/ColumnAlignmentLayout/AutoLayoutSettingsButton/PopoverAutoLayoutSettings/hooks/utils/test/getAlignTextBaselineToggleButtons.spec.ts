import i18n from 'i18next';

// utils
import { getAlignTextBaselineToggleButtons } from '../getAlignTextBaselineToggleButtons';

const t = i18n.t;

describe('getAlignTextBaselineToggleButtons', () => {
  it('should build an off/on toggle button pair with the matching icon per value', () => {
    // action
    const result = getAlignTextBaselineToggleButtons(t);

    // result
    expect(result.map((button) => [button.value, button.icon])).toEqual([
      ['off', 'Minus'],
      ['on', 'Check'],
    ]);
  });

  it('should translate each button aria label', () => {
    // action
    const result = getAlignTextBaselineToggleButtons(t);

    // result
    expect(result.map((button) => button.ariaLabel)).toEqual(['Off', 'On']);
  });

  it('should translate each button tooltip', () => {
    // action
    const result = getAlignTextBaselineToggleButtons(t);

    // result
    expect(result.map((button) => button.tooltip)).toEqual(['Disabled', 'Enabled']);
  });
});
