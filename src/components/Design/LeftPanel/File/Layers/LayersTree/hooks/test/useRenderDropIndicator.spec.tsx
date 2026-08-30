import { render, renderHook } from '@testing-library/react';

// hooks
import { useRenderDropIndicator } from '../useRenderDropIndicator';

describe('useRenderDropIndicator', () => {
  it('should render a LayersTreeDropIndicator at the given depth', () => {
    // before
    const { result } = renderHook(() => useRenderDropIndicator());
    const { container } = render(<>{result.current(2)}</>);

    // result
    const indicator = container.querySelector('[class*="LayersTreeDropIndicator"]') as HTMLElement;
    expect(indicator).toBeInTheDocument();
    expect(indicator.style.marginLeft).not.toBe('');
  });
});
