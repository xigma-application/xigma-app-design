// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDrawContext } from '../types';
import { TLineNode } from 'types/design/types';

// utils
import { drawLineLeafNode } from '../drawLineLeafNode';

const drawLineMock = vi.fn();
const drawLineEndpointArrowheadsMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));
vi.mock('../drawLineEndpointArrowheads', () => ({
  drawLineEndpointArrowheads: (...args: unknown[]): void => drawLineEndpointArrowheadsMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const context: TDrawContext = { buffer, canvasHeight: 150, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT };

const line = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  id: 'l1',
  name: 'Line',
  parentId: null,
  stroke: '#222',
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 0,
  ...overrides,
});

describe('drawLineLeafNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the line with the threaded opacity, defaulting the stroke width, and thread the endpoint arrowheads', () => {
    // mock
    const node = line();

    // action
    drawLineLeafNode(context, node, 0.5);

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      node,
      '#222',
      LINE_RENDER_STROKE_WIDTH,
      200,
      150,
      IDENTITY_VIEWPORT,
      0.5,
    );
    expect(drawLineEndpointArrowheadsMock).toHaveBeenCalledWith(context, node);
  });

  it('should use an explicit stroke width instead of the default when one is set', () => {
    // mock
    const node = line({ strokeWidth: 4 });

    // action
    drawLineLeafNode(context, node, 1);

    // result
    expect(drawLineMock).toHaveBeenCalledWith(gl, program, buffer, node, '#222', 4, 200, 150, IDENTITY_VIEWPORT, 1);
  });
});
