// types
import { CanvasStacking } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

export const getFrameChildIdsInPaintOrder = (frame: TFrameNode): string[] =>
  frame.canvasStacking === CanvasStacking.firstOnTop ? [...frame.childIds].reverse() : frame.childIds;
