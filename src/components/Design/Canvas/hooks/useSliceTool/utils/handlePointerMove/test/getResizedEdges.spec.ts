// types
import { TDraftRect, TResizeHandle } from 'types/canvas';

// utils
import { getResizedEdges } from '../getResizedEdges';

const origin: TDraftRect = { height: 100, width: 100, x: 0, y: 0 };

describe('getResizedEdges', () => {
  it('should move only the dragged edge for a plain edge handle', () => {
    // result
    expect(getResizedEdges(origin, 'n', { x: 0, y: -10 })).toEqual({ x1: 0, x2: 100, y1: -10, y2: 100 });
    expect(getResizedEdges(origin, 's', { x: 0, y: 110 })).toEqual({ x1: 0, x2: 100, y1: 0, y2: 110 });
    expect(getResizedEdges(origin, 'e', { x: 110, y: 0 })).toEqual({ x1: 0, x2: 110, y1: 0, y2: 100 });
    expect(getResizedEdges(origin, 'w', { x: -10, y: 0 })).toEqual({ x1: -10, x2: 100, y1: 0, y2: 100 });
  });

  it('should move both adjacent edges for a corner handle', () => {
    // result
    expect(getResizedEdges(origin, 'ne', { x: 110, y: -10 })).toEqual({ x1: 0, x2: 110, y1: -10, y2: 100 });
    expect(getResizedEdges(origin, 'nw', { x: -10, y: -10 })).toEqual({ x1: -10, x2: 100, y1: -10, y2: 100 });
    expect(getResizedEdges(origin, 'se', { x: 110, y: 110 })).toEqual({ x1: 0, x2: 110, y1: 0, y2: 110 });
    expect(getResizedEdges(origin, 'sw', { x: -10, y: 110 })).toEqual({ x1: -10, x2: 100, y1: 0, y2: 110 });
  });

  it('should leave the raw edges untouched for an unknown handle', () => {
    // result
    expect(getResizedEdges(origin, 'unknown' as TResizeHandle, { x: 999, y: 999 })).toEqual({ x1: 0, x2: 100, y1: 0, y2: 100 });
  });
});
