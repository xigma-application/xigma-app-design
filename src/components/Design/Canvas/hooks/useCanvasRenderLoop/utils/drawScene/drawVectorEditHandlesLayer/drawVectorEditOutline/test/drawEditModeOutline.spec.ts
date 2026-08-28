// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawEditModeOutline } from '../drawEditModeOutline';

const drawVectorThickStrokeVerticesMock = vi.fn();
const getVectorNodeThickStrokeVerticesMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorThickStrokeVertices', () => ({
  drawVectorThickStrokeVertices: (...args: unknown[]): void => drawVectorThickStrokeVerticesMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices', () => ({
  getVectorNodeThickStrokeVertices: (...args: unknown[]): unknown => getVectorNodeThickStrokeVerticesMock(...args),
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
    drawVectorThickStrokeVerticesMock.mockClear();
    getVectorNodeThickStrokeVerticesMock.mockReset();
    getVectorNodeThickStrokeVerticesMock.mockReturnValue([]);
  });

  it('should draw the gray edit-mode outline at a constant screen width, regardless of hover', () => {
    // before
    drawEditModeOutline({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, node, 200, 150, {
      x: 0,
      y: 0,
      zoom: 2,
    });

    // result — HOVER_OUTLINE_WIDTH (2) / zoom (2) / 2 = 0.5 halfWidth
    expect(getVectorNodeThickStrokeVerticesMock).toHaveBeenCalledWith(node, 0.5);
    expect(drawVectorThickStrokeVerticesMock).toHaveBeenCalledTimes(1);
    expect(drawVectorThickStrokeVerticesMock).toHaveBeenCalledWith({}, {}, {}, null, [], '#aaaaaa', 200, 150, { x: 0, y: 0, zoom: 2 });
  });
});
