import { useState } from 'react';

export type TUseCornerSmoothingButtonResult = {
  onClose: TFunc;
  onOpenChange: TFunc<[boolean]>;
  open: boolean;
};

export const useCornerSmoothingButton = (): TUseCornerSmoothingButtonResult => {
  const [open, setOpen] = useState(false);

  return {
    onClose: (): void => setOpen(false),
    onOpenChange: (nextOpen: boolean): void => setOpen(nextOpen),
    open,
  };
};
