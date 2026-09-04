// store
import { selectAreFrameOutlinesVisible } from 'store/design/selectors';
import { store } from 'store';
import { toggleFrameOutlinesVisible } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { drawFrameOutlines } from '../drawFrameOutlines';

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

const buildFrame = (id: string): TSceneNode => ({
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
  height: 20,
  id,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
});

const buildRectangle = (id: string): TSceneNode => ({
  fill: '#00ff00',
  height: 20,
  id,
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

describe('drawFrameOutlines', () => {
  beforeEach(() => {
    if (!selectAreFrameOutlinesVisible(store.getState())) {
      store.dispatch(toggleFrameOutlinesVisible());
    }
  });

  it('should draw nothing when the preference is off', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    store.dispatch(toggleFrameOutlinesVisible());

    // before
    drawFrameOutlines(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      [buildFrame('a')],
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when there are no frame nodes', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawFrameOutlines(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      [buildRectangle('a')],
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a thick rectangular outline for a frame node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawFrameOutlines(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      [buildFrame('a')],
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 24);
  });

  it('should draw one outline per frame, skipping every other node type in the same list', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawFrameOutlines(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      [buildFrame('a'), buildRectangle('b'), buildFrame('c')],
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });
});
