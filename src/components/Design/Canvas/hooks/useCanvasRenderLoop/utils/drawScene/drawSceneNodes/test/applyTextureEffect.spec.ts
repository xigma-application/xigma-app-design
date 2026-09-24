// types
import { EffectType, NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { applyTextureEffect } from '../applyTextureEffect';
import { createEffect } from 'utils/design/effects/createEffect';

const drawTexturePassMock = vi.fn();

vi.mock('../drawTexturePass', () => ({ drawTexturePass: (...args: unknown[]): void => drawTexturePassMock(...args) }));
vi.mock('../bindTarget', () => ({ bindTarget: vi.fn() }));
vi.mock('../setScissorRect', () => ({ setScissorRect: vi.fn() }));
vi.mock('../renderIntoTarget', () => ({ renderIntoTarget: vi.fn() }));

const createRenderer = (): TMaskRenderer =>
  ({
    context: {},
    gl: new Proxy({} as Record<string, unknown>, { get: (target, key: string) => target[key] ?? vi.fn() }),
    paintLeaf: vi.fn(),
    pool: { acquire: (): unknown => ({ framebuffer: {}, height: 1, texture: {}, width: 1 }), release: vi.fn() },
  }) as unknown as TMaskRenderer;

describe('applyTextureEffect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should texture a boolean like a leaf, without laying its untouched shape underneath', () => {
    // mock
    const node = {
      childIds: ['a', 'b'],
      effects: [createEffect(EffectType.texture)],
      id: 'union',
      type: NodeType.boolean,
    } as unknown as TSceneNode;

    // action
    applyTextureEffect(createRenderer(), node, { framebuffer: {}, height: 1, texture: {}, width: 1 } as never, null);

    // result
    expect(drawTexturePassMock).toHaveBeenCalledWith(
      expect.anything(),
      node,
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ hasUnderlay: false }),
    );
  });

  it('should lay the untouched content underneath for a frame with children', () => {
    // mock
    const node = {
      childIds: ['a'],
      effects: [createEffect(EffectType.texture)],
      id: 'frame',
      type: NodeType.frame,
    } as unknown as TSceneNode;

    // action
    applyTextureEffect(createRenderer(), node, { framebuffer: {}, height: 1, texture: {}, width: 1 } as never, null);

    // result
    expect(drawTexturePassMock).toHaveBeenCalledWith(
      expect.anything(),
      node,
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ hasUnderlay: true }),
    );
  });
});
