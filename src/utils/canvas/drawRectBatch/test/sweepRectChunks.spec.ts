// types
import { TRectangleNode } from 'types/design/types';

// utils
import { acquireRectChunk } from '../acquireRectChunk';
import { getRectChunkCache } from '../getRectChunkCache';
import { sweepRectChunks } from '../sweepRectChunks';
import { touchRectChunk } from '../touchRectChunk';

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

const createGl = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 1,
    STATIC_DRAW: 2,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    deleteBuffer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('sweepRectChunks', () => {
  it('should keep chunks touched since the last sweep and clear the touched set', () => {
    // mock
    const gl = createGl();
    const chunk = acquireRectChunk(gl, [createNode('a')], 1, () => 1);

    // before
    sweepRectChunks(gl);

    // result
    expect(gl.deleteBuffer).not.toHaveBeenCalled();
    expect(getRectChunkCache(gl).all.has(chunk!)).toBe(true);
    expect(getRectChunkCache(gl).touched.size).toBe(0);
  });

  it('should delete the buffer of a chunk nobody touched', () => {
    // mock
    const gl = createGl();
    const run = [createNode('a')];
    const chunk = acquireRectChunk(gl, run, 1, () => 1);

    sweepRectChunks(gl);

    // before
    sweepRectChunks(gl);

    // result
    expect(gl.deleteBuffer).toHaveBeenCalledWith(chunk?.buffer);
    expect(getRectChunkCache(gl).all.size).toBe(0);
    expect(getRectChunkCache(gl).chunks.has(run[0])).toBe(false);
  });

  it('should keep the newest chunk registered for a first node when only the stale one is swept', () => {
    // mock
    const gl = createGl();
    const run = [createNode('a')];
    const stale = acquireRectChunk(gl, run, 1, () => 1);

    sweepRectChunks(gl);

    const fresh = acquireRectChunk(gl, run, 0.5, () => 1);

    // before
    sweepRectChunks(gl);

    // result
    expect(gl.deleteBuffer).toHaveBeenCalledWith(stale?.buffer);
    expect(getRectChunkCache(gl).chunks.get(run[0])).toBe(fresh);
  });

  it('should spare a chunk that was only touched, not re-acquired', () => {
    // mock
    const gl = createGl();
    const chunk = acquireRectChunk(gl, [createNode('a')], 1, () => 1);

    sweepRectChunks(gl);
    touchRectChunk(gl, chunk!);

    // before
    sweepRectChunks(gl);

    // result
    expect(gl.deleteBuffer).not.toHaveBeenCalled();
  });
});
