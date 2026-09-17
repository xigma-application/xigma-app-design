import { useCallback } from 'react';

export const useHandleClosePicker = (
  openPickerIndex: number | null,
  onPickerOpenChange: (index: number, isOpen: boolean) => void,
): TFunc => {
  return useCallback((): void => {
    if (openPickerIndex !== null) {
      onPickerOpenChange(openPickerIndex, false);
    }
  }, [onPickerOpenChange, openPickerIndex]);
};
