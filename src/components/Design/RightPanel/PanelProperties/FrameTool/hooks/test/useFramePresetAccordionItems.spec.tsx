import { render, renderHook } from '@testing-library/react';

// hooks
import { useFramePresetAccordionItems } from '../useFramePresetAccordionItems';

// others
import { FRAME_PRESET_GROUPS } from '../../../framePresetGroups';

describe('useFramePresetAccordionItems', () => {
  it('should return one accordion item per preset group', () => {
    // before
    const { result } = renderHook(() => useFramePresetAccordionItems());

    // result
    expect(result.current).toHaveLength(FRAME_PRESET_GROUPS.length);
  });

  it('should keep every group collapsed by default', () => {
    // before
    const { result } = renderHook(() => useFramePresetAccordionItems());

    // result
    expect(result.current[0]?.defaultExpanded).toBe(false);
    expect(result.current[1]?.defaultExpanded).toBe(false);
  });

  it('should translate the group label', () => {
    // before
    const { result } = renderHook(() => useFramePresetAccordionItems());

    // result
    expect(result.current[0]?.label).toBe('Phone');
  });

  it('should render one preset row per preset in the group content', () => {
    // before
    const { result } = renderHook(() => useFramePresetAccordionItems());
    const { getByText } = render(<div>{result.current[0]?.content}</div>);

    // result
    expect(getByText('iPhone 17')).toBeInTheDocument();
  });
});
