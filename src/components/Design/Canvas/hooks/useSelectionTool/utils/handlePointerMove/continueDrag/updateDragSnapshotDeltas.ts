// types
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

export const updateDragSnapshotDeltas = (snapshots: Map<string, TVectorNodeDragSnapshot> | null, deltaX: number, deltaY: number): void => {
  snapshots?.forEach((snapshot) => {
    snapshot.deltaX = deltaX;
    snapshot.deltaY = deltaY;
  });
};
