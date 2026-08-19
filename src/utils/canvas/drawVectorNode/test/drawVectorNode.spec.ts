// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorNode } from '../drawVectorNode';

const deriveVectorFacesMock = vi.fn();
const drawVectorFillMock = vi.fn();
const drawVectorStrokeMock = vi.fn();
const flattenVectorSegmentsMock = vi.fn();

vi.mock('../../vectorNetwork/deriveVectorFaces', () => ({
  deriveVectorFaces: (...args: unknown[]): unknown => deriveVectorFacesMock(...args),
}));
vi.mock('../drawVectorFill', () => ({ drawVectorFill: (...args: unknown[]): void => drawVectorFillMock(...args) }));
vi.mock('../drawVectorStroke', () => ({ drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args) }));
vi.mock('../../vectorNetwork/flattenVectorSegments', () => ({
  flattenVectorSegments: (...args: unknown[]): unknown => flattenVectorSegmentsMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawVectorNode', () => {
  beforeEach(() => {
    deriveVectorFacesMock.mockClear();
    drawVectorFillMock.mockClear();
    drawVectorStrokeMock.mockClear();
    flattenVectorSegmentsMock.mockClear();
  });

  it('should derive faces/segments then draw the fill followed by the stroke, using the node’s own colors and width', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node: TVectorNode = {
      fillColor: '#ff0000',
      id: '1',
      name: 'Vector',
      parentId: null,
      segments: {},
      strokeColor: '#00ff00',
      strokeWidth: 3,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {},
    };
    const faces = [[{ x: 0, y: 0 }]];
    const flattened = [{ points: [{ x: 0, y: 0 }], segmentId: 's1' }];

    deriveVectorFacesMock.mockReturnValue(faces);
    flattenVectorSegmentsMock.mockReturnValue(flattened);

    // before
    drawVectorNode(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(deriveVectorFacesMock).toHaveBeenCalledWith(node);
    expect(flattenVectorSegmentsMock).toHaveBeenCalledWith(node);
    expect(drawVectorFillMock).toHaveBeenCalledWith(gl, program, buffer, faces, '#ff0000', 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorStrokeMock).toHaveBeenCalledWith(gl, program, buffer, flattened, '#00ff00', 3, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should skip drawing a fill (and never call deriveVectorFaces) when the node has no fillColor', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node: TVectorNode = {
      fillColor: null,
      id: '1',
      name: 'Vector',
      parentId: null,
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
    expect(deriveVectorFacesMock).not.toHaveBeenCalled();
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(drawVectorStrokeMock).toHaveBeenCalledWith(gl, program, buffer, flattened, '#00ff00', 3, 200, 150, IDENTITY_VIEWPORT);
  });
});
