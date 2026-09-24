// types
import { TRectChunk } from 'utils/canvas/drawRectBatch/types';
import { TRectSegment } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getRectChunkCache } from 'utils/canvas/drawRectBatch/getRectChunkCache';
import { touchSegments } from '../touchSegments';

const createChunk = (): TRectChunk => ({}) as unknown as TRectChunk;

describe('touchSegments', () => {
  it('should mark every chunk as used and report true when all of them are still alive', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const first = createChunk();
    const second = createChunk();
    const cache = getRectChunkCache(gl);

    cache.all.add(first);
    cache.all.add(second);

    // before
    const result = touchSegments(gl, [{ chunk: first }, { node: { id: 'n' } as TSceneNode }, { chunk: second }]);

    // result
    expect(result).toBe(true);
    expect(cache.touched.has(first)).toBe(true);
    expect(cache.touched.has(second)).toBe(true);
  });

  it('should report false and touch nothing when a chunk was already deleted', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const alive = createChunk();
    const dead = createChunk();
    const cache = getRectChunkCache(gl);

    cache.all.add(alive);

    // before
    const result = touchSegments(gl, [{ chunk: alive }, { chunk: dead }] as TRectSegment[]);

    // result
    expect(result).toBe(false);
    expect(cache.touched.size).toBe(0);
  });

  it('should accept segments without any chunk', () => {
    // result
    expect(touchSegments({} as WebGL2RenderingContext, [{ node: { id: 'n' } as TSceneNode }])).toBe(true);
  });
});
