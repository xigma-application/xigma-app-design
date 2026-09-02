import { RefObject, useEffect, useRef, useState } from 'react';

export type TUseEditableInputActionToggleResult = {
  actionRef: RefObject<HTMLDivElement | null>;
  isActionOpen: boolean;
  toggleAction: TFunc;
};

export const useEditableInputActionToggle = (openProp?: boolean, onOpenChange?: TFunc<[boolean]>): TUseEditableInputActionToggleResult => {
  const isControlled = openProp !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);
  const isActionOpen = isControlled ? openProp : uncontrolledOpen;

  const setIsActionOpen = (open: boolean): void => {
    if (isControlled) {
      onOpenChange?.(open);
    } else {
      setUncontrolledOpen(open);
    }
  };

  const toggleAction = (): void => {
    setIsActionOpen(!isActionOpen);
  };

  const handleOutsideClick = (event: MouseEvent): void => {
    if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
      setIsActionOpen(false);
    }
  };

  useEffect(() => {
    if (isActionOpen && !isControlled) {
      window.addEventListener('mousedown', handleOutsideClick);
    }

    return (): void => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isActionOpen, isControlled]);

  return { actionRef, isActionOpen, toggleAction };
};
