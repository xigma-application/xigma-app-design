// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getAutoLayoutPaddingHandleAtPoint } from '../getAutoLayoutPaddingHandleAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  paddingLeft: 20,
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

describe('getAutoLayoutPaddingHandleAtPoint', () => {
  it('should hit the left handle when the point sits within tolerance of the band’s own centre', () => {
    // action — paddingLeft is 20, so the handle sits centred in the band, 10 in from the edge
    const hit = getAutoLayoutPaddingHandleAtPoint({ x: 10, y: 100 }, frame, IDENTITY_VIEWPORT, 6);

    // result
    expect(hit).toEqual({ side: 'left', value: 20 });
  });

  it('should hit a zero-padding handle right at its own visual position, just outside the frame edge', () => {
    // action — right padding is 0; its handle sits AUTO_LAYOUT_PADDING_ZERO_HANDLE_OUTSET_PX (1) outside x=300
    const hit = getAutoLayoutPaddingHandleAtPoint({ x: 301, y: 100 }, frame, IDENTITY_VIEWPORT, 6);

    // result
    expect(hit).toEqual({ side: 'right', value: 0 });
  });

  it('should also hit a zero-padding handle well inside the frame, up to the reach distance from the edge', () => {
    // action — right padding is 0; reach extends AUTO_LAYOUT_PADDING_ZERO_HANDLE_REACH_PX (30) in from x=300
    const hit = getAutoLayoutPaddingHandleAtPoint({ x: 270, y: 100 }, frame, IDENTITY_VIEWPORT, 6);

    // result
    expect(hit).toEqual({ side: 'right', value: 0 });
  });

  it('should not hit a zero-padding handle past its reach distance', () => {
    // action — 31 in from the right edge, just past the 30 reach
    const hit = getAutoLayoutPaddingHandleAtPoint({ x: 269, y: 100 }, frame, IDENTITY_VIEWPORT, 6);

    // result
    expect(hit).toBeNull();
  });

  it('should not hit a zero-padding handle far outside the frame, past both the outset and the tolerance', () => {
    // action
    const hit = getAutoLayoutPaddingHandleAtPoint({ x: 320, y: 100 }, frame, IDENTITY_VIEWPORT, 6);

    // result
    expect(hit).toBeNull();
  });

  it('should return null when the point is outside every handle’s tolerance', () => {
    // action
    const hit = getAutoLayoutPaddingHandleAtPoint({ x: 150, y: 100 }, frame, IDENTITY_VIEWPORT, 6);

    // result
    expect(hit).toBeNull();
  });
});
