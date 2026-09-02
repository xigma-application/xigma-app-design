// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { classifyVertexDots } from '../classifyVertexDots';
import { collectVertexDotBuckets } from '../collectVertexDotBuckets';

const drawImmediateVertexDotsMock = vi.fn();

vi.mock('../drawImmediateVertexDots', () => ({
  drawImmediateVertexDots: (...args: unknown[]): void => drawImmediateVertexDotsMock(...args),
}));
vi.mock('../classifyVertexDots', async () => {
  const actual = await vi.importActual<typeof import('../classifyVertexDots')>('../classifyVertexDots');

  return { classifyVertexDots: vi.fn(actual.classifyVertexDots) };
});

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const buildNode = (idSuffix: string): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: `vector-${idSuffix}`,
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
});

describe('collectVertexDotBuckets', () => {
  beforeEach(() => {
    drawImmediateVertexDotsMock.mockClear();
    vi.mocked(classifyVertexDots).mockClear();
  });

  it('should compute and return the classification on a first call', () => {
    const node = buildNode('a');

    const result = collectVertexDotBuckets(gl, program, buffer, node, new Set(), new Set(), null, false, 6, 200, 150, IDENTITY_VIEWPORT);

    expect(result.plainVertexCenters).toHaveLength(2);
    expect(classifyVertexDots).toHaveBeenCalledTimes(1);
  });

  it('should reuse the cached classification on a second call with the same node and unchanged selection/new/hover state', () => {
    const node = buildNode('b');

    const first = collectVertexDotBuckets(
      gl,
      program,
      buffer,
      node,
      new Set(['v1']),
      new Set(),
      null,
      false,
      6,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    const second = collectVertexDotBuckets(
      gl,
      program,
      buffer,
      node,
      new Set(['v1']),
      new Set(),
      null,
      false,
      6,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    expect(second).toBe(first);
    expect(classifyVertexDots).toHaveBeenCalledTimes(1);
  });

  it('should not depend on baseSize/canvas size/viewport — a pan/zoom-only frame still hits the cache', () => {
    const node = buildNode('c');

    collectVertexDotBuckets(gl, program, buffer, node, new Set(['v1']), new Set(), null, false, 6, 200, 150, IDENTITY_VIEWPORT);
    collectVertexDotBuckets(gl, program, buffer, node, new Set(['v1']), new Set(), null, false, 12, 400, 300, { x: 50, y: 50, zoom: 2 });

    expect(classifyVertexDots).toHaveBeenCalledTimes(1);
  });

  it('should recompute when the selection changes', () => {
    const node = buildNode('d');

    collectVertexDotBuckets(gl, program, buffer, node, new Set(['v1']), new Set(), null, false, 6, 200, 150, IDENTITY_VIEWPORT);
    collectVertexDotBuckets(gl, program, buffer, node, new Set(['v2']), new Set(), null, false, 6, 200, 150, IDENTITY_VIEWPORT);

    expect(classifyVertexDots).toHaveBeenCalledTimes(2);
  });

  it('should keep independent caches per node, even with identical selection/new/hover state', () => {
    const nodeA = buildNode('e');
    const nodeB = buildNode('f');

    collectVertexDotBuckets(gl, program, buffer, nodeA, new Set(), new Set(), null, false, 6, 200, 150, IDENTITY_VIEWPORT);
    collectVertexDotBuckets(gl, program, buffer, nodeB, new Set(), new Set(), null, false, 6, 200, 150, IDENTITY_VIEWPORT);

    expect(classifyVertexDots).toHaveBeenCalledTimes(2);
  });

  it('should always call drawImmediateVertexDots, even on a classification cache hit', () => {
    const node = buildNode('g');

    collectVertexDotBuckets(gl, program, buffer, node, new Set(), new Set(), null, false, 6, 200, 150, IDENTITY_VIEWPORT);
    collectVertexDotBuckets(gl, program, buffer, node, new Set(), new Set(), null, false, 6, 200, 150, IDENTITY_VIEWPORT);

    expect(drawImmediateVertexDotsMock).toHaveBeenCalledTimes(2);
  });
});
