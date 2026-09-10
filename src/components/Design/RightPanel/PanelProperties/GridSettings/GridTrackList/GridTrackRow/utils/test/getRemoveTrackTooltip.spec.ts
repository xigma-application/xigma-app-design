import { TFunction } from 'i18next';

// utils
import { getRemoveTrackTooltip } from '../getRemoveTrackTooltip';

// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackViewModel } from '../../../../hooks/types';

const t = ((key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${JSON.stringify(options)}` : key) as unknown as TFunction;

const track = (overrides: Partial<TGridTrackViewModel> = {}): TGridTrackViewModel => ({
  index: 0,
  linkedIndices: [0],
  mode: SizingMode.fill,
  resolvedSize: 100,
  value: 1,
  ...overrides,
});

describe('getRemoveTrackTooltip', () => {
  it('should use the column wording with a 1-based position when the row is not part of a multi-selection', () => {
    const result = getRemoveTrackTooltip(t, 'column', track({ index: 1 }), 3, false, 1);

    expect(result).toContain('removeColumnTooltip');
    expect(result).toContain('"position":2');
    expect(result).toContain('"total":3');
  });

  it('should use the row wording when the axis is row', () => {
    const result = getRemoveTrackTooltip(t, 'row', track({ index: 0 }), 2, false, 1);

    expect(result).toContain('removeRowTooltip');
  });

  it('should switch to the bulk wording when the row is selected and part of a multi-selection', () => {
    const result = getRemoveTrackTooltip(t, 'column', track({ index: 0 }), 4, true, 2);

    expect(result).toContain('removeColumnsTooltip');
    expect(result).toContain('"count":2');
  });

  it('should keep the single-track wording when the row itself is not selected, even with a multi-selection elsewhere', () => {
    const result = getRemoveTrackTooltip(t, 'column', track({ index: 2 }), 4, false, 2);

    expect(result).toContain('removeColumnTooltip');
    expect(result).toContain('"position":3');
  });
});
