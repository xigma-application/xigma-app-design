import { CSSProperties, RefObject } from 'react';

// types
import { TVirtualAnchor } from '../../Tree/TreeItem/types';

export const getAnchorTriggerStyle = (anchorRef: RefObject<TVirtualAnchor>): CSSProperties => {
  const rect = anchorRef.current.getBoundingClientRect();

  return {
    height: rect.height,
    left: rect.left,
    pointerEvents: 'none',
    position: 'fixed',
    top: rect.top,
    width: rect.width,
  };
};
