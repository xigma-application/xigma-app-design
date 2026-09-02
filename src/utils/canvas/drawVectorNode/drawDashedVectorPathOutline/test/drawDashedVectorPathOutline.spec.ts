// others
import { DASH_GAP_PX, DASH_LENGTH_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { drawDashedVectorPathOutline } from '../drawDashedVectorPathOutline';
import { getVectorChainArcLengthTable } from '../../../vectorNetwork/getVectorChainArcLengthTable';
import { getVectorChainOrder } from '../../../vectorNetwork/getVectorChainOrder/getVectorChainOrder';
import { hexToRgbaFloat } from '../../../hexToRgbaFloat';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINES: 1,
    STATIC_DRAW: 35044,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: seg('s1', 'a', 'b') },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 200, y: 0 } },
  ...overrides,
});

const expectedDashCount = (node: TVectorNode, zoom: number): number => {
  const chainOrder = getVectorChainOrder(node)!;
  const table = getVectorChainArcLengthTable(node, chainOrder);
  const totalLength = table[table.length - 1].length;
  const patternLength = (DASH_LENGTH_PX + DASH_GAP_PX) / zoom;

  return Math.max(1, Math.round(totalLength / patternLength));
};

describe('drawDashedVectorPathOutline', () => {
  it('should draw the outline as disconnected line segments matching the expected dash count', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node = buildNode();

    // before
    drawDashedVectorPathOutline(gl, program, buffer, node, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result — one 2-point segment per dash
    const expectedDashes = expectedDashCount(node, IDENTITY_VIEWPORT.zoom);

    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expectedDashes * 2);
  });

  it('should color the dashes with the given stroke color', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedVectorPathOutline(gl, program, buffer, buildNode(), '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat('#0d99ff'));
  });

  it('should double the dash count when zoomed in 2x, keeping each dash a constant size on screen', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node = buildNode();

    // before
    drawDashedVectorPathOutline(gl, program, buffer, node, '#0d99ff', 100, 100, { x: 0, y: 0, zoom: 2 });

    // result
    const expectedDashes = expectedDashCount(node, 2);

    expect(expectedDashes).toBeGreaterThan(expectedDashCount(node, 1));
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expectedDashes * 2);
  });

  it('should leave gaps between dashes instead of tracing a continuous line', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — the first dash starts at the chain's own start point (0,0)
    drawDashedVectorPathOutline(gl, program, buffer, buildNode(), '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[0]).toBeCloseTo(0);
    expect(vertices[1]).toBeCloseTo(0);

    // the dash's own end point (index 2/3) must stop short of the next dash's start (index 4/5)
    const dashEnd = { x: vertices[2], y: vertices[3] };
    const nextDashStart = { x: vertices[4], y: vertices[5] };

    expect(dashEnd).not.toEqual(nextDashStart);
  });

  it('should draw against the rotated (baked) geometry, not the raw unrotated segments', () => {
    // mock — a 200-unit horizontal segment rotated 90deg around its own bounds center (100, 0)
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node = buildNode({ rotation: 90 });

    // before
    drawDashedVectorPathOutline(gl, program, buffer, node, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result — the chain start a=(0,0) rotates 90deg around (100,0) to (100,-100)
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[0]).toBeCloseTo(100);
    expect(vertices[1]).toBeCloseTo(-100);
  });

  it('should draw nothing for a branching (ineligible) vector network', () => {
    // mock — hub is a 3-way branch
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'hub'), s2: seg('s2', 'hub', 'b'), s3: seg('s3', 'hub', 'c') },
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 100, y: 0 },
        c: { id: 'c', x: 50, y: 100 },
        hub: { id: 'hub', x: 50, y: 0 },
      },
    });

    // before
    drawDashedVectorPathOutline(gl, program, buffer, node, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing for a zero-length (coincident-point) chain', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node = buildNode({ segments: { s1: seg('s1', 'a', 'a') }, vertices: { a: { id: 'a', x: 5, y: 5 } } });

    // before
    drawDashedVectorPathOutline(gl, program, buffer, node, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
