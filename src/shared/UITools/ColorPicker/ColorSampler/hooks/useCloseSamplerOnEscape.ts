import { useEffect } from 'react';

export const useCloseSamplerOnEscape = (onClose: TFunc): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return (): void => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);
};
