import { useCallback } from 'react';

export const useOpenThisPicker = (onPickerOpenChange: TFunc<[boolean]>): TFunc => {
  return useCallback((): void => onPickerOpenChange(true), [onPickerOpenChange]);
};
