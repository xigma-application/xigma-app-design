// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// utils
import { armVectorCornerHandleOnPointerDown } from '../armVectorCornerHandleOnPointerDown';

const hitMock = vi.fn();
const commitMock = vi.fn();

vi.mock('../../../../../../utils/getVectorCornerHandleAtPointAcrossOpenNodes', () => ({
  getVectorCornerHandleAtPointAcrossOpenNodes: (...args: unknown[]): unknown => hitMock(...args),
}));
vi.mock('../../../../../../utils/commitVectorCornerHandleDrag', () => ({
  commitVectorCornerHandleDrag: (...args: unknown[]): unknown => commitMock(...args),
}));
vi.mock('../../../../../../utils/getVectorCornerHandleDragCandidates', () => ({
  getVectorCornerHandleDragCandidates: (): string => 'candidates',
}));

const segment = (id: string, startId: string, endId: string): Record<string, unknown> => ({ endId, id, startId });

const createContext = (
  ctrlKey: boolean,
  metaKey = false,
): Record<string, unknown> & {
  selectionRefs: { pendingVectorCornerHandleDragRef: { current: unknown }; vectorHandleDragRef: string };
} => ({
  canvas: { setPointerCapture: vi.fn() },
  canvasRefs: 'refs',
  dispatch: 'dispatch',
  event: { ctrlKey, metaKey, pointerId: 3 },
  point: { x: 1, y: 2 },
  selectionRefs: { pendingVectorCornerHandleDragRef: { current: null }, vectorHandleDragRef: 'handleRef' },
  viewport: { x: 0, y: 0, zoom: 1 },
});

describe('armVectorCornerHandleOnPointerDown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.dispatch(setVectorEditingNodeIds(['v']));
  });

  afterAll(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should pull a handle out of an end vertex along its only segment', () => {
    // mock
    const node = { id: 'v', segments: { s1: segment('s1', 'a', 'b') } };
    hitMock.mockReturnValue({ node, vertexId: 'b' });

    // before
    const result = armVectorCornerHandleOnPointerDown(createContext(true) as never);

    // result
    expect(result).toBe(true);
    expect(commitMock).toHaveBeenCalledWith(node, 'b', { end: 'end', segmentId: 's1' }, 'dispatch', 'refs', 'handleRef');
  });

  it('should pull the start handle when the vertex starts its only segment', () => {
    // mock
    hitMock.mockReturnValue({ node: { id: 'v', segments: { s1: segment('s1', 'a', 'b') } }, vertexId: 'a' });

    // before
    armVectorCornerHandleOnPointerDown(createContext(false, true) as never);

    // result
    expect(commitMock.mock.calls[0][2]).toEqual({ end: 'start', segmentId: 's1' });
  });

  it('should wait to pick the segment of a vertex shared by several', () => {
    // mock
    hitMock.mockReturnValue({ node: { id: 'v', segments: { s1: segment('s1', 'a', 'b'), s2: segment('s2', 'b', 'c') } }, vertexId: 'b' });
    const ctx = createContext(true);

    // before
    const result = armVectorCornerHandleOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(ctx.selectionRefs.pendingVectorCornerHandleDragRef.current).toEqual({
      candidates: 'candidates',
      dragStart: { x: 1, y: 2 },
      nodeId: 'v',
      vertexId: 'b',
    });
  });

  it('should leave the pointer alone for a loose vertex, a miss, or without Control', () => {
    // mock
    hitMock.mockReturnValueOnce({ node: { id: 'v', segments: {} }, vertexId: 'z' }).mockReturnValueOnce(null);

    // result
    expect(armVectorCornerHandleOnPointerDown(createContext(true) as never)).toBeUndefined();
    expect(armVectorCornerHandleOnPointerDown(createContext(true) as never)).toBeUndefined();
    expect(armVectorCornerHandleOnPointerDown(createContext(false) as never)).toBeUndefined();
  });
});
