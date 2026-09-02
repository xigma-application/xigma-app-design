// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorRoundedCaps } from '../drawVectorRoundedCaps';

const drawEllipseMock = vi.fn();
const getOpenVectorEndpointsMock = vi.fn();

vi.mock('../../shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));
vi.mock('../../vectorNetwork/getOpenVectorEndpoints', () => ({
  getOpenVectorEndpoints: (...args: unknown[]): unknown => getOpenVectorEndpointsMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const baseNode: TVectorNode = {
  capStyle: 'round',
  defaultFill: null,
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#00ff00',
  strokeWidth: 2,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 10, y: 20 } },
};

describe('drawVectorRoundedCaps', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
    getOpenVectorEndpointsMock.mockClear();
  });

  it('should draw a small ellipse centered on every open endpoint when the node uses round caps', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    getOpenVectorEndpointsMock.mockReturnValue(['v1']);

    // before
    drawVectorRoundedCaps(gl, program, buffer, baseNode, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(getOpenVectorEndpointsMock).toHaveBeenCalledWith(baseNode);
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: '#00ff00', height: 2, width: 2, x: 9, y: 19 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should draw one ellipse per open endpoint', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node: TVectorNode = { ...baseNode, vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } } };

    getOpenVectorEndpointsMock.mockReturnValue(['v1', 'v2']);

    // before
    drawVectorRoundedCaps(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
  });

  it('should draw nothing and never resolve open endpoints when the node does not use round caps', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node: TVectorNode = { ...baseNode, capStyle: undefined };

    // before
    drawVectorRoundedCaps(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(getOpenVectorEndpointsMock).not.toHaveBeenCalled();
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });
});
