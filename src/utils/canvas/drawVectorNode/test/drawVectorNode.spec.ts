// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorNode } from '../drawVectorNode';
import { getVectorFillColorForLoopKey } from '../../vectorNetwork/getVectorFillColorForLoopKey';

const getVectorFillLoopPointsMock = vi.fn();
const drawVectorFillMock = vi.fn();
const drawVectorThickStrokeVerticesMock = vi.fn();
const drawVectorVariableStrokeMock = vi.fn();
const getVectorNodeThickStrokeVerticesMock = vi.fn();
const getRenderedVectorNodeMock = vi.fn();

vi.mock('components/Design/Canvas/utils/getRenderedVectorNode', () => ({
  getRenderedVectorNode: (...args: unknown[]): unknown => getRenderedVectorNodeMock(...args),
}));
vi.mock('../../vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints', () => ({
  getVectorFillLoopPoints: (...args: unknown[]): unknown => getVectorFillLoopPointsMock(...args),
}));
vi.mock('../drawVectorFill', () => ({ drawVectorFill: (...args: unknown[]): void => drawVectorFillMock(...args) }));
vi.mock('../drawVectorThickStrokeVertices', () => ({
  drawVectorThickStrokeVertices: (...args: unknown[]): void => drawVectorThickStrokeVerticesMock(...args),
}));
vi.mock('../drawVectorVariableStroke', () => ({
  drawVectorVariableStroke: (...args: unknown[]): void => drawVectorVariableStrokeMock(...args),
}));
vi.mock('../../vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices', () => ({
  getVectorNodeThickStrokeVertices: (...args: unknown[]): unknown => getVectorNodeThickStrokeVerticesMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawVectorNode', () => {
  beforeEach(() => {
    getVectorFillLoopPointsMock.mockClear();
    drawVectorFillMock.mockClear();
    drawVectorThickStrokeVerticesMock.mockClear();
    drawVectorVariableStrokeMock.mockClear();
    getVectorNodeThickStrokeVerticesMock.mockClear();
    getRenderedVectorNodeMock.mockReset();
    getRenderedVectorNodeMock.mockImplementation((node: TVectorNode) => node);
  });

  it('should resolve each filled loop key to its current points then draw the fill followed by the stroke, using the node’s own colors and width', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = {} as WeakMap<{ x: number; y: number }[], WebGLBuffer>;
    const node: TVectorNode = {
      fillColor: '#ff0000',
      filledFaceKeys: ['s1,s2,s3'],
      id: '1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#00ff00',
      strokeWidth: 3,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {},
    };
    const loopPoints = [{ x: 0, y: 0 }];
    const strokeVertices = [0, 0, 1, 1];

    getVectorFillLoopPointsMock.mockReturnValue(loopPoints);
    getVectorNodeThickStrokeVerticesMock.mockReturnValue(strokeVertices);

    // before
    drawVectorNode(gl, program, buffer, faceBufferCache, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(getVectorFillLoopPointsMock).toHaveBeenCalledWith(node, 's1,s2,s3');
    expect(getVectorNodeThickStrokeVerticesMock).toHaveBeenCalledWith(node, 1.5);
    expect(drawVectorFillMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      faceBufferCache,
      [loopPoints],
      getVectorFillColorForLoopKey('s1,s2,s3'),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorThickStrokeVerticesMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      strokeVertices,
      '#00ff00',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw each filled loop through its own separate drawVectorFill call, not one call batching every loop together — batching would XOR independently-painted loops’ stencil bits together if they come to overlap in screen space', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = {} as WeakMap<{ x: number; y: number }[], WebGLBuffer>;
    const node: TVectorNode = {
      fillColor: '#ff0000',
      filledFaceKeys: ['s1,s2,s3', 's3,s4,s5'],
      id: '1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#00ff00',
      strokeWidth: 3,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {},
    };
    const loopAPoints = [{ x: 0, y: 0 }];
    const loopBPoints = [{ x: 1, y: 1 }];

    getVectorFillLoopPointsMock.mockImplementation((_node: TVectorNode, key: string) => (key === 's1,s2,s3' ? loopAPoints : loopBPoints));

    // before
    drawVectorNode(gl, program, buffer, faceBufferCache, node, 200, 150, IDENTITY_VIEWPORT);

    // result — each loop also gets its own color, derived from its own key, so two loops always differ
    const colorA = getVectorFillColorForLoopKey('s1,s2,s3');
    const colorB = getVectorFillColorForLoopKey('s3,s4,s5');

    expect(drawVectorFillMock).toHaveBeenCalledTimes(2);
    expect(colorB).not.toBe(colorA);
    expect(drawVectorFillMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      faceBufferCache,
      [loopAPoints],
      colorA,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorFillMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      faceBufferCache,
      [loopBPoints],
      colorB,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should skip drawing a fill when a filled loop key no longer resolves to any current points (its segments were deleted)', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = {} as WeakMap<{ x: number; y: number }[], WebGLBuffer>;
    const node: TVectorNode = {
      fillColor: '#ff0000',
      filledFaceKeys: ['stale-key'],
      id: '1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#00ff00',
      strokeWidth: 3,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {},
    };

    getVectorFillLoopPointsMock.mockReturnValue(null);

    // before
    drawVectorNode(gl, program, buffer, faceBufferCache, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(getVectorFillLoopPointsMock).toHaveBeenCalledWith(node, 'stale-key');
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(getVectorNodeThickStrokeVerticesMock).toHaveBeenCalledWith(node, 1.5);
  });

  it('should skip drawing a fill (and never resolve any loop) when the node has no filled faces', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = {} as WeakMap<{ x: number; y: number }[], WebGLBuffer>;
    const node: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: '1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#00ff00',
      strokeWidth: 3,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {},
    };

    // before
    drawVectorNode(gl, program, buffer, faceBufferCache, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(getVectorFillLoopPointsMock).not.toHaveBeenCalled();
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(getVectorNodeThickStrokeVerticesMock).toHaveBeenCalledWith(node, 1.5);
  });

  it('should draw the variable-width ribbon instead of the uniform stroke when the node carries a width profile', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = {} as WeakMap<{ x: number; y: number }[], WebGLBuffer>;
    const node: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: '1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#00ff00',
      strokeWidth: 3,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {},
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 10, position: 0.5, rightOffset: 10 } } },
    };

    // before
    drawVectorNode(gl, program, buffer, faceBufferCache, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorVariableStrokeMock).toHaveBeenCalledWith(gl, program, buffer, node, '#00ff00', 200, 150, IDENTITY_VIEWPORT);
    expect(getVectorNodeThickStrokeVerticesMock).not.toHaveBeenCalled();
  });

  it('should pass the node through getRenderedVectorNode and draw whatever it returns, so a rotated node’s baked/cached rendering is what actually gets tessellated', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = {} as WeakMap<{ x: number; y: number }[], WebGLBuffer>;
    const node: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: '1',
      name: 'Vector',
      parentId: null,
      rotation: 45,
      segments: {},
      strokeColor: '#00ff00',
      strokeWidth: 3,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {},
    };
    const renderedNode: TVectorNode = { ...node, rotation: 0 };

    getRenderedVectorNodeMock.mockReturnValue(renderedNode);

    // before
    drawVectorNode(gl, program, buffer, faceBufferCache, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(getRenderedVectorNodeMock).toHaveBeenCalledWith(node);
    expect(getVectorNodeThickStrokeVerticesMock).toHaveBeenCalledWith(renderedNode, 1.5);
  });
});
