// types
import { TPoint } from 'types/canvas';

// utils
import { TSmartSelectionSwapSlot } from './getSmartSelectionSwapSlots';

export const getReorderedSwapPositions = (slots: TSmartSelectionSwapSlot[], fromIndex: number, toIndex: number): Record<string, TPoint> => {
  const draggedId = slots[fromIndex].id;

  if (draggedId !== null) {
    const target = slots[toIndex].bounds;

    if (slots[toIndex].id !== null) {
      const reorderedIds = slots.map((slot) => slot.id);

      reorderedIds.splice(fromIndex, 1);
      reorderedIds.splice(toIndex, 0, draggedId);

      const positions: Record<string, TPoint> = {};

      reorderedIds.forEach((id, slotIndex) => {
        if (id !== null && id !== slots[slotIndex].id) {
          positions[id] = { x: slots[slotIndex].bounds.x, y: slots[slotIndex].bounds.y };
        }
      });

      return positions;
    }

    return { [draggedId]: { x: target.x, y: target.y } };
  }

  return {};
};
