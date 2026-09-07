// types
import { LayoutMode, NodeType, ToolName } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { THoverResolverContext } from '../../types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { resolveAutoLayoutGapHover } from '../resolveAutoLayoutGapHover';

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

const childA: TRectangleNode = {
  fill: '#000',
  height: 50,
  id: 'child-a',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 50,
  x: 0,
  y: 0,
};

const childB: TRectangleNode = { ...childA, id: 'child-b', x: 70 };

const frame: TFrameNode = {
  childIds: ['child-a', 'child-b'],
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
};

const nodesById = { 'child-a': childA, 'child-b': childB, 'frame-1': frame };

const rectangle: TRectangleNode = { ...childA, id: 'plain-rect', parentId: null };

describe('resolveAutoLayoutGapHover', () => {
  it('should return a gap cursor and stash the hovered axis when the point sits over a horizontal handle', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveAutoLayoutGapHover(createContext({ nodesById, point: { x: 60, y: 25 }, refs, selectedNodes: [frame] }));

    // result
    expect(result).toMatchObject({ className: null, nodeId: null });
    expect(refs.hover.hoveredAutoLayoutGapRef.current).toEqual({ axis: 'horizontal', frameId: 'frame-1', point: { x: 60, y: 25 } });
    expect(refs.hover.isAutoLayoutGapAreaHoveredRef.current).toBe(true);
  });

  it('should resolve the vertical handle in a wrapped layout', () => {
    // mock
    const refs = createCanvasRefs();
    const wrappedFrame: TFrameNode = { ...frame, layoutWrap: true };
    const childC: TRectangleNode = { ...childA, id: 'child-c', y: 70 };
    const wrappedNodesById = {
      ...nodesById,
      'child-c': childC,
      'frame-1': { ...wrappedFrame, childIds: ['child-a', 'child-b', 'child-c'] },
    };

    // before
    const result = resolveAutoLayoutGapHover(
      createContext({
        nodesById: wrappedNodesById,
        point: { x: 60, y: 60 },
        refs,
        selectedNodes: [wrappedNodesById['frame-1']],
      }),
    );

    // result
    expect(refs.hover.hoveredAutoLayoutGapRef.current).toMatchObject({ axis: 'vertical' });
    expect(result).not.toBeUndefined();
  });

  it('should return undefined and clear the handle ref while inside the frame but off any handle', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.hoveredAutoLayoutGapRef.current = { axis: 'horizontal', frameId: 'frame-1', point: { x: 60, y: 25 } };

    // before
    const result = resolveAutoLayoutGapHover(createContext({ nodesById, point: { x: 200, y: 25 }, refs, selectedNodes: [frame] }));

    // result
    expect(result).toBeUndefined();
    expect(refs.hover.hoveredAutoLayoutGapRef.current).toBeNull();
    expect(refs.hover.isAutoLayoutGapAreaHoveredRef.current).toBe(true);
  });

  it('should return undefined and clear the area flag once the pointer leaves the frame bounds', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveAutoLayoutGapHover(createContext({ nodesById, point: { x: 900, y: 900 }, refs, selectedNodes: [frame] }));

    // result
    expect(result).toBeUndefined();
    expect(refs.hover.hoveredAutoLayoutGapRef.current).toBeNull();
    expect(refs.hover.isAutoLayoutGapAreaHoveredRef.current).toBe(false);
  });

  it('should return undefined when nothing is selected', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveAutoLayoutGapHover(createContext({ nodesById, point: { x: 60, y: 25 }, refs, selectedNodes: [] }));

    // result
    expect(result).toBeUndefined();
    expect(refs.hover.isAutoLayoutGapAreaHoveredRef.current).toBe(false);
  });

  it('should return undefined when the selected node is not an auto-layout frame', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    const result = resolveAutoLayoutGapHover(createContext({ nodesById, point: { x: 25, y: 25 }, refs, selectedNodes: [rectangle] }));

    // result
    expect(result).toBeUndefined();
  });
});
