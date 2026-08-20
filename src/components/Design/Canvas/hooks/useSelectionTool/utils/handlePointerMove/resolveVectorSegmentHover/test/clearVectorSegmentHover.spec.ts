import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';

// utils
import { clearVectorSegmentHover } from '../clearVectorSegmentHover';

const pointerEvent = (buttons = 0): PointerEvent => new PointerEvent('pointermove', { buttons });

const createHoveredVectorSegmentIdRef = (value: string | null = null): RefObject<string | null> => ({ current: value });
const createHoveredVectorEdgeInsertPointRef = (value: TPoint | null = null): RefObject<TPoint | null> => ({ current: value });

describe('clearVectorSegmentHover', () => {
  it('should clear both the hovered segment id and the edge insert-point when no button is held', () => {
    // mock
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef('s1');
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef({ x: 5, y: 5 });

    // before
    clearVectorSegmentHover(pointerEvent(), hoveredVectorSegmentIdRef, hoveredVectorEdgeInsertPointRef);

    // result
    expect(hoveredVectorSegmentIdRef.current).toBeNull();
    expect(hoveredVectorEdgeInsertPointRef.current).toBeNull();
  });

  it('should still clear the hovered segment id but leave the edge insert-point alone while a button is held', () => {
    // mock — a held button means some other drag owns the insert-point/cursor right now
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef('s1');
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef({ x: 5, y: 5 });

    // before
    clearVectorSegmentHover(pointerEvent(1), hoveredVectorSegmentIdRef, hoveredVectorEdgeInsertPointRef);

    // result
    expect(hoveredVectorSegmentIdRef.current).toBeNull();
    expect(hoveredVectorEdgeInsertPointRef.current).toEqual({ x: 5, y: 5 });
  });
});
