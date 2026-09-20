// types
import { TMaskRenderer } from '../types';

// utils
import { drawIsolatedContent } from '../drawIsolatedContent';

const drawEffectTextureMock = vi.fn();

vi.mock('../../drawBoxLeafNode/drawEffectTexture', () => ({
  drawEffectTexture: (...args: unknown[]): void => drawEffectTextureMock(...args),
}));

describe('drawIsolatedContent', () => {
  it('should draw the isolated texture over the whole visible canvas in world units, without a rotation or extra opacity', () => {
    // mock
    const context = { canvasHeight: 400, canvasWidth: 800, viewport: { x: 100, y: 40, zoom: 2 } };
    const texture = { tag: 'texture' } as unknown as WebGLTexture;

    // action
    drawIsolatedContent({ context } as unknown as TMaskRenderer, texture);

    // result
    expect(drawEffectTextureMock).toHaveBeenCalledWith(context, texture, { height: 200, width: 400, x: -50, y: -20 }, 0, 1);
  });
});
