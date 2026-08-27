import { useEffect } from 'react';

export const useHandleInitial = (): void => {
  useEffect(() => {
    document.body.style.pointerEvents = 'none';

    return (): void => {
      document.body.style.pointerEvents = 'all';
    };
  }, []);
};
