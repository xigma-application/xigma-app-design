// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getAutoLayoutPaddingHandles } from '../getAutoLayoutPaddingHandles';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

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

describe('getAutoLayoutPaddingHandles', () => {
  it('should build all four handles from the frame padding', () => {
    // action
    const handles = getAutoLayoutPaddingHandles(
      frame({ paddingBottom: 8, paddingLeft: 5, paddingRight: 15, paddingTop: 12 }),
      IDENTITY_VIEWPORT,
      null,
    );

    // result
    expect(handles.left).toMatchObject({ band: { height: 200, width: 5, x: 0, y: 0 }, side: 'left', value: 5 });
    expect(handles.right).toMatchObject({ band: { height: 200, width: 15, x: 285, y: 0 }, side: 'right', value: 15 });
    expect(handles.top).toMatchObject({ band: { height: 12, width: 300, x: 0, y: 0 }, side: 'top', value: 12 });
    expect(handles.bottom).toMatchObject({ band: { height: 8, width: 300, x: 0, y: 192 }, side: 'bottom', value: 8 });
  });

  it('should default unset padding fields to 0', () => {
    // action
    const handles = getAutoLayoutPaddingHandles(frame(), IDENTITY_VIEWPORT, null);

    // result
    expect(handles.left.value).toBe(0);
    expect(handles.right.value).toBe(0);
    expect(handles.top.value).toBe(0);
    expect(handles.bottom.value).toBe(0);
  });

  it('should centre a padded handle in the middle of its band, not at the content boundary', () => {
    // action
    const handles = getAutoLayoutPaddingHandles(frame({ paddingLeft: 40 }), IDENTITY_VIEWPORT, null);

    // result — halfway between the edge (x=0) and the content boundary (x=40)
    expect(handles.left.handleCenter).toEqual({ x: 20, y: 100 });
  });

  it('should place a zero-padding handle just outside the frame edge, not inset into the band', () => {
    // action
    const handles = getAutoLayoutPaddingHandles(frame(), IDENTITY_VIEWPORT, null);

    // result — AUTO_LAYOUT_PADDING_ZERO_HANDLE_OUTSET_PX (1) / zoom (1) = 1 world unit outside x=0
    expect(handles.left.handleCenter).toEqual({ x: -1, y: 100 });
  });

  it('should sit exactly on the frame edge for the side currently being dragged, even at 0 padding', () => {
    // action
    const handles = getAutoLayoutPaddingHandles(frame(), IDENTITY_VIEWPORT, 'left');

    // result — the dragged side tracks the literal (growing) value from the edge itself, while the
    // other, non-dragged side stays at its own resting zero-state position (1 outside the edge)
    expect(handles.left.handleCenter).toEqual({ x: 0, y: 100 });
    expect(handles.right.handleCenter).toEqual({ x: 301, y: 100 });
  });
});
