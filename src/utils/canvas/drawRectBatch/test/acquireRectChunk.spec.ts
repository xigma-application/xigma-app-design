// types
import { TRectangleNode } from 'types/design/types';

// utils
import { acquireRectChunk } from '../acquireRectChunk';
import { getRectChunkCache } from '../getRectChunkCache';

const createNode = (id: string): TRectangleNode =>
  ({
    fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    height: 10,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: 'rectangle',
    width: 10,
    x: 0,
    y: 0,
  }) as unknown as TRectangleNode;

const createGl = (hasBuffer = true): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 1,
    STATIC_DRAW: 2,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => (hasBuffer ? {} : null)),
  }) as unknown as WebGL2RenderingContext;

describe('acquireRectChunk', () => {
  it('should build and register a chunk the first time', () => {
    // mock
    const gl = createGl();
    const run = [createNode('a')];

    // before
    const chunk = acquireRectChunk(gl, run, 1, () => 1);

    // result
    const cache = getRectChunkCache(gl);

    expect(chunk?.vertexCount).toBe(6);
    expect(cache.all.has(chunk!)).toBe(true);
    expect(cache.chunks.get(run[0])).toBe(chunk);
    expect(cache.touched.has(chunk!)).toBe(true);
  });

  it('should reuse the chunk while nodes and base opacity are unchanged', () => {
    // mock
    const gl = createGl();
    const run = [createNode('a'), createNode('b')];
    const first = acquireRectChunk(gl, run, 1, () => 1);

    // before
    const second = acquireRectChunk(gl, [...run], 1, () => 1);

    // result
    expect(second).toBe(first);
    expect(gl.bufferData).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['the base opacity changed', (run: TRectangleNode[]): TRectangleNode[] => run, 0.5],
    ['the run length changed', (run: TRectangleNode[]): TRectangleNode[] => [run[0]], 1],
    ['a node was replaced', (run: TRectangleNode[]): TRectangleNode[] => [run[0], createNode('b')], 1],
  ])('should rebuild when %s', (_, getNextRun, baseOpacity) => {
    // mock
    const gl = createGl();
    const run = [createNode('a'), createNode('b')];
    const first = acquireRectChunk(gl, run, 1, () => 1);

    // before
    const second = acquireRectChunk(gl, getNextRun(run), baseOpacity, () => 1);

    // result
    expect(second).not.toBe(first);
    expect(gl.bufferData).toHaveBeenCalledTimes(2);
  });

  it('should return null when no buffer can be created', () => {
    // before
    const chunk = acquireRectChunk(createGl(false), [createNode('a')], 1, () => 1);

    // result
    expect(chunk).toBeNull();
  });
});
