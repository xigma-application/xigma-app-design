// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { getGridTrackAffordanceDragSceneNodes } from '../getGridTrackAffordanceDragSceneNodes';

const getGridTrackAffordanceDragOffsetMock = vi.fn();
const getGridTrackAffordanceOffsetNodesByIdMock = vi.fn();
const getGridTrackLayoutMock = vi.fn();

vi.mock('utils/canvas/gridSlots/getGridTrackAffordanceDragOffset', () => ({
  getGridTrackAffordanceDragOffset: (...args: unknown[]): unknown => getGridTrackAffordanceDragOffsetMock(...args),
}));
vi.mock('utils/canvas/gridSlots/getGridTrackAffordanceOffsetNodesById', () => ({
  getGridTrackAffordanceOffsetNodesById: (...args: unknown[]): unknown => getGridTrackAffordanceOffsetNodesByIdMock(...args),
}));
vi.mock('utils/canvas/gridSlots/getGridTrackLayout', () => ({
  getGridTrackLayout: (...args: unknown[]): unknown => getGridTrackLayoutMock(...args),
}));

const frame: TFrameNode = {
  childIds: ['a'],
  clipContent: true,
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'frame-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
};

const childA: TSceneNode = {
  fills: [{ color: '#000', opacity: 100, type: 'solid' }],
  height: 20,
  id: 'a',
  name: 'a',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 30,
  x: 0,
  y: 0,
};

const dragStateFor = (overrides: Partial<TGridTrackAffordanceDragState> = {}): TGridTrackAffordanceDragState => ({
  axis: 'column',
  dropIndex: 0,
  frameId: 'frame-1',
  ghostPosition: { x: 0, y: 0 },
  hasMoved: true,
  sourceIndices: [0],
  ...overrides,
});

describe('getGridTrackAffordanceDragSceneNodes', () => {
  beforeEach(() => {
    getGridTrackAffordanceDragOffsetMock.mockReset().mockReturnValue(15);
    getGridTrackAffordanceOffsetNodesByIdMock.mockReset();
    getGridTrackLayoutMock.mockReset().mockReturnValue({});
  });

  it('should return the given nodes/scene unchanged when nothing is being dragged', () => {
    // mock
    const nodesById = { a: childA, 'frame-1': frame };
    const sceneNodes = [frame, childA];

    // action
    const result = getGridTrackAffordanceDragSceneNodes(createCanvasRefs(), nodesById, sceneNodes);

    // result
    expect(result).toEqual({ nodesById, sceneNodes });
    expect(getGridTrackAffordanceDragOffsetMock).not.toHaveBeenCalled();
  });

  it('should return the given nodes/scene unchanged while the drag has not moved yet', () => {
    // mock
    const nodesById = { a: childA, 'frame-1': frame };
    const sceneNodes = [frame, childA];
    const refs = createCanvasRefs({ transform: { gridTrackAffordanceDragRef: { current: dragStateFor({ hasMoved: false }) } } });

    // action
    const result = getGridTrackAffordanceDragSceneNodes(refs, nodesById, sceneNodes);

    // result
    expect(result).toEqual({ nodesById, sceneNodes });
    expect(getGridTrackAffordanceDragOffsetMock).not.toHaveBeenCalled();
  });

  it('should return the given nodes/scene unchanged when the dragged frame no longer exists', () => {
    // mock
    const nodesById = { a: childA };
    const sceneNodes = [childA];
    const refs = createCanvasRefs({ transform: { gridTrackAffordanceDragRef: { current: dragStateFor() } } });

    // action
    const result = getGridTrackAffordanceDragSceneNodes(refs, nodesById, sceneNodes);

    // result
    expect(result).toEqual({ nodesById, sceneNodes });
  });

  it('should return the given nodes/scene unchanged when the resolved target is not a frame', () => {
    // mock
    const rectAsTarget = { ...childA, id: 'frame-1' };
    const nodesById = { 'frame-1': rectAsTarget };
    const sceneNodes = [rectAsTarget];
    const refs = createCanvasRefs({ transform: { gridTrackAffordanceDragRef: { current: dragStateFor() } } });

    // action
    const result = getGridTrackAffordanceDragSceneNodes(refs, nodesById, sceneNodes);

    // result
    expect(result).toEqual({ nodesById, sceneNodes });
  });

  it('should return offset nodes and remapped scene nodes when the offset actually changes the nodes', () => {
    // mock
    const nodesById = { a: childA, 'frame-1': frame };
    const sceneNodes = [frame, childA];
    const offsetChildA = { ...childA, x: 15 };
    const offsetNodesById = { a: offsetChildA, 'frame-1': frame };

    getGridTrackAffordanceOffsetNodesByIdMock.mockReturnValue(offsetNodesById);

    const refs = createCanvasRefs({ transform: { gridTrackAffordanceDragRef: { current: dragStateFor() } } });

    // action
    const result = getGridTrackAffordanceDragSceneNodes(refs, nodesById, sceneNodes);

    // result — the offset map is applied to every scene node, by id, falling back to the original
    expect(result.nodesById).toBe(offsetNodesById);
    expect(result.sceneNodes).toEqual([frame, offsetChildA]);
  });

  it('should keep a scene node as-is when it has no entry in the offset map', () => {
    // mock — a sibling node outside the dragged frame's own children
    const sibling: TSceneNode = { ...childA, id: 'sibling' };
    const nodesById = { a: childA, 'frame-1': frame, sibling };
    const sceneNodes = [frame, childA, sibling];
    const offsetNodesById = { a: { ...childA, x: 15 }, 'frame-1': frame };

    getGridTrackAffordanceOffsetNodesByIdMock.mockReturnValue(offsetNodesById);

    const refs = createCanvasRefs({ transform: { gridTrackAffordanceDragRef: { current: dragStateFor() } } });

    // action
    const result = getGridTrackAffordanceDragSceneNodes(refs, nodesById, sceneNodes);

    // result — sibling has no entry in offsetNodesById, so it passes through unchanged
    expect(result.sceneNodes[2]).toBe(sibling);
  });

  it('should return the given nodes/scene unchanged when the offset step reports no change', () => {
    // mock — the offset resolver decided nothing needed to move (e.g. no children in the dragged track)
    const nodesById = { a: childA, 'frame-1': frame };
    const sceneNodes = [frame, childA];

    getGridTrackAffordanceOffsetNodesByIdMock.mockReturnValue(nodesById);

    const refs = createCanvasRefs({ transform: { gridTrackAffordanceDragRef: { current: dragStateFor() } } });

    // action
    const result = getGridTrackAffordanceDragSceneNodes(refs, nodesById, sceneNodes);

    // result
    expect(result).toEqual({ nodesById, sceneNodes });
  });
});
