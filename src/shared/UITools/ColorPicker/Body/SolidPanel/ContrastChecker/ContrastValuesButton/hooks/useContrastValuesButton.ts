import { useState } from 'react';

export type TUseContrastValuesButtonResult = { onOpenChange: TFunc<[boolean]>; open: boolean };

export const useContrastValuesButton = (): TUseContrastValuesButtonResult => {
  const [open, setOpen] = useState(false);

  return { onOpenChange: setOpen, open };
};
