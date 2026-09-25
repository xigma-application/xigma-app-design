// utils
import { getStrokeSettingsTabButtons } from '../getStrokeSettingsTabButtons';

describe('getStrokeSettingsTabButtons', () => {
  it('should list the basic, dynamic and brush tabs with their labels', () => {
    // before
    const buttons = getStrokeSettingsTabButtons((tab) => `label-${tab}`);

    // result
    expect(buttons.map((button) => [button.value, button.label, button.ariaLabel, button.tooltip])).toEqual([
      ['basic', 'label-basic', 'label-basic', 'label-basic'],
      ['dynamic', 'label-dynamic', 'label-dynamic', 'label-dynamic'],
      ['brush', 'label-brush', 'label-brush', 'label-brush'],
    ]);
  });
});
