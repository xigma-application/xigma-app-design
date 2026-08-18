// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const hasCornerRadiusDragMoved = (refs: TCanvasRefs): boolean =>
  Boolean(refs.cornerRadiusDragRef.current?.hasMoved) ||
  Boolean(refs.polygonCornerRadiusDragRef.current?.hasMoved) ||
  Boolean(refs.starCornerRadiusDragRef.current?.hasMoved);
