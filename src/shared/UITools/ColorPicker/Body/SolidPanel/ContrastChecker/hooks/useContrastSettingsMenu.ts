import { useState } from 'react';

export type TUseContrastSettingsMenuResult = { onOpenChange: TFunc<[boolean]>; open: boolean };

export const useContrastSettingsMenu = (): TUseContrastSettingsMenuResult => {
  const [open, setOpen] = useState(false);

  return { onOpenChange: setOpen, open };
};
