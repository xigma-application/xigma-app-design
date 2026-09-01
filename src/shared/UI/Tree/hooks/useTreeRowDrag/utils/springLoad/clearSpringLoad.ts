import { RefObject } from 'react';

// types
import { TSpringLoad } from '../../types';

export const clearSpringLoad = (springLoadRef: RefObject<TSpringLoad | null>): void => {
  if (springLoadRef.current) {
    window.clearTimeout(springLoadRef.current.timerId);
    springLoadRef.current = null;
  }
};
