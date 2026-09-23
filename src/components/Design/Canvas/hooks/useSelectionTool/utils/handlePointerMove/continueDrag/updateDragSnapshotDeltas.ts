// types
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

export const updateDragSnapshotDeltas = (
  snapshots: Map<string, TVectorNodeDragSnapshot> | null,
  deltaX: number,
  deltaY: number,
  excludedIds: ReadonlySet<string> = new Set(),
): void => {
  snapshots?.forEach((snapshot, id) => {
    if (!excludedIds.has(id)) {
      snapshot.deltaX = deltaX;
      snapshot.deltaY = deltaY;
    }
  });
};
