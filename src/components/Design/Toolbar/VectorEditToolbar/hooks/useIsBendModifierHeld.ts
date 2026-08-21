import { useEffect, useState } from 'react';

const BEND_MODIFIER_KEYS = ['Control', 'Meta'];

export const useIsBendModifierHeld = (): boolean => {
  const [isHeld, setIsHeld] = useState(false);

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (BEND_MODIFIER_KEYS.includes(event.key)) {
      setIsHeld(true);
    }
  };

  const handleKeyUp = (event: KeyboardEvent): void => {
    if (BEND_MODIFIER_KEYS.includes(event.key)) {
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
