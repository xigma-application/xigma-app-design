// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorVertexDots } from '../drawVectorVertexDots';

const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  fillColor: null,
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
};

describe('drawVectorVertexDots', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
  });

  it('should draw a dot for every vertex, using the selected fill for a selected vertex and the default fill otherwise', () => {
    // before
    drawVectorVertexDots({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, node, ['v1'], 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#0d99ff', height: 5, width: 5, x: -2.5, y: -2.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#ffffff', height: 5, width: 5, x: 7.5, y: -2.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should draw every vertex with the default fill when none are selected', () => {
    // before
    drawVectorVertexDots({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, node, [], 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
    expect(drawEllipseMock.mock.calls.every((args) => args[3].fill === '#ffffff')).toBe(true);
  });
});
