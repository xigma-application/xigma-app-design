// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorSelectionOutline } from '../drawVectorSelectionOutline';

const drawRectMock = vi.fn();
const drawCornerHandlesMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));
vi.mock('utils/canvas/drawCornerHandles', () => ({ drawCornerHandles: (...args: unknown[]): void => drawCornerHandlesMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 30,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 40, y: 40 } },
};

describe('drawVectorSelectionOutline', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
    drawCornerHandlesMock.mockClear();
  });

  it('should draw a bounding-box outline and corner handles at the node rotation when it is not the currently edited node', () => {
    // before
    drawVectorSelectionOutline(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      null,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { height: 40, stroke: '#0d99ff', width: 40, x: 0, y: 0 },
      200,
      150,
      IDENTITY_VIEWPORT,
      30,
    );
    expect(drawCornerHandlesMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { height: 40, width: 40, x: 0, y: 0 },
      '#0d99ff',
      200,
      150,
      IDENTITY_VIEWPORT,
      30,
    );
  });

  it('should skip drawing when the node is currently in Vector Edit Mode, to avoid doubling up with its own handle layer', () => {
    // before
    drawVectorSelectionOutline(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      node.id,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawRectMock).not.toHaveBeenCalled();
    expect(drawCornerHandlesMock).not.toHaveBeenCalled();
  });
});
