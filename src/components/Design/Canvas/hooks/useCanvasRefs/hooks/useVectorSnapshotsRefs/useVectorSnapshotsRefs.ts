import { useRef } from 'react';

// types
import {
  TVectorDraggedFillFaces,
  TVectorNodeDragSnapshot,
  TVectorNodeResizeSnapshot,
  TVectorNodeRotateSnapshot,
  TVectorSnapshotsRefs,
} from 'types/design/canvas/types';

export const useVectorSnapshotsRefs = (): TVectorSnapshotsRefs => {
  const draggedVectorFillFacesRef = useRef<TVectorDraggedFillFaces | null>(null);
  const draggedVectorNodeSnapshotsRef = useRef<Map<string, TVectorNodeDragSnapshot> | null>(null);
  const resizedVectorNodeSnapshotsRef = useRef<Map<string, TVectorNodeResizeSnapshot> | null>(null);
  const rotatedVectorNodeSnapshotsRef = useRef<Map<string, TVectorNodeRotateSnapshot> | null>(null);
  const vectorSnapshotsRefsRef = useRef<TVectorSnapshotsRefs | null>(null);

  if (vectorSnapshotsRefsRef.current === null) {
    vectorSnapshotsRefsRef.current = {
      draggedVectorFillFacesRef,
      draggedVectorNodeSnapshotsRef,
      resizedVectorNodeSnapshotsRef,
      rotatedVectorNodeSnapshotsRef,
    };
  }

  return vectorSnapshotsRefsRef.current;
};
