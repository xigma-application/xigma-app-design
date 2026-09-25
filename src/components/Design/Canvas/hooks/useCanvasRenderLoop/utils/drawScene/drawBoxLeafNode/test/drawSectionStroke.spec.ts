// others
import { SECTION_STROKE, SECTION_STROKE_OPACITY, SECTION_STROKE_WIDTH_PX } from 'constant/canvas';

// types
import { StrokeAlign } from 'types/design/enums';
import { TDrawContext } from '../../types';

// utils
import { drawSectionStroke } from '../drawSectionStroke';

const drawThickOutlineMock = vi.fn();

vi.mock('utils/canvas/drawThickOutline/drawThickOutline', () => ({
  drawThickOutline: (...args: unknown[]): void => drawThickOutlineMock(...args),
}));

const viewport = { x: 0, y: 0, zoom: 1 };
const context = { buffer: {}, canvasHeight: 150, canvasWidth: 200, gl: {}, program: {}, viewport } as unknown as TDrawContext;

describe('drawSectionStroke', () => {
  it('should draw a 1px white inside outline at 10% of the given opacity', () => {
    // mock
    const rect = { cornerRadius: 5, height: 20, width: 60, x: 10, y: 20 };

    // action
    drawSectionStroke(context, rect, 15, 0.5);

    // result
    expect(drawThickOutlineMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      rect,
      SECTION_STROKE,
      SECTION_STROKE_WIDTH_PX,
      200,
      150,
      viewport,
      15,
      StrokeAlign.inside,
      SECTION_STROKE_OPACITY * 0.5,
    );
  });
});
