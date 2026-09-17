import { RefObject, useCallback, useEffect } from 'react';

// others
import { RIGHT_PANEL_SELECTOR } from './constants';

export const useExitImageEditorOnPanelClick = (
  containerRef: RefObject<HTMLElement | null>,
  isImageEditorActive: boolean,
  isPickerOpen: boolean,
  onExitImageEditor: TFunc,
  onClosePicker: TFunc,
): void => {
  const handlePanelClick = useCallback(
    (event: MouseEvent): void => {
      const target = event.target as Node;
      const isInsideFillList = Boolean(containerRef.current?.contains(target));
      const isInsideRightPanel = target instanceof Element && target.closest(RIGHT_PANEL_SELECTOR) !== null;

      if (!isInsideFillList && isInsideRightPanel) {
        if (isImageEditorActive) {
          onExitImageEditor();
        } else if (isPickerOpen) {
          onClosePicker();
        }
      }
    },
    [containerRef, isImageEditorActive, isPickerOpen, onClosePicker, onExitImageEditor],
  );

  useEffect(() => {
    if (isImageEditorActive || isPickerOpen) {
      window.addEventListener('mousedown', handlePanelClick);

      return (): void => window.removeEventListener('mousedown', handlePanelClick);
    }
  }, [handlePanelClick, isImageEditorActive, isPickerOpen]);
};
