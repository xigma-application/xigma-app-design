import { RefObject, useEffect, useState } from 'react';

// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

const DEFAULT_SIDE_OFFSET = 8;

export const usePanelEdgeSideOffset = (triggerRef: RefObject<HTMLElement | null>, open: boolean): number => {
  const { layout } = useCanvasRefsContext();
  const [sideOffset, setSideOffset] = useState(DEFAULT_SIDE_OFFSET);

  useEffect(() => {
    if (open && triggerRef.current) {
      const panelLeftEdge = window.innerWidth - layout.rightPanelWidthRef.current;
      const triggerLeft = triggerRef.current.getBoundingClientRect().left;

      setSideOffset(triggerLeft - panelLeftEdge);
    }
  }, [layout.rightPanelWidthRef, open, triggerRef]);

  return sideOffset;
};
