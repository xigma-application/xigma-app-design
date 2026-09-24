// types
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';

// utils
import { buildDotBuffer } from '../buildDotBuffer';

const layout: TSmartSelectionLayout = {
  gaps: [],
  nodes: [
    { bounds: { height: 10, width: 10, x: 0, y: 0 }, id: 'a' },
    { bounds: { height: 10, width: 10, x: 100, y: 0 }, id: 'b' },
  ],
  type: 'row',
};

const createGl = (hasBuffer: boolean): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 1,
    STATIC_DRAW: 2,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => (hasBuffer ? { tag: 'buffer' } : null)),
  }) as unknown as WebGL2RenderingContext;

describe('buildDotBuffer', () => {
  it('should upload the dots once and describe them by buffer, layout, zoom and vertex count', () => {
    // mock
    const gl = createGl(true);

    // before
    const built = buildDotBuffer(gl, layout, 2);

    // result
    expect(gl.bufferData).toHaveBeenCalledTimes(1);
    expect(built).toEqual({ buffer: { tag: 'buffer' }, layout, vertexCount: 2 * 2 * 12 * 3, zoom: 2 });
  });

  it('should start every build from an empty scratch batch', () => {
    // mock
    const gl = createGl(true);

    // before
    const first = buildDotBuffer(gl, layout, 1);
    const second = buildDotBuffer(gl, layout, 1);

    // result
    expect(second?.vertexCount).toBe(first?.vertexCount);
  });

  it('should be null when no buffer can be created', () => {
    // result
    expect(buildDotBuffer(createGl(false), layout, 1)).toBeNull();
  });
});
