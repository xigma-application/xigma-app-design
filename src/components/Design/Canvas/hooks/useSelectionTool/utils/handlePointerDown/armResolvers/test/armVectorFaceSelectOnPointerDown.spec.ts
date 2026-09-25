// store
import { setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { armVectorFaceSelectOnPointerDown } from '../armVectorFaceSelectOnPointerDown';

const faceHitMock = vi.fn();
const persistMock = vi.fn();
const armGroupDragMock = vi.fn();

vi.mock('../../../../../../utils/getVectorFaceAtPointAcrossOpenNodes', () => ({
  getVectorFaceAtPointAcrossOpenNodes: (...args: unknown[]): unknown => faceHitMock(...args),
}));
vi.mock('../../../../../../utils/getVectorFaceAtPoint', () => ({ getVectorFaceAtPoint: (): string => 'face' }));
vi.mock('../../../../../../utils/bakeVectorNodeRotation', () => ({ bakeVectorNodeRotation: (): unknown => ({}) }));
vi.mock('utils/canvas/vectorNetwork/getVectorFaceVertexIds', () => ({ getVectorFaceVertexIds: (): string[] => ['f1', 'f2'] }));
vi.mock('utils/canvas/vectorNetwork/planarizeVectorNetwork/persistVectorNetworkCrossings', () => ({
  persistVectorNetworkCrossings: (...args: unknown[]): unknown => persistMock(...args),
}));
vi.mock('../../armVectorGroupDrag', () => ({ armVectorGroupDrag: (...args: unknown[]): unknown => armGroupDragMock(...args) }));

const segments = { s: 'segment' };
const vertices = { v: 'vertex' };

const createContext = (
  activeTool: ToolName,
  shiftKey: boolean,
): Record<string, unknown> & {
  canvasRefs: { vectorEdit: Record<string, { current: string[] }> };
  dispatch: TFunc;
} => ({
  activeTool,
  canvas: 'canvas',
  canvasRefs: {
    vectorEdit: {
      selectedVectorHandlesRef: { current: ['h'] },
      selectedVectorSegmentIdsRef: { current: ['s'] },
      selectedVectorVertexIdsRef: { current: ['f1', 'old'] },
    },
  },
  dispatch: vi.fn(),
  event: { shiftKey },
  point: { x: 1, y: 2 },
});

describe('armVectorFaceSelectOnPointerDown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.dispatch(setVectorEditingNodeIds(['v']));
    faceHitMock.mockReturnValue({ node: { id: 'v', segments, vertices } });
  });

  afterAll(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should select the vertices of the clicked face, clear handles and segments, and drag them', () => {
    // mock
    persistMock.mockReturnValue({ segments, vertices });
    const ctx = createContext(ToolName.move, false);

    // before
    const result = armVectorFaceSelectOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(ctx.dispatch).not.toHaveBeenCalled();
    expect(ctx.canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['f1', 'f2']);
    expect(ctx.canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
    expect(ctx.canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(armGroupDragMock).toHaveBeenCalledWith('canvas', ctx.event, ctx.canvasRefs, { x: 1, y: 2 }, null);
  });

  it('should add the face to the selection with Shift and persist new crossings first', () => {
    // mock
    persistMock.mockReturnValue({ segments: { s: 'split' }, vertices: { v: 'vertex', x: 'crossing' } });
    const ctx = createContext(ToolName.move, true);

    // before
    armVectorFaceSelectOnPointerDown(ctx as never);

    // result
    expect(ctx.dispatch).toHaveBeenCalledWith(
      updateNode({ changes: { segments: { s: 'split' }, vertices: { v: 'vertex', x: 'crossing' } } as never, id: 'v' }),
    );
    expect(ctx.canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['f1', 'old', 'f2']);
    expect(ctx.canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual(['h']);
  });

  it('should leave the pointer alone off any face, with another tool or nothing being edited', () => {
    // mock
    faceHitMock.mockReturnValue(null);

    // result
    expect(armVectorFaceSelectOnPointerDown(createContext(ToolName.move, false) as never)).toBeUndefined();
    expect(armVectorFaceSelectOnPointerDown(createContext(ToolName.cut, false) as never)).toBeUndefined();
    store.dispatch(setVectorEditingNodeIds([]));
    expect(armVectorFaceSelectOnPointerDown(createContext(ToolName.move, false) as never)).toBeUndefined();
  });
});
