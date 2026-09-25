// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';
import { ELLIPSE_ARC_GUIDE_LINE_WIDTH } from '../../../../../../constants';

// types
import { TEllipseNode } from 'types/design/types';
import { TEllipseMajorArc } from 'utils/canvas/ellipseArc/getEllipseArcMajorArc';

// utils
import { drawArcRatioGuide } from '../drawArcRatioGuide';

const drawGuideArcMock = vi.fn();
const effectiveAnglesMock = vi.fn(() => ({ effectiveEndAngle: 200, effectiveStartAngle: 20 }));

vi.mock('utils/canvas/drawEllipseArcRatioGuideArc', () => ({
  drawEllipseArcRatioGuideArc: (...args: unknown[]): unknown => drawGuideArcMock(...args),
}));
vi.mock('utils/canvas/ellipseArc/getEffectiveArcAngles', () => ({
  getEffectiveArcAngles: (...args: unknown[]): unknown => effectiveAnglesMock(...(args as [])),
}));

const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const bounds = { height: 10, width: 10, x: 0, y: 0 };
const viewport = { x: 0, y: 0, zoom: 1 };
const node = { flipX: true, flipY: false, rotation: 30 } as TEllipseNode;
const arc = (majorSweep: number): TEllipseMajorArc => ({ majorSweep }) as unknown as TEllipseMajorArc;

describe('drawArcRatioGuide', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should trace the full ring guide along the effective arc of a solid ellipse arc', () => {
    // before
    drawArcRatioGuide(gl, program, buffer, bounds, 0, 90, 1, arc(270), node, 200, 100, viewport);

    // result
    expect(effectiveAnglesMock).toHaveBeenCalledWith(0, 90, false, arc(270));
    expect(drawGuideArcMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      bounds,
      20,
      200,
      DRAFT_FRAME_STROKE,
      ELLIPSE_ARC_GUIDE_LINE_WIDTH,
      200,
      100,
      viewport,
      30,
      true,
      false,
    );
  });

  it('should pass on an inverted ratio', () => {
    // before
    drawArcRatioGuide(gl, program, buffer, bounds, 0, 90, 1, arc(270), { ...node, arcRatioInverted: true }, 200, 100, viewport);

    // result
    expect(effectiveAnglesMock).toHaveBeenCalledWith(0, 90, true, arc(270));
  });

  it('should draw nothing for a ring with a hole or a full circle', () => {
    // before
    drawArcRatioGuide(gl, program, buffer, bounds, 0, 90, 0.5, arc(270), node, 200, 100, viewport);
    drawArcRatioGuide(gl, program, buffer, bounds, 0, 360, 1, arc(360), node, 200, 100, viewport);

    // result
    expect(drawGuideArcMock).not.toHaveBeenCalled();
  });
});
