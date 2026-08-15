import { RefObject } from 'react';

export const handlePointerUp = (anchorIndexRef: RefObject<number | null>): void => {
  anchorIndexRef.current = null;
};
