// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';
import { ELLIPSE_ARC_GUIDE_LINE_WIDTH } from '../../../../../../constants';

// types
import { TEllipseNode } from 'types/design/types';

// utils
import { drawFullyCutAwayGuideLine } from '../drawFullyCutAwayGuideLine';

const drawGuideLineMock = vi.fn();

vi.mock('utils/canvas/drawEllipseArcGuideLine', () => ({
  drawEllipseArcGuideLine: (...args: unknown[]): unknown => drawGuideLineMock(...args),
}));

const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const bounds = { height: 10, width: 10, x: 0, y: 0 };
const viewport = { x: 0, y: 0, zoom: 1 };
const node = { flipX: false, flipY: true, rotation: 45 } as TEllipseNode;

describe('drawFullyCutAwayGuideLine', () => {
  it('should draw the guide line at the arc end of a fully cut-away ellipse', () => {
    // before
    drawFullyCutAwayGuideLine(gl, program, buffer, bounds, 120, true, node, 200, 100, viewport);

    // result
    expect(drawGuideLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      bounds,
      120,
      DRAFT_FRAME_STROKE,
      ELLIPSE_ARC_GUIDE_LINE_WIDTH,
      200,
      100,
      viewport,
      45,
      false,
      true,
    );
  });

  it('should draw nothing while some of the ellipse remains', () => {
    // mock
    drawGuideLineMock.mockClear();

    // before
    drawFullyCutAwayGuideLine(gl, program, buffer, bounds, 120, false, node, 200, 100, viewport);

    // result
    expect(drawGuideLineMock).not.toHaveBeenCalled();
  });
});
