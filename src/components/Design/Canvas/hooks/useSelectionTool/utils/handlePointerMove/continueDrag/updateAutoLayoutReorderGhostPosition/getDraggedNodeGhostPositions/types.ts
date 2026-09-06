// types
import { TAutoLayoutDraggedOffsetTween } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

export type TDraggedGhostResult = { positions: Record<string, TPoint>; tween: TAutoLayoutDraggedOffsetTween | undefined };
