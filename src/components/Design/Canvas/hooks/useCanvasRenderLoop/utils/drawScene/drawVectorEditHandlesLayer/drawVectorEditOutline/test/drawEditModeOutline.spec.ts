// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawEditModeOutline } from '../drawEditModeOutline';

const drawVectorStrokeMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));

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
  vertices: {},
};

describe('drawEditModeOutline', () => {
  beforeEach(() => {
    drawVectorStrokeMock.mockClear();
  });

  it('should draw the gray edit-mode outline at a constant screen width, regardless of hover', () => {
    // before
    drawEditModeOutline({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, node, 200, 150, {
      x: 0,
      y: 0,
      zoom: 2,
    });

    // result — HOVER_OUTLINE_WIDTH (2) / zoom (2) = 1
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock).toHaveBeenCalledWith({}, {}, {}, [], '#aaaaaa', 1, 200, 150, { x: 0, y: 0, zoom: 2 });
  });
});
