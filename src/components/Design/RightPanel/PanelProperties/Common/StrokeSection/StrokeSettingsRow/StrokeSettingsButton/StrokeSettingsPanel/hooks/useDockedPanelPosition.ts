import { ReactNode, RefObject, useLayoutEffect, useState } from 'react';

// others
import { getDockedPanelTop } from '../utils/getDockedPanelTop';

export const useDockedPanelPosition = (
  dockedPanel: ReactNode,
  containerRef: RefObject<HTMLElement | null>,
  dockedRef: RefObject<HTMLElement | null>,
): number | null => {
  const [dockedPanelTop, setDockedPanelTop] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (dockedPanel && containerRef.current && dockedRef.current) {
      setDockedPanelTop(getDockedPanelTop(containerRef.current, dockedRef.current));
    } else {
      setDockedPanelTop(null);
    }
  }, [containerRef, dockedPanel, dockedRef]);

  return dockedPanelTop;
};
