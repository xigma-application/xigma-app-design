// others
import { SELECTION_SIZE_LABEL_EDGE_GAP_PX, SIZE_LABEL_FILL } from 'constant/canvas';

// types
import { TDrawSceneContext } from '../types';

// utils
import { drawLineSizeLabel } from '../drawLineSizeLabel';

const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): unknown => drawValueLabelMock(...args),
}));
vi.mock('../getLineSizeLabelPlacement', () => ({
  getLineSizeLabelPlacement: (): unknown => ({ anchor: { x: 1, y: 2 }, angleDeg: 30, offsetDirection: { x: 0, y: 1 } }),
}));

describe('drawLineSizeLabel', () => {
  it('should label the rounded line length along the line', () => {
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

    // before
    drawLineSizeLabel(context, 0, 0, 3, 4.4);

    // result
    expect(drawValueLabelMock).toHaveBeenCalledWith('gl', 'p', 'b', 'ic', '5 x 0', { x: 1, y: 2 }, { x: 0, y: 1 }, 200, 100, 'v', {
      angleDeg: 30,
      edgeGapPx: SELECTION_SIZE_LABEL_EDGE_GAP_PX,
      fill: SIZE_LABEL_FILL,
    });
  });
});
