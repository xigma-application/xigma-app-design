import { useEffect } from 'react';

export const useClosePatternSourcePickingOnEscape = (isActive: boolean, onClose: TFunc): void => {
  useEffect(() => {
    if (isActive) {
      const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown, true);

      return (): void => window.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [isActive, onClose]);
};
