// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorNode } from '../drawVectorNode';
import { getVectorFillColorForLoopKey } from '../../vectorNetwork/getVectorFillColorForLoopKey';

const getVectorFillLoopPointsMock = vi.fn();
const drawVectorFillMock = vi.fn();
const drawVectorStrokeMock = vi.fn();
const drawVectorVariableStrokeMock = vi.fn();
const flattenVectorSegmentsMock = vi.fn();
const bakeVectorNodeRotationMock = vi.fn();

vi.mock('components/Design/Canvas/utils/bakeVectorNodeRotation', () => ({
  bakeVectorNodeRotation: (...args: unknown[]): unknown => bakeVectorNodeRotationMock(...args),
}));
vi.mock('../../vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints', () => ({
  getVectorFillLoopPoints: (...args: unknown[]): unknown => getVectorFillLoopPointsMock(...args),
}));
vi.mock('../drawVectorFill', () => ({ drawVectorFill: (...args: unknown[]): void => drawVectorFillMock(...args) }));
vi.mock('../drawVectorStroke', () => ({ drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args) }));
vi.mock('../drawVectorVariableStroke', () => ({
  drawVectorVariableStroke: (...args: unknown[]): void => drawVectorVariableStrokeMock(...args),
}));
vi.mock('../../vectorNetwork/flattenVectorSegments', () => ({
  flattenVectorSegments: (...args: unknown[]): unknown => flattenVectorSegmentsMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawVectorNode', () => {
  beforeEach(() => {
    getVectorFillLoopPointsMock.mockClear();
    drawVectorFillMock.mockClear();
    drawVectorStrokeMock.mockClear();
    drawVectorVariableStrokeMock.mockClear();
    flattenVectorSegmentsMock.mockClear();
    bakeVectorNodeRotationMock.mockClear();
  });

  it('should resolve each filled loop key to its current points then draw the fill followed by the stroke, using the node’s own colors and width', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
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
    const flattened = [{ points: [{ x: 0, y: 0 }], segmentId: 's1' }];

    getVectorFillLoopPointsMock.mockReturnValue(loopPoints);
    flattenVectorSegmentsMock.mockReturnValue(flattened);

    // before
    drawVectorNode(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(getVectorFillLoopPointsMock).toHaveBeenCalledWith(node, 's1,s2,s3');
    expect(flattenVectorSegmentsMock).toHaveBeenCalledWith(node);
    expect(drawVectorFillMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      [loopPoints],
      getVectorFillColorForLoopKey('s1,s2,s3'),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorStrokeMock).toHaveBeenCalledWith(gl, program, buffer, flattened, '#00ff00', 3, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw each filled loop through its own separate drawVectorFill call, not one call batching every loop together — batching would XOR independently-painted loops’ stencil bits together if they come to overlap in screen space', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
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
    const flattened = [{ points: [{ x: 0, y: 0 }], segmentId: 's1' }];

    getVectorFillLoopPointsMock.mockImplementation((_node: TVectorNode, key: string) => (key === 's1,s2,s3' ? loopAPoints : loopBPoints));
    flattenVectorSegmentsMock.mockReturnValue(flattened);

    // before
    drawVectorNode(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);

    // result — each loop also gets its own color, derived from its own key, so two loops always differ
    const colorA = getVectorFillColorForLoopKey('s1,s2,s3');
    const colorB = getVectorFillColorForLoopKey('s3,s4,s5');

    expect(drawVectorFillMock).toHaveBeenCalledTimes(2);
    expect(colorB).not.toBe(colorA);
    expect(drawVectorFillMock).toHaveBeenNthCalledWith(1, gl, program, buffer, [loopAPoints], colorA, 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorFillMock).toHaveBeenNthCalledWith(2, gl, program, buffer, [loopBPoints], colorB, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should skip drawing a fill when a filled loop key no longer resolves to any current points (its segments were deleted)', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
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
    const flattened = [{ points: [{ x: 0, y: 0 }], segmentId: 's1' }];

    getVectorFillLoopPointsMock.mockReturnValue(null);
    flattenVectorSegmentsMock.mockReturnValue(flattened);

    // before
    drawVectorNode(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(getVectorFillLoopPointsMock).toHaveBeenCalledWith(node, 'stale-key');
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(drawVectorStrokeMock).toHaveBeenCalledWith(gl, program, buffer, flattened, '#00ff00', 3, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should skip drawing a fill (and never resolve any loop) when the node has no filled faces', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
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
    const flattened = [{ points: [{ x: 0, y: 0 }], segmentId: 's1' }];

    flattenVectorSegmentsMock.mockReturnValue(flattened);

    // before
    drawVectorNode(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(getVectorFillLoopPointsMock).not.toHaveBeenCalled();
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(drawVectorStrokeMock).toHaveBeenCalledWith(gl, program, buffer, flattened, '#00ff00', 3, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw the variable-width ribbon instead of the uniform stroke when the node carries a width profile', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
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
    drawVectorNode(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorVariableStrokeMock).toHaveBeenCalledWith(gl, program, buffer, node, '#00ff00', 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });

  it('should pass the node’s own object reference straight through when it isn’t rotated, so the per-node WeakMap render caches keyed on that reference hit across frames instead of recomputing every draw', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
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
    const flattened = [{ points: [{ x: 0, y: 0 }], segmentId: 's1' }];

    flattenVectorSegmentsMock.mockReturnValue(flattened);

    // before
    drawVectorNode(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(bakeVectorNodeRotationMock).not.toHaveBeenCalled();
    expect(flattenVectorSegmentsMock.mock.calls[0][0]).toBe(node);
  });

  it('should bake the node’s rotation into a new segments/vertices set before drawing when the node is rotated', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
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
    const bakedSegments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const bakedVertices = { a: { id: 'a', x: 1, y: 2 } };
    const flattened = [{ points: [{ x: 0, y: 0 }], segmentId: 's1' }];

    bakeVectorNodeRotationMock.mockReturnValue({ rotation: 0, segments: bakedSegments, vertices: bakedVertices });
    flattenVectorSegmentsMock.mockReturnValue(flattened);

    // before
    drawVectorNode(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(bakeVectorNodeRotationMock).toHaveBeenCalledWith(node);
    expect(flattenVectorSegmentsMock).toHaveBeenCalledWith({ ...node, rotation: 0, segments: bakedSegments, vertices: bakedVertices });
  });
});
