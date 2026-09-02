import { useState } from 'react';

export type TUseFileNameMenuResult = {
  isOpen: boolean;
  onOpenChange: TFunc<[boolean]>;
};

export const useFileNameMenu = (): TUseFileNameMenuResult => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpenChange = (open: boolean): void => {
    setIsOpen(open);
  };

  return { isOpen, onOpenChange };
};
