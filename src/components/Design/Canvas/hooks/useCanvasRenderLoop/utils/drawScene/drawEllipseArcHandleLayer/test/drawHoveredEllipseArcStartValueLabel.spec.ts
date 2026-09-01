// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawHoveredEllipseArcStartValueLabel } from '../drawHoveredEllipseArcStartValueLabel';

const drawEllipseArcStartValueLabelMock = vi.fn();

vi.mock('../drawEllipseArcStartValueLabel', () => ({
  drawEllipseArcStartValueLabel: (...args: unknown[]): void => drawEllipseArcStartValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };
const context = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};

const node: TEllipseNode = {
  fill: '#ff0000',
  height: 100,
  id: 'ellipse-1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 100,
  x: 0,
  y: 0,
};

describe('drawHoveredEllipseArcStartValueLabel', () => {
  beforeEach(() => {
    drawEllipseArcStartValueLabelMock.mockClear();
  });

  it('should draw nothing when the Start handle is neither hovered nor being dragged', () => {
    // before
    drawHoveredEllipseArcStartValueLabel(context, createCanvasRefs(), BOUNDS, 90, 0, node, null);

    // result
    expect(drawEllipseArcStartValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when a DIFFERENT node is marked as hovering the Start handle', () => {
    // before
    drawHoveredEllipseArcStartValueLabel(
      context,
      createCanvasRefs({ hover: { hoveredEllipseArcRotateHandleRef: { current: 'some-other-node' } } }),
      BOUNDS,
      90,
      0,
      node,
      null,
    );

    // result
    expect(drawEllipseArcStartValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw the label at the rest handle position when precisely hovering the Start handle', () => {
    // before — a 100x100 ellipse rest position for arcStartAngle 90 sits at (100, 50)
    drawHoveredEllipseArcStartValueLabel(
      context,
      createCanvasRefs({ hover: { hoveredEllipseArcRotateHandleRef: { current: node.id } } }),
      BOUNDS,
      90,
      0,
      node,
      null,
    );

    // result
    expect(drawEllipseArcStartValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseArcStartValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, { x: 100, y: 50 }, 0, 90);
  });

  it('should draw the label at the dragged position while actively dragging, even without a matching hover ref', () => {
    // before
    drawHoveredEllipseArcStartValueLabel(context, createCanvasRefs(), BOUNDS, 0, 0, node, { x: 7, y: 8 });

    // result
    expect(drawEllipseArcStartValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseArcStartValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, { x: 7, y: 8 }, 0, 0);
  });
});
