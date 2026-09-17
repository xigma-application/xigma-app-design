import { useEffect } from 'react';

export const useDeactivateImageTabOnPickerClose = (isPickerOpen: boolean, setIsImageTabActive: TFunc<[boolean]>): void => {
  useEffect(() => {
    if (!isPickerOpen) {
      setIsImageTabActive(false);
    }
  }, [isPickerOpen, setIsImageTabActive]);
};
