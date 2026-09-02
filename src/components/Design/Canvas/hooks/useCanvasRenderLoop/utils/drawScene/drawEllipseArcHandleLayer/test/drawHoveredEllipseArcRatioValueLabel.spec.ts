// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawHoveredEllipseArcRatioValueLabel } from '../drawHoveredEllipseArcRatioValueLabel';
import { getEllipseArcRatioHandlePosition } from 'utils/canvas/ellipseArc/getEllipseArcRatioHandlePosition';

const drawEllipseArcRatioValueLabelMock = vi.fn();

vi.mock('../drawEllipseArcRatioValueLabel', () => ({
  drawEllipseArcRatioValueLabel: (...args: unknown[]): void => drawEllipseArcRatioValueLabelMock(...args),
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
  arcEndAngle: 0,
  arcRatio: 0.5,
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

const restHandlePosition = getEllipseArcRatioHandlePosition(BOUNDS, 90, 0, 0.5);

describe('drawHoveredEllipseArcRatioValueLabel', () => {
  beforeEach(() => {
    drawEllipseArcRatioValueLabelMock.mockClear();
  });

  it('should draw nothing when the Ratio handle is neither hovered nor being dragged', () => {
    // before
    drawHoveredEllipseArcRatioValueLabel(context, createCanvasRefs(), BOUNDS, 90, 0, 0.5, node, null);

    // result
    expect(drawEllipseArcRatioValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when a DIFFERENT node is marked as hovering the Ratio handle', () => {
    // before
    drawHoveredEllipseArcRatioValueLabel(
      context,
      createCanvasRefs({ hover: { hoveredEllipseArcRatioHandleRef: { current: 'some-other-node' } } }),
      BOUNDS,
      90,
      0,
      0.5,
      node,
      null,
    );

    // result
    expect(drawEllipseArcRatioValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw the label at the rest handle position when precisely hovering the Ratio handle', () => {
    // before
    drawHoveredEllipseArcRatioValueLabel(
      context,
      createCanvasRefs({ hover: { hoveredEllipseArcRatioHandleRef: { current: node.id } } }),
      BOUNDS,
      90,
      0,
      0.5,
      node,
      null,
    );

    // result
    expect(drawEllipseArcRatioValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseArcRatioValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, restHandlePosition, 0, 0.5);
  });

  it('should draw the label at the dragged position while actively dragging, even without a matching hover ref', () => {
    // before
    drawHoveredEllipseArcRatioValueLabel(context, createCanvasRefs(), BOUNDS, 90, 0, 0.5, node, { x: 7, y: 8 });

    // result
    expect(drawEllipseArcRatioValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseArcRatioValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, { x: 7, y: 8 }, 0, 0.5);
  });
});
