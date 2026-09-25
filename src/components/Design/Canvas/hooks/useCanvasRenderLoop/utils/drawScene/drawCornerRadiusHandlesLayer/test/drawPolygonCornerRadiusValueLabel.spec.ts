// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TDrawSceneContext } from '../../types';

// utils
import { drawPolygonCornerRadiusValueLabel } from '../drawPolygonCornerRadiusValueLabel';

const drawValueLabelMock = vi.fn();
const anchorMock = vi.fn(() => ({ anchor: { x: 1, y: 2 }, direction: { x: 0, y: -1 } }));

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): unknown => drawValueLabelMock(...args),
}));
vi.mock('../getPolygonCornerRadiusValueLabelAnchor', () => ({
  getPolygonCornerRadiusValueLabelAnchor: (...args: unknown[]): unknown => anchorMock(...(args as [])),
}));

describe('drawPolygonCornerRadiusValueLabel', () => {
  it('should label the radius next to the polygon corner handle', () => {
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
    drawPolygonCornerRadiusValueLabel(context, bounds, 5, 4, 30, true, false, false);

    // result
    expect(anchorMock).toHaveBeenCalledWith(bounds, 5, 4, 30, 'v', true, false, false);
    expect(drawValueLabelMock).toHaveBeenCalledWith('gl', 'p', 'b', 'ic', 'Radius 4', { x: 1, y: 2 }, { x: 0, y: -1 }, 200, 100, 'v', {
      fill: DRAFT_FRAME_STROKE,
    });
  });
});
