import { RefObject, useCallback, useEffect } from 'react';

export const useCloseBrushPickerOnOutsideClick = (
  triggerRef: RefObject<HTMLElement | null>,
  pickerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: TFunc,
): void => {
  const handleOutsideClick = useCallback(
    (event: MouseEvent): void => {
      const target = event.target as Node;

      if (!triggerRef.current?.contains(target) && !pickerRef.current?.contains(target)) {
        onClose();
      }
    },
    [onClose, pickerRef, triggerRef],
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('mousedown', handleOutsideClick);

      return (): void => window.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [handleOutsideClick, isOpen]);
};
