import { TFunction } from 'i18next';

// utils
import { getTrackModeOptions } from '../getTrackModeOptions';

// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackViewModel } from '../../../../hooks/types';

const t = ((key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${JSON.stringify(options)}` : key) as unknown as TFunction;

const track = (overrides: Partial<TGridTrackViewModel> = {}): TGridTrackViewModel => ({
  index: 0,
  linkedIndices: [0],
  mode: SizingMode.fixed,
  resolvedSize: 100,
  value: 1,
  ...overrides,
});

describe('getTrackModeOptions', () => {
  it('should list the column icon set with its trigger labels and values', () => {
    const options = getTrackModeOptions(t, track(), 'column');

    expect(options.map((option) => ({ icon: option.icon, triggerLabel: option.triggerLabel, value: option.value }))).toEqual([
      { icon: 'FixedWidth', triggerLabel: 'Fixed', value: SizingMode.fixed },
      { icon: 'AutoWidth', triggerLabel: 'Hug', value: SizingMode.hug },
      { icon: 'FillHorizontal', triggerLabel: 'Fill', value: SizingMode.fill },
    ]);
  });

  it('should list the row icon set instead when the axis is row', () => {
    const options = getTrackModeOptions(t, track(), 'row');

    expect(options.map((option) => option.icon)).toEqual(['FixedHeight', 'AutoHeight', 'FillVertical']);
  });

  it("should label the fixed option with the track's rounded resolved size", () => {
    const options = getTrackModeOptions(t, track({ resolvedSize: 123.456 }), 'column');
    const fixedOption = options.find((option) => option.value === SizingMode.fixed);

    expect(fixedOption?.label).toContain('"value":123.46');
  });

  it("should label the hug and fill options with the track's own value, not its resolved size", () => {
    const options = getTrackModeOptions(t, track({ resolvedSize: 999, value: 2 }), 'column');
    const hugOption = options.find((option) => option.value === SizingMode.hug);
    const fillOption = options.find((option) => option.value === SizingMode.fill);

    expect(hugOption?.label).toContain('"value":2');
    expect(fillOption?.label).toContain('"value":2');
  });
});
