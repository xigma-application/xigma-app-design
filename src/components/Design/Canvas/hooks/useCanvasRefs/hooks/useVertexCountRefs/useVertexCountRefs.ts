import { useRef } from 'react';

// types
import { TPolygonVertexCountDragState, TStarVertexCountDragState } from 'types/design/selectionTool/types';
import { TVertexCountRefs } from 'types/design/canvas/types';

export const useVertexCountRefs = (): TVertexCountRefs => {
  const polygonVertexCountDragRef = useRef<TPolygonVertexCountDragState | null>(null);
  const starVertexCountDragRef = useRef<TStarVertexCountDragState | null>(null);
  const vertexCountRefsRef = useRef<TVertexCountRefs | null>(null);

  if (vertexCountRefsRef.current === null) {
    vertexCountRefsRef.current = { polygonVertexCountDragRef, starVertexCountDragRef };
  }

  return vertexCountRefsRef.current;
};
