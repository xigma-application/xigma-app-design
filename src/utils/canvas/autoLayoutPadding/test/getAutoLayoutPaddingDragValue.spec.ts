// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutPaddingDragState } from 'types/design/canvas/types';
import { TFrameNode } from 'types/design/types';

// utils
import { getAutoLayoutPaddingDragValue } from '../getAutoLayoutPaddingDragValue';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
  ...overrides,
});

const dragState = (overrides: Partial<TAutoLayoutPaddingDragState> = {}): TAutoLayoutPaddingDragState => ({
  frameId: 'frame-1',
  hasMoved: false,
  mode: 'absolute',
  originalPaddingValue: 0,
  point: { x: 0, y: 100 },
  pointerStart: { x: 0, y: 100 },
  side: 'left',
  ...overrides,
});

describe('getAutoLayoutPaddingDragValue', () => {
  it('should read the left padding as the pointer’s distance from the left edge in absolute mode', () => {
    // result
    expect(getAutoLayoutPaddingDragValue(dragState({ mode: 'absolute', side: 'left' }), frame(), { x: 40, y: 100 })).toBe(40);
  });

  it('should read the right padding as the pointer’s distance from the right edge in absolute mode', () => {
    // result
    expect(getAutoLayoutPaddingDragValue(dragState({ mode: 'absolute', side: 'right' }), frame(), { x: 260, y: 100 })).toBe(40);
  });

  it('should read the top padding as the pointer’s distance from the top edge in absolute mode', () => {
    // result
    expect(getAutoLayoutPaddingDragValue(dragState({ mode: 'absolute', side: 'top' }), frame(), { x: 150, y: 25 })).toBe(25);
  });

  it('should read the bottom padding as the pointer’s distance from the bottom edge in absolute mode', () => {
    // result
    expect(getAutoLayoutPaddingDragValue(dragState({ mode: 'absolute', side: 'bottom' }), frame(), { x: 150, y: 175 })).toBe(25);
  });

  it('should clamp an absolute-mode value at 0 instead of going negative', () => {
    // result — pointer dragged past the left edge, into negative territory
    expect(getAutoLayoutPaddingDragValue(dragState({ mode: 'absolute', side: 'left' }), frame(), { x: -20, y: 100 })).toBe(0);
  });

  it('should grow left padding by the rightward pointer delta in delta mode', () => {
    // mock
    const state = dragState({ mode: 'delta', originalPaddingValue: 10, pointerStart: { x: 40, y: 100 }, side: 'left' });

    // result — pointer moved 15 to the right
    expect(getAutoLayoutPaddingDragValue(state, frame(), { x: 55, y: 100 })).toBe(25);
  });

  it('should grow right padding by the leftward pointer delta in delta mode', () => {
    // mock
    const state = dragState({ mode: 'delta', originalPaddingValue: 10, pointerStart: { x: 260, y: 100 }, side: 'right' });

    // result — pointer moved 15 to the left
    expect(getAutoLayoutPaddingDragValue(state, frame(), { x: 245, y: 100 })).toBe(25);
  });

  it('should grow top padding by the downward pointer delta in delta mode', () => {
    // mock
    const state = dragState({ mode: 'delta', originalPaddingValue: 10, pointerStart: { x: 150, y: 25 }, side: 'top' });

    // result — pointer moved 15 down
    expect(getAutoLayoutPaddingDragValue(state, frame(), { x: 150, y: 40 })).toBe(25);
  });

  it('should grow bottom padding by the upward pointer delta in delta mode', () => {
    // mock
    const state = dragState({ mode: 'delta', originalPaddingValue: 10, pointerStart: { x: 150, y: 175 }, side: 'bottom' });

    // result — pointer moved 15 up
    expect(getAutoLayoutPaddingDragValue(state, frame(), { x: 150, y: 160 })).toBe(25);
  });

  it('should clamp a delta-mode value at 0 instead of going negative', () => {
    // mock
    const state = dragState({ mode: 'delta', originalPaddingValue: 10, pointerStart: { x: 40, y: 100 }, side: 'left' });

    // result — pointer dragged far left, past a negative padding
    expect(getAutoLayoutPaddingDragValue(state, frame(), { x: -100, y: 100 })).toBe(0);
  });

  it('should un-rotate the pointer start before measuring the delta, for a rotated frame', () => {
    // mock — a 300x200 frame rotated 90deg (centre 150,100); grabbing exactly at the centre and
    // moving straight down 20 in world space reads as +20 along the frame's own local x axis
    const rotatedFrame = frame({ rotation: 90 });
    const state = dragState({ mode: 'delta', originalPaddingValue: 10, pointerStart: { x: 150, y: 100 }, side: 'left' });

    // result
    expect(getAutoLayoutPaddingDragValue(state, rotatedFrame, { x: 170, y: 100 })).toBe(30);
  });
});
