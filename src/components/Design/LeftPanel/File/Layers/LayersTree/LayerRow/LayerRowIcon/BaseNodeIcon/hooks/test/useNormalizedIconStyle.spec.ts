import { createRef, RefObject } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useNormalizedIconStyle } from '../useNormalizedIconStyle';

const createSvgRef = (viewBox: string): RefObject<SVGSVGElement | null> => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox);
  return { current: svg };
};

describe('useNormalizedIconStyle', () => {
  it('returns undefined while the ref has not attached to a rendered icon yet', () => {
    // before
    const { result } = renderHook(() => useNormalizedIconStyle(createRef<SVGSVGElement>(), 'Group', 12));

    // result
    expect(result.current).toBeUndefined();
  });

  it('measures the rendered icon and returns its normalized centering transform', () => {
    // mock
    const svgRef = createSvgRef('0 0 20 20');
    vi.spyOn(svgRef.current!, 'getBBox').mockReturnValue({ height: 10, width: 10, x: 3, y: 3 } as DOMRect);

    // before
    const { result } = renderHook(() => useNormalizedIconStyle(svgRef, 'Group', 10));

    // result
    expect(result.current).toEqual({ transform: 'translate(1px, 1px) scale(2)', transformOrigin: '4px 4px' });
  });

  it('remeasures when the icon name changes', () => {
    // mock
    const svgRef = createSvgRef('0 0 20 20');
    const getBBox = vi.spyOn(svgRef.current!, 'getBBox');
    getBBox.mockReturnValue({ height: 10, width: 10, x: 3, y: 3 } as DOMRect);

    // before
    const { rerender } = renderHook(({ name }) => useNormalizedIconStyle(svgRef, name, 10), { initialProps: { name: 'Group' } });
    expect(getBBox).toHaveBeenCalledTimes(1);

    // action
    getBBox.mockReturnValue({ height: 20, width: 20, x: 0, y: 0 } as DOMRect);
    rerender({ name: 'FrameTool' });

    // result
    expect(getBBox).toHaveBeenCalledTimes(2);
  });
});
