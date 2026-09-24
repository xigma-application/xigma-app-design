// types
import { TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getRectSegments } from '../getRectSegments';
import { sweepRectChunks } from 'utils/canvas/drawRectBatch/sweepRectChunks';

const createRect = (id: string, parentId: string | null = null): TSceneNode =>
  ({
    fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    height: 10,
    id,
    name: id,
    parentId,
    rotation: 0,
    type: 'rectangle',
    width: 10,
    x: 0,
    y: 0,
  }) as unknown as TSceneNode;

const createEllipse = (id: string): TSceneNode => ({ id, type: 'ellipse' }) as unknown as TSceneNode;

const createGl = (hasBuffers = true): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 1,
    STATIC_DRAW: 2,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => (hasBuffers ? {} : null)),
    deleteBuffer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('getRectSegments', () => {
  it('should collapse consecutive plain top-level rectangles into a single chunk', () => {
    // before
    const segments = getRectSegments(createGl(), [createRect('a'), createRect('b')], {});

    // result
    expect(segments).toHaveLength(1);
    expect('chunk' in segments[0] && segments[0].chunk.nodes).toHaveLength(2);
  });

  it('should keep the draw order around a node that cannot be batched', () => {
    // mock
    const ellipse = createEllipse('e');

    // before
    const segments = getRectSegments(createGl(), [createRect('a'), ellipse, createRect('b')], {});

    // result
    expect(segments.map((segment) => ('chunk' in segment ? 'chunk' : 'node'))).toEqual(['chunk', 'node', 'chunk']);
    expect(segments[1]).toEqual({ node: ellipse });
  });

  it('should chunk nested rectangles separately per parent with the parent opacity as the base', () => {
    // mock
    const parent = { id: 'p', opacity: 0.5, parentId: null, type: 'frame', x: 0, y: 0 } as unknown as TSceneNode;
    const nodes = [createRect('a', 'p'), createRect('b', 'p'), createRect('c', 'q')];

    // before
    const segments = getRectSegments(createGl(), nodes, { p: parent });

    // result
    expect(segments).toHaveLength(2);
    expect('chunk' in segments[0] && segments[0].chunk.baseOpacity).toBe(0.5);
    expect('chunk' in segments[1] && segments[1].chunk.baseOpacity).toBe(1);
  });

  it('should split a long run into several chunks', () => {
    // mock
    const nodes = Array.from({ length: 513 }, (_, index) => createRect(`r${index}`));

    // before
    const segments = getRectSegments(createGl(), nodes, {});

    // result
    expect(segments).toHaveLength(2);
  });

  it('should return the same segments for the same inputs', () => {
    // mock
    const gl = createGl();
    const nodes = [createRect('a')];
    const nodesById = {};

    // before
    const first = getRectSegments(gl, nodes, nodesById);

    // result
    expect(getRectSegments(gl, nodes, nodesById)).toBe(first);
  });

  it('should reuse an unchanged chunk and rebuild a replaced one', () => {
    // mock
    const gl = createGl();
    const a = createRect('a');
    const b = createRect('b');
    const first = getRectSegments(gl, [a, b], {});
    const firstChunk = 'chunk' in first[0] ? first[0].chunk : null;

    // before
    const reused = getRectSegments(gl, [a, b], {});
    const replaced = getRectSegments(gl, [a, createRect('b')], {});

    // result
    expect('chunk' in reused[0] && reused[0].chunk).toBe(firstChunk);
    expect('chunk' in replaced[0] && replaced[0].chunk).not.toBe(firstChunk);
    expect(gl.deleteBuffer).not.toHaveBeenCalled();
  });

  it('should keep memoised chunks alive across a sweep by touching them', () => {
    // mock
    const gl = createGl();
    const nodes = [createRect('a')];
    const nodesById = {};
    const segments = getRectSegments(gl, nodes, nodesById);

    sweepRectChunks(gl);

    // before
    getRectSegments(gl, nodes, nodesById);
    sweepRectChunks(gl);

    // result
    expect(gl.deleteBuffer).not.toHaveBeenCalled();
    expect(segments).toHaveLength(1);
  });

  it('should return memoised segments that mix chunks and plain nodes unchanged', () => {
    // mock
    const gl = createGl();
    const nodes = [createRect('a'), createEllipse('e')];
    const nodesById = {};
    const first = getRectSegments(gl, nodes, nodesById);

    // before
    const second = getRectSegments(gl, nodes, nodesById);

    // result
    expect(second).toBe(first);
    expect(second).toHaveLength(2);
  });

  it('should fall back to individual nodes when a chunk buffer cannot be created', () => {
    // mock
    const a = createRect('a') as TRectangleNode;

    // before
    const segments = getRectSegments(createGl(false), [a], {});

    // result
    expect(segments).toEqual([{ node: a }]);
  });

  it('should rebuild memoised chunks that a sweep already deleted instead of returning dead buffers', () => {
    // mock
    const gl = createGl();
    const nodes = [createRect('a')];
    const nodesById = {};
    const first = getRectSegments(gl, nodes, nodesById);

    sweepRectChunks(gl);
    sweepRectChunks(gl);

    // before
    const second = getRectSegments(gl, nodes, nodesById);

    // result
    expect(gl.deleteBuffer).toHaveBeenCalledTimes(1);
    expect(second).not.toBe(first);
    expect('chunk' in second[0] && second[0].chunk).not.toBe('chunk' in first[0] && first[0].chunk);
  });
});
