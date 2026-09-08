// types
import { LayoutMode, NodeType, ToolName } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { THoverResolverContext } from '../../types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { resolveAutoLayoutPaddingHover } from '../resolveAutoLayoutPaddingHover';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createContext = (overrides: Partial<THoverResolverContext>): THoverResolverContext => ({
  activeTool: ToolName.default,
  editingContent: '',
  editingNodeId: null,
  editingTextBox: null,
  isControlPressed: false,
  leafNodes: [],
  nodesById: {},
  point: { x: 0, y: 0 },
  refs: createCanvasRefs(),
  resizableSelectedNodes: [],
  resizeHandleHit: null,
  selectedNodes: [],
  smartSelectionNodes: [],
  vectorMultiSelectBox: null,
  vectorMultiSelectResizeHandle: null,
  viewport: IDENTITY_VIEWPORT,
  ...overrides,
});

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

const rectangle: TRectangleNode = {
  fill: '#000',
  height: 50,
  id: 'plain-rect',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 50,
  x: 0,
  y: 0,
};

describe('resolveAutoLayoutPaddingHover', () => {
  it('should return a cursor and stash the hovered side when the point sits over a padded handle', () => {
    // mock
    const refs = createCanvasRefs();

    // before — paddingLeft is 20, so the handle sits centred in the band, 10 in from the edge
    const result = resolveAutoLayoutPaddingHover(createContext({ point: { x: 10, y: 100 }, refs, selectedNodes: [frame] }));

    // result
    expect(result).toMatchObject({ className: null, nodeId: null });
    expect(refs.hover.hoveredAutoLayoutPaddingRef.current).toEqual({ frameId: 'frame-1', point: { x: 10, y: 100 }, side: 'left' });
    expect(refs.hover.isAutoLayoutPaddingAreaHoveredRef.current).toBe(true);
  });

  it('should resolve a top-side handle', () => {
    // mock
    const refs = createCanvasRefs();

    // before — top padding is unset (0), handle sits at the zero-state offset from the top edge
    const result = resolveAutoLayoutPaddingHover(createContext({ point: { x: 150, y: 30 }, refs, selectedNodes: [frame] }));

    // result
    expect(refs.hover.hoveredAutoLayoutPaddingRef.current).toMatchObject({ side: 'top' });
    expect(result).not.toBeUndefined();
  });

  it('should resolve a zero-padding handle anywhere within its reach distance from the edge', () => {
    // mock
    const refs = createCanvasRefs();

    // before — right padding is unset (0); reach extends well past the handle's own tiny visual position
    const result = resolveAutoLayoutPaddingHover(createContext({ point: { x: 270, y: 100 }, refs, selectedNodes: [frame] }));

    // result
    expect(refs.hover.hoveredAutoLayoutPaddingRef.current).toMatchObject({ side: 'right' });
    expect(result).not.toBeUndefined();
  });

  it('should still resolve a zero-padding handle when the point sits just outside the frame’s own bounds', () => {
    // mock
    const refs = createCanvasRefs();

    // before — right padding is unset (0); its handle sits 1px outside the frame's right edge (x=300)
    const result = resolveAutoLayoutPaddingHover(createContext({ point: { x: 301, y: 100 }, refs, selectedNodes: [frame] }));

    // result — the point itself isn't "inside" the frame, but the handle is still grabbable there
    expect(refs.hover.hoveredAutoLayoutPaddingRef.current).toMatchObject({ side: 'right' });
    expect(refs.hover.isAutoLayoutPaddingAreaHoveredRef.current).toBe(false);
    expect(result).not.toBeUndefined();
  });

  it('should return undefined and clear the handle ref while inside the frame but off any handle', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.hoveredAutoLayoutPaddingRef.current = { frameId: 'frame-1', point: { x: 20, y: 100 }, side: 'left' };

    // before
    const result = resolveAutoLayoutPaddingHover(createContext({ point: { x: 150, y: 100 }, refs, selectedNodes: [frame] }));

    // result
    expect(result).toBeUndefined();
    expect(refs.hover.hoveredAutoLayoutPaddingRef.current).toBeNull();
    expect(refs.hover.isAutoLayoutPaddingAreaHoveredRef.current).toBe(true);
  });

  it('should return undefined and clear the area flag once the pointer leaves the frame bounds', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveAutoLayoutPaddingHover(createContext({ point: { x: 900, y: 900 }, refs, selectedNodes: [frame] }));

    // result
    expect(result).toBeUndefined();
    expect(refs.hover.hoveredAutoLayoutPaddingRef.current).toBeNull();
    expect(refs.hover.isAutoLayoutPaddingAreaHoveredRef.current).toBe(false);
  });

  it('should return undefined when nothing is selected', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveAutoLayoutPaddingHover(createContext({ point: { x: 20, y: 100 }, refs, selectedNodes: [] }));

    // result
    expect(result).toBeUndefined();
    expect(refs.hover.isAutoLayoutPaddingAreaHoveredRef.current).toBe(false);
  });

  it('should return undefined when the selected node is not an auto-layout frame', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveAutoLayoutPaddingHover(createContext({ point: { x: 25, y: 25 }, refs, selectedNodes: [rectangle] }));

    // result
    expect(result).toBeUndefined();
  });
});
