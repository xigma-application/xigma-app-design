import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// components
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';
import { usePanelEdgeSideOffset } from '../usePanelEdgeSideOffset';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <CanvasRefsProvider>{children}</CanvasRefsProvider>;

describe('usePanelEdgeSideOffset', () => {
  it('should default to 8 before the popover opens', () => {
    // before
    const triggerRef = { current: null };
    const { result } = renderHook(() => usePanelEdgeSideOffset(triggerRef, false), { wrapper });

    // result
    expect(result.current).toBe(8);
  });

  it("should compute the offset that flushes the popover's right edge against the panel's left edge", () => {
    // mock
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200);

    const trigger = document.createElement('button');

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({ left: 900 } as DOMRect);

    // before
    const { rerender, result } = renderHook(
      ({ open }: { open: boolean }) => {
        const context = useCanvasRefsContext();

        context.layout.rightPanelWidthRef.current = 240;

        return usePanelEdgeSideOffset({ current: trigger }, open);
      },
      { initialProps: { open: false }, wrapper },
    );

    // action — panel's left edge sits at 1200 - 240 = 960; trigger's own left edge is 900
    rerender({ open: true });

    // result — 900 - 960 = -60
    expect(result.current).toBe(-60);
  });

  it('should not recompute while the popover stays closed', () => {
    // mock
    const trigger = document.createElement('button');

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({ left: 900 } as DOMRect);

    // before
    const { result } = renderHook(() => usePanelEdgeSideOffset({ current: trigger }, false), { wrapper });

    // result
    expect(result.current).toBe(8);
  });
});
