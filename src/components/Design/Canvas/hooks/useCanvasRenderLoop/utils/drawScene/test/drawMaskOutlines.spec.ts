// store
import { selectAreMaskOutlinesVisible } from 'store/design/selectors';
import { store } from 'store';
import { toggleMaskOutlinesVisible } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawMaskOutlines } from '../drawMaskOutlines';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
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
const CONTEXT = (gl: WebGL2RenderingContext, program: WebGLProgram, buffer: WebGLBuffer) => ({
  buffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl,
  imageContext: {} as never,
  program,
  viewport: IDENTITY_VIEWPORT,
});

const buildFrame = (id: string, isMask: boolean): TSceneNode => ({
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
  height: 20,
  id,
  isMask,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
});

describe('drawMaskOutlines', () => {
  beforeEach(() => {
    if (!selectAreMaskOutlinesVisible(store.getState())) {
      store.dispatch(toggleMaskOutlinesVisible());
    }
  });

  it('should draw nothing when the preference is off', () => {
    // mock
    const gl = createGlMock();

    store.dispatch(toggleMaskOutlinesVisible());

    // before
    drawMaskOutlines(CONTEXT(gl, {} as WebGLProgram, {} as WebGLBuffer), [buildFrame('a', true)]);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when no node in the list is a mask', () => {
    // mock
    const gl = createGlMock();

    // before
    drawMaskOutlines(CONTEXT(gl, {} as WebGLProgram, {} as WebGLBuffer), [buildFrame('a', false)]);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a thick rectangular outline for a masked box node (default case)', () => {
    // mock
    const gl = createGlMock();

    // before
    drawMaskOutlines(CONTEXT(gl, {} as WebGLProgram, {} as WebGLBuffer), [buildFrame('a', true)]);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 24);
  });

  it('should draw only the masked node, skipping every unmasked node in the same list', () => {
    // mock
    const gl = createGlMock();

    // before
    drawMaskOutlines(CONTEXT(gl, {} as WebGLProgram, {} as WebGLBuffer), [
      buildFrame('a', false),
      buildFrame('b', true),
      buildFrame('c', false),
    ]);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
  });

  it('should draw an elliptical thick outline for a masked ellipse node', () => {
    // mock
    const gl = createGlMock();
    const node: TSceneNode = {
      fill: '#ff0000',
      height: 20,
      id: 'a',
      isMask: true,
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    drawMaskOutlines(CONTEXT(gl, {} as WebGLProgram, {} as WebGLBuffer), [node]);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.TRIANGLES, 0, 24);
  });

  it('should draw a polygonal thick outline for a masked polygon node', () => {
    // mock
    const gl = createGlMock();
    const node: TSceneNode = {
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: 20,
      id: 'a',
      isMask: true,
      name: 'Polygon',
      parentId: null,
      rotation: 0,
      sides: 6,
      type: NodeType.polygon,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    drawMaskOutlines(CONTEXT(gl, {} as WebGLProgram, {} as WebGLBuffer), [node]);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6 * 6);
  });

  it('should draw a star-shaped thick outline for a masked star node', () => {
    // mock
    const gl = createGlMock();
    const node: TSceneNode = {
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: 20,
      id: 'a',
      isMask: true,
      name: 'Star',
      parentId: null,
      points: 5,
      ratio: 0.382,
      rotation: 0,
      type: NodeType.star,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    drawMaskOutlines(CONTEXT(gl, {} as WebGLProgram, {} as WebGLBuffer), [node]);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 10 * 6);
  });

  it('should draw a thin highlight along the segment for a masked line node, not a bounding-box ring', () => {
    // mock
    const gl = createGlMock();
    const node: TSceneNode = {
      id: 'a',
      isMask: true,
      name: 'Line',
      parentId: null,
      stroke: '#000000',
      type: NodeType.line,
      x1: 0,
      x2: 10,
      y1: 0,
      y2: 10,
    };

    // before
    drawMaskOutlines(CONTEXT(gl, {} as WebGLProgram, {} as WebGLBuffer), [node]);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should draw a vector stroke along the flattened segments for a masked vector node', () => {
    // mock
    const gl = createGlMock();
    const node: TVectorNode = {
      defaultFill: null,
      filledFaceKeys: [],
      id: 'a',
      isMask: true,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 2,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 10 } },
    };

    // before
    drawMaskOutlines(CONTEXT(gl, {} as WebGLProgram, {} as WebGLBuffer), [node]);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, expect.any(Number));
  });
});
