// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorEditOutline } from '../drawVectorEditOutline';

const drawVectorStrokeMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));

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
  vertices: {},
};

describe('drawVectorEditOutline', () => {
  beforeEach(() => {
    drawVectorStrokeMock.mockClear();
  });

  it('should draw the gray edit-mode outline at a constant screen width when the node is not the hovered one', () => {
    // before
    drawVectorEditOutline({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, node, null, 200, 150, {
      x: 0,
      y: 0,
      zoom: 2,
    });

    // result — HOVER_OUTLINE_WIDTH (2) / zoom (2) = 1
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock).toHaveBeenCalledWith({}, {}, {}, [], '#aaaaaa', 1, 200, 150, { x: 0, y: 0, zoom: 2 });
  });

  it('should skip drawing when the node is the currently hovered node', () => {
    // before
    drawVectorEditOutline({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, node, node.id, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });
});
