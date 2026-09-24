// types
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';

// utils
import { getDotBuffer } from '../getDotBuffer';

const createLayout = (): TSmartSelectionLayout => ({
  gaps: [],
  nodes: [{ bounds: { height: 10, width: 10, x: 0, y: 0 }, id: 'a' }],
  type: 'row',
});

const createGl = (hasBuffer = true): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 1,
    STATIC_DRAW: 2,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => (hasBuffer ? {} : null)),
    deleteBuffer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('getDotBuffer', () => {
  it('should reuse the buffer for the same layout and zoom', () => {
    // mock
    const gl = createGl();
    const layout = createLayout();

    // before
    const first = getDotBuffer(gl, layout, 1);

    // result
    expect(getDotBuffer(gl, layout, 1)).toBe(first);
    expect(gl.createBuffer).toHaveBeenCalledTimes(1);
  });

  it('should delete the old buffer and build a new one when the layout or the zoom changes', () => {
    // mock
    const gl = createGl();
    const layout = createLayout();
    const first = getDotBuffer(gl, layout, 1);

    // before
    const zoomed = getDotBuffer(gl, layout, 2);
    const moved = getDotBuffer(gl, createLayout(), 2);

    // result
    expect(gl.deleteBuffer).toHaveBeenCalledWith(first?.buffer);
    expect(gl.deleteBuffer).toHaveBeenCalledWith(zoomed?.buffer);
    expect(moved).not.toBe(zoomed);
  });

  it('should return null and cache nothing when no buffer can be created', () => {
    // mock
    const gl = createGl(false);
    const layout = createLayout();

    // before
    getDotBuffer(gl, layout, 1);

    // result
    expect(getDotBuffer(gl, layout, 1)).toBeNull();
    expect(gl.createBuffer).toHaveBeenCalledTimes(2);
  });
});
