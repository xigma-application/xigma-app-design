// types
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorTangent, TVectorVertex } from 'types/design/types';

export type TErasedSegmentGeometry = {
  end: TPoint;
  start: TPoint;
  tangentEnd: TVectorTangent;
  tangentStart: TVectorTangent;
};

// The network a single erase pass leaves behind — the shape `severVectorSegmentAtPoint` returns and
// every `applySegmentErase` handler passes back up.
export type TErasedNetwork = {
  segments: Record<string, TVectorSegment>;
  vertices: Record<string, TVectorVertex>;
};

// Which stretch of a segment (in Bézier parameter space) the eraser brush covers:
// - `none`   — the brush never comes within `radius` of the segment
// - `whole`  — the brush covers both endpoints, delete the segment outright
// - `start`  — the brush covers the segment's start, keep only `[tOut, 1]`
// - `end`    — the brush covers the segment's end, keep only `[0, tIn]`
// - `middle` — the brush cuts a gap out of the interior, keep `[0, tIn]` and `[tOut, 1]`
export type TSegmentEraseInterval =
  | { kind: 'none' }
  | { kind: 'whole' }
  | { kind: 'start'; tOut: number }
  | { kind: 'end'; tIn: number }
  | { kind: 'middle'; tIn: number; tOut: number };
