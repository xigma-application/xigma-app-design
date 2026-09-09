import { useState } from 'react';

export type TUseAutoLayoutSettingsButtonResult = {
  onClose: TFunc;
  onOpenChange: TFunc<[boolean]>;
  open: boolean;
};

export const useAutoLayoutSettingsButton = (): TUseAutoLayoutSettingsButtonResult => {
  const [open, setOpen] = useState(false);

  return {
    onClose: () => setOpen(false),
    onOpenChange: (nextOpen: boolean) => setOpen(nextOpen),
    open,
  };
};
