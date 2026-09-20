import { useRef } from 'react';

export type TUseReturnFocusOnUserCloseResult = {
  markUserClose: TFunc;
  onClose: TFunc;
  onCloseAutoFocus: (event: Event) => void;
};

export const useReturnFocusOnUserClose = (onOpenChange: TFunc<[boolean]>): TUseReturnFocusOnUserCloseResult => {
  const closedByUserRef = useRef(false);

  const markUserClose = (): void => {
    closedByUserRef.current = true;
  };

  return {
    markUserClose,
    onClose: (): void => {
      markUserClose();
      onOpenChange(false);
    },
    onCloseAutoFocus: (event): void => {
      if (!closedByUserRef.current) {
        event.preventDefault();
      }

      closedByUserRef.current = false;
    },
  };
};
