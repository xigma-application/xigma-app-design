// others
import { SELECTION_SIZE_LABEL_EDGE_GAP_PX, SIZE_LABEL_FILL } from 'constant/canvas';

// types
import { SizingMode } from 'types/design/enums';
import { TDrawSceneContext } from '../types';

// utils
import { drawRectSizeLabel } from '../drawRectSizeLabel';

const drawValueLabelMock = vi.fn();
const getSizeLabelTextMock = vi.fn(() => '10 x 20');

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): unknown => drawValueLabelMock(...args),
}));
vi.mock('../getSelectionSizeLabelPlacement', () => ({
  getSelectionSizeLabelPlacement: (): unknown => ({ anchor: { x: 1, y: 2 }, angleDeg: 0, offsetDirection: { x: 0, y: 1 } }),
}));
vi.mock('../getSizeLabelText', () => ({ getSizeLabelText: (...args: unknown[]): unknown => getSizeLabelTextMock(...(args as [])) }));

describe('drawRectSizeLabel', () => {
  it('should label the rect size, with its sizing modes, below the rect', () => {
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
    const sizingModes = { width: SizingMode.hug };

    // before
    drawRectSizeLabel(context, { height: 20, rotation: 0, width: 10, x: 0, y: 0 }, sizingModes);

    // result
    expect(getSizeLabelTextMock).toHaveBeenCalledWith(10, 20, sizingModes);
    expect(drawValueLabelMock).toHaveBeenCalledWith('gl', 'p', 'b', 'ic', '10 x 20', { x: 1, y: 2 }, { x: 0, y: 1 }, 200, 100, 'v', {
      angleDeg: 0,
      edgeGapPx: SELECTION_SIZE_LABEL_EDGE_GAP_PX,
      fill: SIZE_LABEL_FILL,
    });
  });
});
