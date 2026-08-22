// types
import { TPenPointHoverKind } from './resolvePenPointHover/types';

export const getPenHoverCursorClassName = (hoverKind: TPenPointHoverKind | null): string => {
  switch (hoverKind) {
    case 'active-vertex':
    case 'vertex':
    case 'edge-snap':
      return 'pen-snap';
    case 'edge':
      return 'pen-extend';
    default:
      return 'pen';
  }
};
