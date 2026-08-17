// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TPolygonNode, TRectangleNode } from 'types/design/types';

// utils
import { drawCornerRadiusHandlesLayer } from '../drawCornerRadiusHandlesLayer';

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

const rectangle: TRectangleNode = {
  cornerRadius: 15,
  fill: '#ff0000',
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

const polygon: TPolygonNode = {
  cornerRadius: 15,
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

describe('drawCornerRadiusHandlesLayer', () => {
  it('should draw nothing when nothing is selected', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandlesLayer(gl, program, buffer, null, [], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the selected node is not hovered', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandlesLayer(gl, program, buffer, null, [rectangle], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hovered node is a different node than the selected one', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandlesLayer(gl, program, buffer, ellipse, [rectangle], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing for a multi-node selection even when hovered', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandlesLayer(gl, program, buffer, rectangle, [rectangle, { ...rectangle, id: 'rect-2' }], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the selected+hovered node does not support corner radius', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandlesLayer(gl, program, buffer, ellipse, [ellipse], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw the 4 corner handles when a rectangle is both selected and hovered', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandlesLayer(gl, program, buffer, rectangle, [rectangle], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(8);
  });

  it('should draw nothing once the shape renders too small on screen, regardless of cornerRadius', () => {
    // mock — a 100x100 shape at 90% zoom renders at 90 screen px, below the 100px threshold
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandlesLayer(gl, program, buffer, rectangle, [rectangle], 100, 100, { x: 0, y: 0, zoom: 0.9 });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should default a rectangle with no cornerRadius field at all to 0', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const freshRectangle = { ...rectangle, cornerRadius: undefined };

    // before
    drawCornerRadiusHandlesLayer(gl, program, buffer, freshRectangle, [freshRectangle], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(8);
  });

  it('should draw the single corner-radius handle when a polygon is both selected and hovered', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandlesLayer(gl, program, buffer, polygon, [polygon], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it('should draw nothing for a polygon once the shape renders too small on screen', () => {
    // mock — a 100x100 shape at 90% zoom renders at 90 screen px, below the 100px threshold
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCornerRadiusHandlesLayer(gl, program, buffer, polygon, [polygon], 100, 100, { x: 0, y: 0, zoom: 0.9 });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should default a polygon with no cornerRadius field at all to 0', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const freshPolygon = { ...polygon, cornerRadius: undefined };

    // before
    drawCornerRadiusHandlesLayer(gl, program, buffer, freshPolygon, [freshPolygon], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });
});
