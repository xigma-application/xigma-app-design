// types
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { bindTarget } from '../bindTarget';
import { renderIntoTarget } from '../renderIntoTarget';

vi.mock('../bindTarget', () => ({ bindTarget: vi.fn() }));

const createGlMock = (): WebGL2RenderingContext =>
  ({
    COLOR_BUFFER_BIT: 16384,
    STENCIL_BUFFER_BIT: 1024,
    clear: vi.fn(),
    clearColor: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('renderIntoTarget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should bind the target, clear it to transparent, then run the paint callback — in that order', () => {
    const gl = createGlMock();
    const renderer = { gl } as unknown as TMaskRenderer;
    const target = { id: 'target' } as unknown as TRenderTarget;
    const calls: string[] = [];

    (bindTarget as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => calls.push('bind'));
    (gl.clear as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => calls.push('clear'));
    const paint = vi.fn(() => calls.push('paint'));

    renderIntoTarget(renderer, target, paint);

    expect(bindTarget).toHaveBeenCalledWith(renderer, target);
    expect(gl.clearColor).toHaveBeenCalledWith(0, 0, 0, 0);
    expect(gl.clear).toHaveBeenCalledWith(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    expect(paint).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['bind', 'clear', 'paint']);
  });
});
