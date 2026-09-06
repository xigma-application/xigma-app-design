// types
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

export const buildContiguousMemberOffsets = (
  selectedNodes: TSceneNode[],
  slots: Record<string, TPoint>,
  grabbedId: string,
): Record<string, TPoint> => {
  const grabbedSlot = slots[grabbedId];

  return selectedNodes
    .filter((node) => slots[node.id] !== undefined)
    .reduce<Record<string, TPoint>>((offsets, node) => {
      offsets[node.id] = { x: slots[node.id].x - grabbedSlot.x, y: slots[node.id].y - grabbedSlot.y };

      return offsets;
    }, {});
};
