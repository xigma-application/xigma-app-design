// types
import { EffectType, NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { applyBackgroundBlur } from '../applyBackgroundBlur';
import { createEffect } from 'utils/design/effects/createEffect';

const calls: string[] = [];
const bindTargetMock = vi.fn();
const blurIsolatedTargetMock = vi.fn();
const compositeMaskMock = vi.fn();
const paintBackgroundBlurShapeMock = vi.fn();

vi.mock('../bindTarget', () => ({ bindTarget: (...args: unknown[]): number => calls.push('bind') && bindTargetMock(...args) }));
vi.mock('../captureBackdropTexture', () => ({
  captureBackdropTexture: (): unknown => ({ tag: 'backdrop', texture: { tag: 'backdrop-tex' } }),
}));
vi.mock('../blurIsolatedTarget', () => ({
  blurIsolatedTarget: (...args: unknown[]): number => calls.push('blur') && blurIsolatedTargetMock(...args),
}));
vi.mock('../../compositeMask', () => ({
  compositeMask: (...args: unknown[]): number => calls.push('composite') && compositeMaskMock(...args),
}));
vi.mock('../paintBackgroundBlurShape', () => ({
  paintBackgroundBlurShape: (...args: unknown[]): number => calls.push('shape') && paintBackgroundBlurShapeMock(...args),
}));
vi.mock('../renderIntoTarget', () => ({
  renderIntoTarget: (_renderer: unknown, _target: unknown, paint: () => void): void => {
    calls.push('render');
    paint();
  },
}));

const node: TRectangleNode = {
  effects: [{ ...createEffect(EffectType.backgroundBlur), blur: 4 }],
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 60,
  x: 0,
  y: 0,
};

const createRenderer = (): { pool: { acquire: ReturnType<typeof vi.fn>; release: ReturnType<typeof vi.fn> }; renderer: TMaskRenderer } => {
  const pool = { acquire: vi.fn(() => ({ tag: 'mask', texture: { tag: 'mask-tex' } })), release: vi.fn() };

  return {
    pool,
    renderer: {
      context: { canvasWidth: 1000, viewport: { x: 0, y: 0, zoom: 1 } },
      gl: { drawingBufferHeight: 1000, drawingBufferWidth: 1000 },
      pool,
    } as unknown as TMaskRenderer,
  };
};

describe('applyBackgroundBlur', () => {
  beforeEach(() => {
    calls.length = 0;
    vi.clearAllMocks();
  });

  it('should blur a copy of what is already drawn, clip it to the node shape and composite it, then release both targets', () => {
    // mock
    const { pool, renderer } = createRenderer();

    // action
    applyBackgroundBlur(renderer, node, null);

    // result
    expect(calls).toEqual(['bind', 'blur', 'render', 'shape', 'bind', 'composite']);
    expect(blurIsolatedTargetMock).toHaveBeenCalledWith(renderer, expect.objectContaining({ tag: 'backdrop' }), 4, undefined);
    expect(compositeMaskMock).toHaveBeenCalledWith(renderer.context, { tag: 'backdrop-tex' }, { tag: 'mask-tex' });
    expect(pool.release).toHaveBeenCalledTimes(2);
  });

  it('should do nothing without a background blur', () => {
    // mock
    const { pool, renderer } = createRenderer();

    // action
    applyBackgroundBlur(renderer, { ...node, effects: [createEffect(EffectType.layerBlur)] }, null);
    applyBackgroundBlur(renderer, { ...node, effects: [{ ...createEffect(EffectType.backgroundBlur), blur: 0 }] }, null);

    // result
    expect(calls).toEqual([]);
    expect(pool.acquire).not.toHaveBeenCalled();
  });
});
