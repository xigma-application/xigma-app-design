// types
import { LayoutMode, NodeType, ToolName } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { THoverResolverContext } from '../../types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { resolveGridTrackAffordanceHover } from '../resolveGridTrackAffordanceHover';

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
  gridColumnCount: 3,
  height: 200,
  id: 'frame-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

const nodesById = { 'frame-1': frame };

describe('resolveGridTrackAffordanceHover', () => {
  it('should resolve both the hovered column and row when the pointer is over a cell deep inside the frame', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGridTrackAffordanceHover(createContext({ nodesById, point: { x: 250, y: 150 }, refs, selectedNodes: [frame] }));

    // result
    expect(refs.hover.hoveredGridTrackAffordanceRef.current).toEqual({ columnIndex: 2, frameId: 'frame-1', rowIndex: 0 });
  });

  it('should keep resolving from the extended top-left margin, outside the frame', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGridTrackAffordanceHover(createContext({ nodesById, point: { x: 150, y: -40 }, refs, selectedNodes: [frame] }));

    // result
    expect(refs.hover.hoveredGridTrackAffordanceRef.current).toEqual({ columnIndex: 1, frameId: 'frame-1', rowIndex: 0 });
  });

  it('should default to track 1x1 in the corner margin', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGridTrackAffordanceHover(createContext({ nodesById, point: { x: -40, y: -40 }, refs, selectedNodes: [frame] }));

    // result
    expect(refs.hover.hoveredGridTrackAffordanceRef.current).toEqual({ columnIndex: 0, frameId: 'frame-1', rowIndex: 0 });
  });

  it('should clear the ref and return undefined once the pointer leaves the extended zone', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = { columnIndex: 0, frameId: 'frame-1', rowIndex: 0 };

    // before
    const result = resolveGridTrackAffordanceHover(createContext({ nodesById, point: { x: 1000, y: 1000 }, refs, selectedNodes: [frame] }));

    // result
    expect(result).toBeUndefined();
    expect(refs.hover.hoveredGridTrackAffordanceRef.current).toBeNull();
  });

  it('should clear the ref and return undefined when nothing is selected', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = { columnIndex: 0, frameId: 'frame-1', rowIndex: 0 };

    // before
    const result = resolveGridTrackAffordanceHover(createContext({ nodesById, point: { x: 150, y: 100 }, refs, selectedNodes: [] }));

    // result
    expect(result).toBeUndefined();
    expect(refs.hover.hoveredGridTrackAffordanceRef.current).toBeNull();
  });
});
