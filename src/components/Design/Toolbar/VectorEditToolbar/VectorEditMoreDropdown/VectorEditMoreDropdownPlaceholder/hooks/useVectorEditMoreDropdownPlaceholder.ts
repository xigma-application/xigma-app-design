import { useCallback, useState } from 'react';

export type TUseVectorEditMoreDropdownPlaceholder = {
  handleOpenChange: (open: boolean) => void;
  isOpen: boolean;
};

export const useVectorEditMoreDropdownPlaceholder = (): TUseVectorEditMoreDropdownPlaceholder => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = useCallback((open: boolean): void => {
    setIsOpen(open);
  }, []);

  return { handleOpenChange, isOpen };
};
