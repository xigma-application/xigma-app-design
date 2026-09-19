import { renderHook } from '@testing-library/react';
import { ReactNode, RefObject } from 'react';

// hooks
import { useDockedPanelPosition } from '../useDockedPanelPosition';

const mockRect = (element: HTMLElement, top: number): void => {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top } as DOMRect);
};

describe('useDockedPanelPosition', () => {
  it('should return null while there is no docked panel', () => {
    // before
    const container = document.createElement('div');
    const docked = document.createElement('div');
    const containerRef = { current: container } as RefObject<HTMLElement | null>;
    const dockedRef = { current: docked } as RefObject<HTMLElement | null>;

    // action
    const { result } = renderHook(() => useDockedPanelPosition(null, containerRef, dockedRef));

    // result
    expect(result.current).toBeNull();
  });

  it('should measure the docked panel top offset once it opens', () => {
    // before
    const container = document.createElement('div');
    const docked = document.createElement('div');

    mockRect(container, 100);
    mockRect(docked, 340);

    const containerRef = { current: container } as RefObject<HTMLElement | null>;
    const dockedRef = { current: docked } as RefObject<HTMLElement | null>;

    // action
    const { result } = renderHook(() => useDockedPanelPosition('panel', containerRef, dockedRef));

    // result
    expect(result.current).toBe(240);
  });

  it('should keep the frozen offset even after the panel underneath resizes', () => {
    // before
    const container = document.createElement('div');
    const docked = document.createElement('div');

    mockRect(container, 100);
    mockRect(docked, 340);

    const containerRef = { current: container } as RefObject<HTMLElement | null>;
    const dockedRef = { current: docked } as RefObject<HTMLElement | null>;

    const { result, rerender } = renderHook(({ dockedPanel }) => useDockedPanelPosition(dockedPanel, containerRef, dockedRef), {
      initialProps: { dockedPanel: 'panel' as ReactNode },
    });

    expect(result.current).toBe(240);

    // action: the panel underneath grows, but the docked panel identity stays the same
    mockRect(docked, 500);
    rerender({ dockedPanel: 'panel' });

    // result
    expect(result.current).toBe(240);
  });
});
