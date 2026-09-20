import { renderHook } from '@testing-library/react';

// hooks
import { useLayoutGuideSettingsPanel } from './useLayoutGuideSettingsPanel';

// types
import { LayoutGuideType } from 'types/design/enums';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';

describe('useLayoutGuideSettingsPanel', () => {
  it('should commit color, opacity and picker changes on top of the current guide', () => {
    // Step 1: Prepare
    const guide = createLayoutGuide(LayoutGuideType.grid);
    const onChange = vi.fn();
    const { result } = renderHook(() => useLayoutGuideSettingsPanel(guide, onChange));

    // Step 2: Commit each kind of change
    result.current.onCommitHex('#00ff00');
    result.current.onCommitAlpha(60);
    result.current.onPickerChange({ alpha: 10, hex: '#0000ff' });

    // Step 3: Assert
    expect(onChange).toHaveBeenNthCalledWith(1, { ...guide, color: '#00ff00' });
    expect(onChange).toHaveBeenNthCalledWith(2, { ...guide, opacity: 60 });
    expect(onChange).toHaveBeenNthCalledWith(3, { ...guide, color: '#0000ff', opacity: 10 });
  });

  it('should commit scrubbed numbers for the named field', () => {
    // Step 1: Prepare
    const guide = createLayoutGuide(LayoutGuideType.grid);
    const onChange = vi.fn();
    const { result } = renderHook(() => useLayoutGuideSettingsPanel(guide, onChange));

    // Step 2: Scrub size
    result.current.onScrub('size', 1)(24);

    // Step 3: Assert
    expect(onChange).toHaveBeenCalledWith({ ...guide, size: 24 });
  });
});
