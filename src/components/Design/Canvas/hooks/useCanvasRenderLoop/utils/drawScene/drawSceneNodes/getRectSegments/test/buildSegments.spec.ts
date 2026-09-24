// types
import { TSceneNode } from 'types/design/types';

// others
import { RECT_CHUNK_MAX_RECTS } from 'utils/canvas/drawRectBatch/constants';

// utils
import { buildSegments } from '../buildSegments';

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

const createGl = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 1,
    STATIC_DRAW: 2,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => ({})),
  }) as unknown as WebGL2RenderingContext;

const kinds = (segments: ReturnType<typeof buildSegments>): string[] => segments.map((segment) => ('chunk' in segment ? 'chunk' : 'node'));

describe('buildSegments', () => {
  it('should group consecutive batchable shapes of one parent into a chunk', () => {
    // before
    const segments = buildSegments(createGl(), [createRect('a'), createRect('b')], {});

    // result
    expect(kinds(segments)).toEqual(['chunk']);
  });

  it('should start a new chunk when the parent changes', () => {
    // before
    const segments = buildSegments(createGl(), [createRect('a', 'p'), createRect('b', 'p'), createRect('c', 'q')], {});

    // result
    expect(kinds(segments)).toEqual(['chunk', 'chunk']);
  });

  it('should start a new chunk after the chunk size limit', () => {
    // mock
    const nodes = Array.from({ length: RECT_CHUNK_MAX_RECTS + 1 }, (_, index) => createRect(`r${index}`));

    // before
    const segments = buildSegments(createGl(), nodes, {});

    // result
    expect(kinds(segments)).toEqual(['chunk', 'chunk']);
  });

  it('should keep the draw order around a node that cannot be batched', () => {
    // mock
    const ellipse = { id: 'e', type: 'ellipse' } as unknown as TSceneNode;

    // before
    const segments = buildSegments(createGl(), [createRect('a'), ellipse, createRect('b')], {});

    // result
    expect(kinds(segments)).toEqual(['chunk', 'node', 'chunk']);
    expect(segments[1]).toEqual({ node: ellipse });
  });

  it('should return no segments for an empty scene', () => {
    // result
    expect(buildSegments(createGl(), [], {})).toEqual([]);
  });
});
