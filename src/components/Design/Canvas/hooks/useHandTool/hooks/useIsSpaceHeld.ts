import { useEffect, useState } from 'react';

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

export const useIsSpaceHeld = (): boolean => {
  const [isHeld, setIsHeld] = useState(false);

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === ' ' && !isTypingTarget(event.target)) {
      event.preventDefault();
      setIsHeld(true);
    }
  };

  const handleKeyUp = (event: KeyboardEvent): void => {
    if (event.key === ' ') {
      setIsHeld(false);
    }
  };

  const handleBlur = (): void => {
    setIsHeld(false);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return (): void => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isHeld;
};
