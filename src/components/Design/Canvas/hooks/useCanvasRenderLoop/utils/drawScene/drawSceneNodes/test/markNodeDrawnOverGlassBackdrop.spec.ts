// types
import { EffectType, NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getLineBoxFromPoints } from 'utils/canvas/line/getLineBoxFromPoints';
import { glassBackdropStates } from '../glassBackdropStates';
import { markNodeDrawnOverGlassBackdrop } from '../markNodeDrawnOverGlassBackdrop';

const markDirtyMock = vi.fn();
const scissorMock = vi.fn(() => 'scissor');

vi.mock('../markGlassBackdropDirty', () => ({ markGlassBackdropDirty: (...args: unknown[]): unknown => markDirtyMock(...args) }));
vi.mock('../getDeviceScissorRect', () => ({ getDeviceScissorRect: (...args: unknown[]): unknown => scissorMock(...(args as [])) }));

const createRenderer = (withBackdrop: boolean): TMaskRenderer => {
  const renderer = { context: { viewport: { zoom: 2 } } } as unknown as TMaskRenderer;
  glassBackdropStates.set(renderer, {
    backdrop: withBackdrop ? ({} as TRenderTarget) : null,
    dirty: [],
    fullyDirty: false,
    isMipmapped: false,
  });
  return renderer;
};

const rect = (extra: object = {}): TSceneNode =>
  ({ height: 10, id: 'r', rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0, ...extra }) as TSceneNode;

describe('markNodeDrawnOverGlassBackdrop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should dirty the padded device rect of the drawn node, grown by its stroke', () => {
    // mock
    const renderer = createRenderer(true);

    // before
    markNodeDrawnOverGlassBackdrop(renderer, rect({ effects: [{ type: EffectType.glass }], strokeWidth: 3 }));

    // result
    expect(scissorMock).toHaveBeenCalledWith(renderer, expect.any(Array), 20);
    expect(markDirtyMock).toHaveBeenCalledWith(renderer, 'scissor');
  });

  it('should dirty the whole backdrop for a node with a visible non-glass effect', () => {
    // mock
    const renderer = createRenderer(true);

    // before
    markNodeDrawnOverGlassBackdrop(renderer, rect({ effects: [{ type: EffectType.dropShadow }] }));

    // result
    expect(markDirtyMock).toHaveBeenCalledWith(renderer, null);
  });

  it('should pad unstroked nodes and nodes without a rotation by the fixed padding only', () => {
    // mock
    const renderer = createRenderer(true);

    // before
    markNodeDrawnOverGlassBackdrop(renderer, rect({ effects: [{ type: EffectType.dropShadow, visible: false }] }));
    markNodeDrawnOverGlassBackdrop(renderer, {
      id: 'l',
      type: NodeType.line,
      ...getLineBoxFromPoints({ x1: 0, x2: 1, y1: 0, y2: 1 }),
    } as TSceneNode);
    markNodeDrawnOverGlassBackdrop(renderer, rect({ effects: undefined, strokeWidth: undefined }));

    // result
    expect(scissorMock.mock.calls.map((call) => (call as unknown[])[2])).toEqual([8, 8, 8]);
  });

  it('should do nothing while no backdrop is captured', () => {
    // before
    markNodeDrawnOverGlassBackdrop(createRenderer(false), rect());

    // result
    expect(markDirtyMock).not.toHaveBeenCalled();
  });
});
