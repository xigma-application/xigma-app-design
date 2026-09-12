import { TFunction } from 'i18next';

// types
import { SizingMode } from 'types/design/enums';

// utils
import { getGridTrackModeMenuOptions } from '../getGridTrackModeMenuOptions';

const t = ((key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${JSON.stringify(options)}` : key) as unknown as TFunction;

describe('getGridTrackModeMenuOptions', () => {
  it('should list the column icon set with its values', () => {
    const options = getGridTrackModeMenuOptions(t, 'column', 100, 1);

    expect(options.map((option) => ({ icon: option.icon, value: option.value }))).toEqual([
      { icon: 'FixedWidth', value: SizingMode.fixed },
      { icon: 'AutoWidth', value: SizingMode.hug },
      { icon: 'FillHorizontal', value: SizingMode.fill },
    ]);
  });

  it('should list the row icon set instead when the axis is row', () => {
    const options = getGridTrackModeMenuOptions(t, 'row', 100, 1);

    expect(options.map((option) => option.icon)).toEqual(['FixedHeight', 'AutoHeight', 'FillVertical']);
  });

  it('should label the fixed option with the rounded resolved size', () => {
    const options = getGridTrackModeMenuOptions(t, 'column', 123.456, 1);
    const fixedOption = options.find((option) => option.value === SizingMode.fixed);

    expect(fixedOption?.label).toContain('"value":123.46');
  });

  it('should label the hug and fill options with the track value, not the resolved size', () => {
    const options = getGridTrackModeMenuOptions(t, 'column', 999, 2);
    const hugOption = options.find((option) => option.value === SizingMode.hug);
    const fillOption = options.find((option) => option.value === SizingMode.fill);

    expect(hugOption?.label).toContain('"value":2');
    expect(fillOption?.label).toContain('"value":2');
  });

  it('should default the fill/hug label value to 1 when no track value is given', () => {
    const options = getGridTrackModeMenuOptions(t, 'column', 999, undefined);
    const fillOption = options.find((option) => option.value === SizingMode.fill);

    expect(fillOption?.label).toContain('"value":1');
  });
});
