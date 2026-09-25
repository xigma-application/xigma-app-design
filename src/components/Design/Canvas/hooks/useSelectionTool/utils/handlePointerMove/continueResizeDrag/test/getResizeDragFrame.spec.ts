// store
import { addNodes, setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getResizeDragFrame } from '../getResizeDragFrame';

const factorsMock = vi.fn();
const maskMock = vi.fn();

vi.mock('utils/math/pointer/getPointerPosition', () => ({ getPointerPosition: (): unknown => ({ x: 0, y: 0 }) }));
vi.mock('../getResizeQueryPoint', () => ({ getResizeQueryPoint: (): string => 'query' }));
vi.mock('../getRawResizeSnap', () => ({ getRawResizeSnap: (): string => 'raw-snap' }));
vi.mock('../maskSnapToActiveAxes', () => ({ maskSnapToActiveAxes: (...args: unknown[]): unknown => maskMock(...args) }));
vi.mock('../getResizeOrScaleFactors', () => ({ getResizeOrScaleFactors: (...args: unknown[]): unknown => factorsMock(...args) }));
vi.mock('../getResizeAnchorSolver', () => ({ getResizeAnchorSolver: (): string => 'solver' }));

const bounds = { height: 10, width: 10, x: 0, y: 0 };
const frame = (handle: string, shiftKey = false, nodeId?: string): ReturnType<typeof getResizeDragFrame> =>
  getResizeDragFrame({} as HTMLCanvasElement, { shiftKey } as PointerEvent, bounds, handle as never, 1, null, [], nodeId);

describe('getResizeDragFrame', () => {
  beforeAll(() => {
    store.dispatch(
      addNodes({
        nodes: [
          { id: 'rdf-locked', lockedAspectRatio: true, type: NodeType.rectangle } as unknown as TSceneNode,
          { id: 'rdf-free', type: NodeType.rectangle } as unknown as TSceneNode,
          { id: 'rdf-line', type: NodeType.line } as unknown as TSceneNode,
        ],
        rootIds: [],
      }),
    );
  });

  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    maskMock.mockReturnValue({ guide: 'guide', point: 'snapped' });
    factorsMock.mockReturnValue({ anchors: { x: 0, y: null }, scaleX: 2, scaleY: 1 });
  });

  it('should resize freely along the axes the handle moves', () => {
    // before
    const result = frame('e', false, 'rdf-free');

    // result
    expect(result).toEqual({
      alignmentGuide: 'guide',
      anchors: { x: 0, y: null },
      isAspectLocked: false,
      rotatedAnchorSolver: 'solver',
      scaleX: 2,
      scaleY: 1,
    });
    expect(maskMock).toHaveBeenCalledWith('raw-snap', 'query', true, false);
    expect(factorsMock).toHaveBeenCalledWith(false, 'e', bounds, 'snapped', 1, false);
  });

  it('should lock the aspect ratio with Shift, for a locked node, or with the scale tool', () => {
    // result
    expect(frame('nw', true).isAspectLocked).toBe(true);
    expect(maskMock).toHaveBeenLastCalledWith('raw-snap', 'query', true, true);
    expect(frame('s', false, 'rdf-locked').isAspectLocked).toBe(true);
    expect(frame('n', false, 'rdf-line').isAspectLocked).toBe(false);
    store.dispatch(setActiveTool(ToolName.scale));
    expect(frame('se').isAspectLocked).toBe(true);
    expect(factorsMock).toHaveBeenLastCalledWith(true, 'se', bounds, 'snapped', 1, false);
  });
});
