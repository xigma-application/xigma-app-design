import { useState } from 'react';

export type TUseStrokeSettingsButtonResult = {
  onClose: TFunc;
  onOpenChange: TFunc<[boolean]>;
  open: boolean;
};

export const useStrokeSettingsButton = (): TUseStrokeSettingsButtonResult => {
  const [open, setOpen] = useState(false);

  return {
    onClose: (): void => setOpen(false),
    onOpenChange: (nextOpen: boolean): void => setOpen(nextOpen),
    open,
  };
};
