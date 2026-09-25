// others
import { EFFECT_VERTEX_ATTRIBUTE_SLOTS } from '../constants';

// utils
import { resetEffectVertexAttributes } from '../resetEffectVertexAttributes';

describe('resetEffectVertexAttributes', () => {
  it('should disable every effect attribute slot and enable only the position attribute', () => {
    // mock
    const gl = { disableVertexAttribArray: vi.fn(), enableVertexAttribArray: vi.fn() } as unknown as WebGL2RenderingContext;

    // before
    resetEffectVertexAttributes(gl, 3);

    // result
    expect(gl.disableVertexAttribArray).toHaveBeenCalledTimes(EFFECT_VERTEX_ATTRIBUTE_SLOTS);
    expect(gl.enableVertexAttribArray).toHaveBeenCalledWith(3);
  });
});
