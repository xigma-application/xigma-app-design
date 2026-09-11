// types
import { ToolName } from 'types/design/enums';
import { THoverResolverContext } from '../../types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { resolveGridTrackAffordanceHandleHover } from '../resolveGridTrackAffordanceHandleHover';

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

describe('resolveGridTrackAffordanceHandleHover', () => {
  it('should return the hand class for the grip handle', () => {
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = {
      columnIndex: 0,
      frameId: 'frame-1',
      hoveredHandlePart: 'grip',
      hoveredPillAxis: 'column',
      rowIndex: 0,
    };

    expect(resolveGridTrackAffordanceHandleHover(createContext({ refs }))).toEqual({ className: 'hand', cursor: '', nodeId: null });
  });

  it('should return a text cursor for the value handle', () => {
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = {
      columnIndex: 0,
      frameId: 'frame-1',
      hoveredHandlePart: 'value',
      hoveredPillAxis: 'column',
      rowIndex: 0,
    };

    expect(resolveGridTrackAffordanceHandleHover(createContext({ refs }))).toEqual({ className: null, cursor: 'text', nodeId: null });
  });

  it('should leave the cursor untouched for the chevron handle', () => {
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = {
      columnIndex: 0,
      frameId: 'frame-1',
      hoveredHandlePart: 'chevron',
      hoveredPillAxis: 'column',
      rowIndex: 0,
    };

    expect(resolveGridTrackAffordanceHandleHover(createContext({ refs }))).toBeUndefined();
  });

  it('should return undefined when no handle part is hovered', () => {
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = {
      columnIndex: 0,
      frameId: 'frame-1',
      hoveredHandlePart: null,
      hoveredPillAxis: null,
      rowIndex: 0,
    };

    expect(resolveGridTrackAffordanceHandleHover(createContext({ refs }))).toBeUndefined();
  });

  it('should return undefined when there is no grid track affordance hover at all', () => {
    expect(resolveGridTrackAffordanceHandleHover(createContext({}))).toBeUndefined();
  });
});
