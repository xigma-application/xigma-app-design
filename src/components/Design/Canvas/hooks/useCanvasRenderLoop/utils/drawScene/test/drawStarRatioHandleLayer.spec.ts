// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TPolygonNode, TStarNode } from 'types/design/types';

// utils
import { drawStarRatioHandleLayer } from '../drawStarRatioHandleLayer';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLE_FAN: 6,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => ({})),
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

const polygon: TPolygonNode = {
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'polygon-1',
  name: 'Polygon',
  parentId: null,
  rotation: 0,
  sides: 3,
  type: NodeType.polygon,
  width: 100,
  x: 0,
  y: 0,
};

const star: TStarNode = {
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'star-1',
  name: 'Star',
  parentId: null,
  points: 5,
  ratio: 0.382,
  rotation: 0,
  type: NodeType.star,
  width: 100,
  x: 0,
  y: 0,
};

const ellipse: TEllipseNode = {
  fill: '#ff0000',
  height: 100,
  id: 'ellipse-1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 100,
  x: 0,
  y: 0,
};

describe('drawStarRatioHandleLayer', () => {
  it('should draw nothing when nothing is selected', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStarRatioHandleLayer(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      null,
      [],
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the selected node is not hovered', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStarRatioHandleLayer(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      null,
      [star],
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hovered node is a different node than the selected one', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStarRatioHandleLayer(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      ellipse,
      [star],
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing for a multi-node selection even when hovered', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStarRatioHandleLayer(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      star,
      [star, { ...star, id: 'star-2' }],
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the selected+hovered node is not a star', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStarRatioHandleLayer(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      polygon,
      [polygon],
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing once the shape renders too small on screen', () => {
    // mock — a 100x100 shape at 90% zoom renders at 90 screen px, below the 100px threshold
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStarRatioHandleLayer(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: { x: 0, y: 0, zoom: 0.9 } },
      star,
      [star],
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw the single ratio handle when a star is both selected and hovered', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStarRatioHandleLayer(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      star,
      [star],
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });
});
