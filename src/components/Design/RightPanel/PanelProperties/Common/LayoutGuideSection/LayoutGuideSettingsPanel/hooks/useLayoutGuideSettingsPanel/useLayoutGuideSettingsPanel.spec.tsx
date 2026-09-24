import { renderHook } from '@testing-library/react';

// hooks
import { useLayoutGuideSettingsPanel } from './useLayoutGuideSettingsPanel';

// types
import { LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';

const NO_MIXED_KEYS = new Set<keyof TLayoutGuide>();

describe('useLayoutGuideSettingsPanel', () => {
  it('should commit color, opacity and picker changes as patches', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() =>
      useLayoutGuideSettingsPanel(createLayoutGuide(LayoutGuideType.grid), NO_MIXED_KEYS, onChange, vi.fn()),
    );

    // action
    result.current.onCommitHex('#00ff00');
    result.current.onCommitAlpha(60);
    result.current.onPickerChange({ alpha: 10, hex: '#0000ff' });

    // result
    expect(onChange).toHaveBeenNthCalledWith(1, { color: '#00ff00' });
    expect(onChange).toHaveBeenNthCalledWith(2, { opacity: 60 });
    expect(onChange).toHaveBeenNthCalledWith(3, { color: '#0000ff', opacity: 10 });
  });

  it('should forward a scrub of the named field with its minimum', () => {
    // mock
    const onFieldScrub = vi.fn();

    // before
    const { result } = renderHook(() =>
      useLayoutGuideSettingsPanel(createLayoutGuide(LayoutGuideType.grid), NO_MIXED_KEYS, vi.fn(), onFieldScrub),
    );

    // action
    result.current.onScrub('size', 1)(24);

    // result
    expect(onFieldScrub).toHaveBeenCalledWith('size', 1, 24);
  });
});
