// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const hasCornerRadiusDragMoved = (refs: TCanvasRefs): boolean =>
  Boolean(refs.cornerRadius.cornerRadiusDragRef.current?.hasMoved) ||
  Boolean(refs.cornerRadius.polygonCornerRadiusDragRef.current?.hasMoved) ||
  Boolean(refs.cornerRadius.starCornerRadiusDragRef.current?.hasMoved);
