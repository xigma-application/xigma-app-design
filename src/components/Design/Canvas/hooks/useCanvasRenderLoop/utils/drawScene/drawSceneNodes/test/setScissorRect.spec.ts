// utils
import { setScissorRect } from '../setScissorRect';

const createGl = (): WebGL2RenderingContext =>
  ({ SCISSOR_TEST: 3089, disable: vi.fn(), enable: vi.fn(), scissor: vi.fn() }) as unknown as WebGL2RenderingContext;

describe('setScissorRect', () => {
  it('should enable the scissor test with the rect when one is given', () => {
    // mock
    const gl = createGl();

    // action
    setScissorRect(gl, { height: 4, width: 3, x: 1, y: 2 });

    // result
    expect(gl.enable).toHaveBeenCalledWith(3089);
    expect(gl.scissor).toHaveBeenCalledWith(1, 2, 3, 4);
  });

  it('should disable the scissor test when the rect is null', () => {
    // mock
    const gl = createGl();

    // action
    setScissorRect(gl, null);

    // result
    expect(gl.disable).toHaveBeenCalledWith(3089);
    expect(gl.enable).not.toHaveBeenCalled();
  });
});
