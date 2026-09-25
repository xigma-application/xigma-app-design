// store
import { setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { armVectorBendSegmentOnPointerDown } from '../armVectorBendSegmentOnPointerDown';

const matchesMock = vi.fn();
const commitMock = vi.fn();

vi.mock('../../../../../../utils/getAllVectorEdgeMatchesAtPointAcrossOpenNodes', () => ({
  getAllVectorEdgeMatchesAtPointAcrossOpenNodes: (...args: unknown[]): unknown => matchesMock(...args),
}));
vi.mock('../../../../../../utils/commitVectorBendSegment', () => ({
  commitVectorBendSegment: (...args: unknown[]): unknown => commitMock(...args),
}));
vi.mock('../../../../../../utils/getVectorBendDragCandidates', () => ({ getVectorBendDragCandidates: (): string => 'candidates' }));

const createContext = (
  ctrlKey: boolean,
  metaKey = false,
): Record<string, unknown> & { selectionRefs: { vectorSegmentBendDragRef: { current: unknown } } } => ({
  canvas: { setPointerCapture: vi.fn() },
  canvasRefs: 'refs',
  dispatch: 'dispatch',
  event: { ctrlKey, metaKey, pointerId: 3 },
  point: { x: 1, y: 2 },
  selectionRefs: { vectorSegmentBendDragRef: { current: null } },
  viewport: { x: 0, y: 0, zoom: 1 },
});

describe('armVectorBendSegmentOnPointerDown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds(['v']));
  });

  afterAll(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should start bending the single segment under a Control press', () => {
    // mock
    const node = { id: 'v' };
    matchesMock.mockReturnValue({ matches: [{ segmentId: 's1' }], node });
    const ctx = createContext(true);

    // before
    const result = armVectorBendSegmentOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(commitMock).toHaveBeenCalledWith(node, 's1', { x: 1, y: 2 }, 'dispatch', 'refs', ctx.selectionRefs.vectorSegmentBendDragRef);
    expect((ctx.canvas as { setPointerCapture: TFunc }).setPointerCapture).toHaveBeenCalledWith(3);
  });

  it('should wait to pick among overlapping segments with the bend tool', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.bend));
    matchesMock.mockReturnValue({ matches: [{ segmentId: 's1' }, { segmentId: 's2' }], node: { id: 'v' } });
    const ctx = createContext(false);

    // before
    const result = armVectorBendSegmentOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(commitMock).not.toHaveBeenCalled();
    expect(ctx.selectionRefs.vectorSegmentBendDragRef.current).toEqual({
      candidates: 'candidates',
      dragStart: { x: 1, y: 2 },
      nodeId: 'v',
      status: 'pending',
    });
  });

  it('should leave the pointer alone with no segment under it, or without Control and the bend tool', () => {
    // mock
    matchesMock.mockReturnValue(null);

    // result
    expect(armVectorBendSegmentOnPointerDown(createContext(false, true) as never)).toBeUndefined();
    expect(armVectorBendSegmentOnPointerDown(createContext(false) as never)).toBeUndefined();
    expect(matchesMock).toHaveBeenCalledTimes(1);
  });
});
