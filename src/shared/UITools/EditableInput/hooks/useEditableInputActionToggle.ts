import { RefObject, useEffect, useRef, useState } from 'react';

export type TUseEditableInputActionToggleResult = {
  actionRef: RefObject<HTMLDivElement | null>;
  isActionOpen: boolean;
  toggleAction: TFunc;
};

export const useEditableInputActionToggle = (): TUseEditableInputActionToggleResult => {
  const [isActionOpen, setIsActionOpen] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);

  const toggleAction = (): void => {
    setIsActionOpen((open) => !open);
  };

  const handleOutsideClick = (event: MouseEvent): void => {
    if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
      setIsActionOpen(false);
    }
  };

  useEffect(() => {
    if (isActionOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }

    return (): void => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isActionOpen]);

  return { actionRef, isActionOpen, toggleAction };
};
