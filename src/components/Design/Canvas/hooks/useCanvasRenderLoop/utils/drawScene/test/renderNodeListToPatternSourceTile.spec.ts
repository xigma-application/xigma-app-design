// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { createGlProxy } from 'test/createGlProxy';
import { renderNodeListToPatternSourceTile } from '../renderNodeListToPatternSourceTile';

const drawLeafNodeMock = vi.fn();
const setAlphaWriteEnabledMock = vi.fn();

vi.mock('../drawLeafNode', () => ({ drawLeafNode: (...args: unknown[]): unknown => drawLeafNodeMock(...args) }));
vi.mock('utils/canvas/setAlphaWriteEnabled', () => ({
  setAlphaWriteEnabled: (...args: unknown[]): unknown => setAlphaWriteEnabledMock(...args),
}));

describe('renderNodeListToPatternSourceTile', () => {
  it('should draw the subtree into an offscreen tile framed on the bounds, then restore the GL state', () => {
    // mock
    const previousViewport = Int32Array.from([1, 2, 3, 4]);
    const gl = createGlProxy({
      getParameter: vi.fn((name: string) =>
        name === 'VIEWPORT' ? previousViewport : name === 'FRAMEBUFFER_BINDING' ? 'previous-fb' : name,
      ),
    });
    const target = { framebuffer: 'fb', height: 50, texture: 'texture', width: 100 };
    const pool = { acquire: vi.fn(() => target), release: vi.fn() };
    const originalViewport = { x: 0, y: 0, zoom: 1 };
    const context = {
      canvasHeight: 100,
      canvasWidth: 200,
      gl,
      imageContext: { isAlphaWriteEnabled: false, renderTargetPool: pool },
      viewport: originalViewport,
    } as unknown as TDrawSceneContext;
    const node = { id: 'n' } as TSceneNode;
    const refs = {} as TCanvasRefs;

    // before
    const { release, tile } = renderNodeListToPatternSourceTile(context, [node], {}, new Map(), refs, null, 2, {
      height: 20,
      width: 40,
      x: 10,
      y: 5,
    });

    // result
    expect(drawLeafNodeMock).toHaveBeenCalledWith(context, node, new Map(), refs, {}, null, 3);
    expect(tile).toEqual({ height: 20, texture: 'texture', viewport: { x: -50, y: -25, zoom: 5 }, width: 40, x: 10, y: 5 });
    expect(context.viewport).toBe(originalViewport);
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith('FRAMEBUFFER', 'previous-fb');
    expect(gl.viewport).toHaveBeenLastCalledWith(1, 2, 3, 4);
    expect(gl.blendFuncSeparate).toHaveBeenLastCalledWith('BLEND_SRC_RGB', 'BLEND_DST_RGB', 'BLEND_SRC_ALPHA', 'BLEND_DST_ALPHA');
    expect(setAlphaWriteEnabledMock).toHaveBeenLastCalledWith(gl, context.imageContext, false);

    // action
    release();

    // result
    expect(pool.release).toHaveBeenCalledWith(target);
  });
});
