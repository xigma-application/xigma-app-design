// types
import { NodeType } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

// utils
import { drawLineSelectionOutline } from '../drawLineSelectionOutline';

const drawLineMock = vi.fn();
const drawLineEndpointHandlesMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));
vi.mock('utils/canvas/drawLineEndpointHandles', () => ({
  drawLineEndpointHandles: (...args: unknown[]): void => drawLineEndpointHandlesMock(...args),
}));

const node: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 20,
};

describe('drawLineSelectionOutline', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
    drawLineEndpointHandlesMock.mockClear();
  });

  it('should draw the line stroke at a zoom-adjusted width and a handle at each endpoint', () => {
    // before
    drawLineSelectionOutline({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, node, 200, 150, { x: 0, y: 0, zoom: 2 });

    // result — LINE_SELECTED_STROKE_WIDTH (0.1) / zoom (2) = 0.05
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, node, '#0d99ff', 0.05, 200, 150, { x: 0, y: 0, zoom: 2 });
    expect(drawLineEndpointHandlesMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      [
        { x: 0, y: 0 },
        { x: 10, y: 20 },
      ],
      '#0d99ff',
      200,
      150,
      { x: 0, y: 0, zoom: 2 },
    );
  });
});
