// types
import { TPoint } from 'types/canvas';
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

export const getReorderedSwapPositions = (slots: TSmartSelectionNode[], fromIndex: number, toIndex: number): Record<string, TPoint> => {
  const reorderedIds = slots.map((slot) => slot.id);
  const [movedId] = reorderedIds.splice(fromIndex, 1);
  const positions: Record<string, TPoint> = {};

  reorderedIds.splice(toIndex, 0, movedId);
  reorderedIds.forEach((id, slotIndex) => {
    if (id !== slots[slotIndex].id) {
      positions[id] = { x: slots[slotIndex].bounds.x, y: slots[slotIndex].bounds.y };
    }
  });

  return positions;
};
