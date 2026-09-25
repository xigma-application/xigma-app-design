// others
import { SECTION_STROKE_WIDTH_PX } from 'constant/canvas';

// types
import { StrokeAlign } from 'types/design/enums';
import { TDrawContext } from '../../types';

// utils
import { drawSectionNameLabelStroke } from '../drawSectionNameLabelStroke';

const drawThickOutlineMock = vi.fn();

vi.mock('utils/canvas/drawThickOutline/drawThickOutline', () => ({
  drawThickOutline: (...args: unknown[]): void => drawThickOutlineMock(...args),
}));

const viewport = { x: 0, y: 0, zoom: 1 };
const context = { buffer: {}, canvasHeight: 150, canvasWidth: 200, gl: {}, program: {}, viewport } as unknown as TDrawContext;
const rect = { cornerRadius: 5, height: 20, width: 60, x: 10, y: 20 };

describe('drawSectionNameLabelStroke', () => {
  beforeEach(() => {
    drawThickOutlineMock.mockClear();
  });

  it('should draw an unrotated inside outline in the label stroke color and opacity', () => {
    // before
    drawSectionNameLabelStroke(context, rect, { fill: '#444444', stroke: '#FFFFFF', strokeOpacity: 0.1, textFill: '#ffffff' });

    // result
    expect(drawThickOutlineMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      rect,
      '#FFFFFF',
      SECTION_STROKE_WIDTH_PX,
      200,
      150,
      viewport,
      0,
      StrokeAlign.inside,
      0.1,
    );
  });

  it('should draw nothing when the label has no stroke', () => {
    // before
    drawSectionNameLabelStroke(context, rect, { fill: '#444444', stroke: null, strokeOpacity: 0, textFill: '#ffffff' });

    // result
    expect(drawThickOutlineMock).not.toHaveBeenCalled();
  });
});
