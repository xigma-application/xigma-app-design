import { useEffect } from 'react';

// types
import { KeyboardKeys } from 'types/enums';

export const useCollapseLayersShortcut = (isActive: boolean, onCollapseAll: TFunc): void => {
  useEffect(() => {
    if (isActive) {
      const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.altKey && event.code === KeyboardKeys.l) {
          event.preventDefault();
          onCollapseAll();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return (): void => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, onCollapseAll]);
};
