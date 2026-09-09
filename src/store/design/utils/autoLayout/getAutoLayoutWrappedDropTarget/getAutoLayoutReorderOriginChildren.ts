// types
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';

export const getAutoLayoutReorderOriginChildren = (
  children: TAutoLayoutChildSize[],
  originalIndex: number | null,
  draggedSize: { height: number; width: number },
): TAutoLayoutChildSize[] =>
  originalIndex === null
    ? children
    : [...children.slice(0, originalIndex), { ...draggedSize, id: '__dragged__' }, ...children.slice(originalIndex)];
