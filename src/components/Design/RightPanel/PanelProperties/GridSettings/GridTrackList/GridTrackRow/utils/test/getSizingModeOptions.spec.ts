import { TFunction } from 'i18next';

// utils
import { getSizingModeOptions } from '../getSizingModeOptions';

// types
import { SizingMode } from 'types/design/enums';

const t = ((key: string) => key) as unknown as TFunction;

describe('getSizingModeOptions', () => {
  it('should list fill, fixed and hug in that order, each labeled by its translation key', () => {
    expect(getSizingModeOptions(t)).toEqual([
      { label: expect.stringContaining('fill'), value: SizingMode.fill },
      { label: expect.stringContaining('fixed'), value: SizingMode.fixed },
      { label: expect.stringContaining('hug'), value: SizingMode.hug },
    ]);
  });
});
