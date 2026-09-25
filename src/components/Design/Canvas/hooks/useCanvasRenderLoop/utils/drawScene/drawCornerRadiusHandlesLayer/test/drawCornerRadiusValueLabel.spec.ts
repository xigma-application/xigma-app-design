// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TDrawSceneContext } from '../../types';

// utils
import { drawCornerRadiusValueLabel } from '../drawCornerRadiusValueLabel';

const drawValueLabelMock = vi.fn();
const anchorMock = vi.fn(() => ({ anchor: { x: 1, y: 2 }, direction: { x: 0, y: -1 } }));

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): unknown => drawValueLabelMock(...args),
}));
vi.mock('../getCornerRadiusValueLabelAnchor', () => ({
  getCornerRadiusValueLabelAnchor: (...args: unknown[]): unknown => anchorMock(...(args as [])),
}));

describe('drawCornerRadiusValueLabel', () => {
  it('should label the radius next to the dragged corner handle', () => {
    // mock
    const context = {
      buffer: 'b',
      canvasHeight: 100,
      canvasWidth: 200,
      gl: 'gl',
      imageContext: 'ic',
      program: 'p',
      viewport: 'v',
    } as unknown as TDrawSceneContext;
    const bounds = { height: 10, width: 10, x: 0, y: 0 };

    // before
    drawCornerRadiusValueLabel(context, bounds, 8, 15, 'topLeft' as never, true);

    // result
    expect(anchorMock).toHaveBeenCalledWith(bounds, 8, 15, 'v', 'topLeft', true);
    expect(drawValueLabelMock).toHaveBeenCalledWith('gl', 'p', 'b', 'ic', 'Radius 8', { x: 1, y: 2 }, { x: 0, y: -1 }, 200, 100, 'v', {
      fill: DRAFT_FRAME_STROKE,
    });
  });
});
