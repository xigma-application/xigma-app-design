// types
import { NodeType } from 'types/design/enums';
import { TDrawContext } from '../../types';
import { TEllipseNode } from 'types/design/types';

// utils
import { drawEllipseLeafNode } from '../drawEllipseLeafNode';

const drawEllipseNodeMock = vi.fn();
const drawThickEllipseOutlineMock = vi.fn();

vi.mock('../drawEllipseNode', () => ({ drawEllipseNode: (...args: unknown[]): void => drawEllipseNodeMock(...args) }));
vi.mock('utils/canvas/shapes/drawThickEllipseOutline', () => ({
  drawThickEllipseOutline: (...args: unknown[]): void => drawThickEllipseOutlineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const context: TDrawContext = { buffer, canvasHeight: 150, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT };

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fill: '#fff',
  height: 20,
  id: 'e1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawEllipseLeafNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the ellipse with the threaded opacity, defaulting unset arc angles to the full-ellipse default', () => {
    // mock
    const node = ellipse();

    // action
    drawEllipseLeafNode(context, node, 0.5);

    // result
    expect(drawEllipseNodeMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { ...node, arcEndAngle: 90, arcStartAngle: 90, fillAlpha: 0.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );
    expect(drawThickEllipseOutlineMock).not.toHaveBeenCalled();
  });

  it('should preserve explicit arc angles and flip flags instead of overriding them', () => {
    // mock
    const node = ellipse({ arcEndAngle: 270, arcStartAngle: 90, flipX: true, flipY: true });

    // action
    drawEllipseLeafNode(context, node, 1);

    // result
    expect(drawEllipseNodeMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { ...node, arcEndAngle: 270, arcStartAngle: 90, fillAlpha: 1 },
      200,
      150,
      IDENTITY_VIEWPORT,
      true,
      true,
      0,
    );
  });

  it('should draw the stroke outline when both strokeColor and strokeWidth are set', () => {
    // mock
    const node = ellipse({ strokeColor: '#000', strokeWidth: 2 });

    // action
    drawEllipseLeafNode(context, node, 1);

    // result
    expect(drawThickEllipseOutlineMock).toHaveBeenCalledWith(gl, program, buffer, node, '#000', 2, 200, 150, IDENTITY_VIEWPORT, 0);
  });

  it('should skip the stroke outline when strokeWidth is missing, even with a strokeColor set', () => {
    // mock
    const node = ellipse({ strokeColor: '#000' });

    // action
    drawEllipseLeafNode(context, node, 1);

    // result
    expect(drawThickEllipseOutlineMock).not.toHaveBeenCalled();
  });
});
