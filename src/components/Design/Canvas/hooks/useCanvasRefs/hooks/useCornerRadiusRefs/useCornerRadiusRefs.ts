import { useRef } from 'react';

// types
import {
  TCornerRadiusDragState,
  TCornerRadiusRefs,
  TPolygonCornerRadiusDragState,
  TStarCornerRadiusDragState,
} from 'types/design/canvas/types';

export const useCornerRadiusRefs = (): TCornerRadiusRefs => {
  const cornerRadiusDragRef = useRef<TCornerRadiusDragState | null>(null);
  const polygonCornerRadiusDragRef = useRef<TPolygonCornerRadiusDragState | null>(null);
  const starCornerRadiusDragRef = useRef<TStarCornerRadiusDragState | null>(null);
  const cornerRadiusRefsRef = useRef<TCornerRadiusRefs | null>(null);

  if (cornerRadiusRefsRef.current === null) {
    cornerRadiusRefsRef.current = { cornerRadiusDragRef, polygonCornerRadiusDragRef, starCornerRadiusDragRef };
  }

  return cornerRadiusRefsRef.current;
};
