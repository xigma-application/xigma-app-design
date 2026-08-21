import { useEffect, useState } from 'react';

const ENTRANCE_ANIMATION_DURATION_MS = 150;

export const useCommentDraftEntrance = (): boolean => {
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setEntering(false), ENTRANCE_ANIMATION_DURATION_MS);

    return (): void => window.clearTimeout(timeoutId);
  }, []);

  return entering;
};
