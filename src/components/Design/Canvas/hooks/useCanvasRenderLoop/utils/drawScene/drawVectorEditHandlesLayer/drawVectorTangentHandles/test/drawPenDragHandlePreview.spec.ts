// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawPenDragHandlePreview } from '../drawPenDragHandlePreview';

const drawTangentHandleMock = vi.fn();

vi.mock('../drawTangentHandle', () => ({ drawTangentHandle: (...args: unknown[]): void => drawTangentHandleMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
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
  vertices: { v1: { id: 'v1', x: 0, y: 0 } },
};

describe('drawPenDragHandlePreview', () => {
  beforeEach(() => {
    drawTangentHandleMock.mockClear();
  });

  it('should draw a plain, unhovered/unselected handle from the drag’s origin vertex to the live-dragged cursor position', () => {
    // before
    drawPenDragHandlePreview(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      'v1',
      { x: 30, y: 40 },
      false,
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v1,
      { x: 30, y: 40 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should forward isSnapped through to the tangent handle when the live drag is angle-snapped', () => {
    // before
    drawPenDragHandlePreview(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      'v1',
      { x: 30, y: 0 },
      true,
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v1,
      { x: 30, y: 0 },
      5,
      false,
      false,
      true,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw nothing when the drag has no origin vertex', () => {
    // before
    drawPenDragHandlePreview(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      null,
      { x: 30, y: 40 },
      false,
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when there is no live dragged handle position', () => {
    // before
    drawPenDragHandlePreview(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      'v1',
      null,
      false,
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).not.toHaveBeenCalled();
  });
});
