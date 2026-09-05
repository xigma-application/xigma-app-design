// types
import { TDragState } from 'types/design/selectionTool/types';

export const markDragAsMoved = (dragState: TDragState): void => {
  dragState.hasMoved = true;
};
