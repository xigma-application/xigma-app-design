// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawImmediateVertexDots } from '../drawImmediateVertexDots';

const drawSelectedVertexDotMock = vi.fn();
const drawNewVertexDotMock = vi.fn();
const drawHoveredVertexDotMock = vi.fn();

vi.mock('../drawSelectedVertexDot/drawSelectedVertexDot', () => ({
  drawSelectedVertexDot: (...args: unknown[]): void => drawSelectedVertexDotMock(...args),
}));
vi.mock('../drawNewVertexDot', () => ({ drawNewVertexDot: (...args: unknown[]): void => drawNewVertexDotMock(...args) }));
vi.mock('../drawHoveredVertexDot', () => ({ drawHoveredVertexDot: (...args: unknown[]): void => drawHoveredVertexDotMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const buildNode = (): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
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

describe('drawImmediateVertexDots', () => {
  beforeEach(() => {
    drawSelectedVertexDotMock.mockClear();
    drawNewVertexDotMock.mockClear();
    drawHoveredVertexDotMock.mockClear();
  });

  it('should draw nothing when there is no new or hovered vertex', () => {
    drawImmediateVertexDots(gl, program, buffer, buildNode(), new Set(), new Set(), null, false, 6, 200, 150, IDENTITY_VIEWPORT);

    expect(drawSelectedVertexDotMock).not.toHaveBeenCalled();
    expect(drawNewVertexDotMock).not.toHaveBeenCalled();
    expect(drawHoveredVertexDotMock).not.toHaveBeenCalled();
  });

  it('should draw a new, unselected vertex via drawNewVertexDot', () => {
    const node = buildNode();

    drawImmediateVertexDots(gl, program, buffer, node, new Set(), new Set(['v1']), null, false, 6, 200, 150, IDENTITY_VIEWPORT);

    expect(drawNewVertexDotMock).toHaveBeenCalledWith(gl, program, buffer, node.vertices.v1, false, 6, 200, 150, IDENTITY_VIEWPORT);
    expect(drawSelectedVertexDotMock).not.toHaveBeenCalled();
    expect(drawHoveredVertexDotMock).not.toHaveBeenCalled();
  });

  it('should draw a new, selected vertex via drawSelectedVertexDot instead', () => {
    const node = buildNode();

    drawImmediateVertexDots(gl, program, buffer, node, new Set(['v1']), new Set(['v1']), null, false, 6, 200, 150, IDENTITY_VIEWPORT);

    expect(drawSelectedVertexDotMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      node.vertices.v1,
      true,
      false,
      6,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawNewVertexDotMock).not.toHaveBeenCalled();
  });

  it('should draw an unselected hovered vertex via drawHoveredVertexDot', () => {
    const node = buildNode();

    drawImmediateVertexDots(gl, program, buffer, node, new Set(), new Set(), 'v1', false, 6, 200, 150, IDENTITY_VIEWPORT);

    expect(drawHoveredVertexDotMock).toHaveBeenCalledWith(gl, program, buffer, node.vertices.v1, 6, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should pass isMeasuring through to drawSelectedVertexDot while a distance measurement is in progress', () => {
    const node = buildNode();

    drawImmediateVertexDots(gl, program, buffer, node, new Set(['v1']), new Set(['v1']), null, true, 6, 200, 150, IDENTITY_VIEWPORT);

    expect(drawSelectedVertexDotMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      node.vertices.v1,
      true,
      true,
      6,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should never recolor drawHoveredVertexDot for measuring — it always renders plain white, unlike the selected anchor', () => {
    const node = buildNode();

    drawImmediateVertexDots(gl, program, buffer, node, new Set(), new Set(), 'v1', true, 6, 200, 150, IDENTITY_VIEWPORT);

    expect(drawHoveredVertexDotMock).toHaveBeenCalledWith(gl, program, buffer, node.vertices.v1, 6, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should never immediately draw a hovered vertex that is also selected — it stays in the selected batch instead', () => {
    const node = buildNode();

    drawImmediateVertexDots(gl, program, buffer, node, new Set(['v1']), new Set(), 'v1', false, 6, 200, 150, IDENTITY_VIEWPORT);

    expect(drawHoveredVertexDotMock).not.toHaveBeenCalled();
    expect(drawSelectedVertexDotMock).not.toHaveBeenCalled();
    expect(drawNewVertexDotMock).not.toHaveBeenCalled();
  });

  it('should pass isHovered through to drawNewVertexDot when a new vertex is also hovered', () => {
    const node = buildNode();

    drawImmediateVertexDots(gl, program, buffer, node, new Set(), new Set(['v1']), 'v1', false, 6, 200, 150, IDENTITY_VIEWPORT);

    expect(drawNewVertexDotMock).toHaveBeenCalledWith(gl, program, buffer, node.vertices.v1, true, 6, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should skip a candidate id that no longer exists on the node', () => {
    const node = buildNode();

    drawImmediateVertexDots(gl, program, buffer, node, new Set(), new Set(['ghost']), null, false, 6, 200, 150, IDENTITY_VIEWPORT);

    expect(drawNewVertexDotMock).not.toHaveBeenCalled();
  });
});
