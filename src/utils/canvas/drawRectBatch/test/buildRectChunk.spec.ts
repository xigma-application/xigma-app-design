// types
import { TRectangleNode } from 'types/design/types';

// utils
import { buildRectChunk } from '../buildRectChunk';
import { createRectBatch } from '../createRectBatch';

const createNode = (x: number): TRectangleNode =>
  ({
    fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    height: 10,
    id: `r${x}`,
    name: 'r',
    parentId: null,
    rotation: 0,
    type: 'rectangle',
    width: 10,
    x,
    y: 0,
  }) as unknown as TRectangleNode;

const createGl = (buffer: WebGLBuffer | null): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 1,
    STATIC_DRAW: 2,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => buffer),
  }) as unknown as WebGL2RenderingContext;

describe('buildRectChunk', () => {
  it('should upload every quad into a static buffer and report the chunk bounds', () => {
    // mock
    const buffer = {} as WebGLBuffer;
    const gl = createGl(buffer);
    const scratch = createRectBatch();
    const nodes = [createNode(0), createNode(20)];

    // before
    const chunk = buildRectChunk(gl, scratch, nodes, 0.5, () => 1);

    // result
    expect(chunk).toEqual({ baseOpacity: 0.5, bounds: { maxX: 30, maxY: 10, minX: 0, minY: 0 }, buffer, nodes, vertexCount: 12 });
    expect(gl.bufferData).toHaveBeenCalledWith(1, expect.any(Float32Array), 2);
    expect(scratch.floatCount).toBe(0);
  });

  it('should return null when no buffer can be created', () => {
    // before
    const chunk = buildRectChunk(createGl(null), createRectBatch(), [createNode(0)], 1, () => 1);

    // result
    expect(chunk).toBeNull();
  });
});
