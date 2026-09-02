import { RefObject, useEffect } from 'react';

export const useReportPanelWidth = (widthRef: RefObject<number>, width: number, isVisible: boolean): void => {
  useEffect(() => {
    widthRef.current = isVisible ? width : 0;
  }, [isVisible, width, widthRef]);
};
