// types
import { TCanvasRefs, TSmartSelectionGapDragState } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../../types';
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';

// utils
import { drawSmartSelectionLayoutHandles } from '../drawSmartSelectionLayoutHandles';

const fillPreviewMock = vi.fn();
const gapHandlesMock = vi.fn();
const swapHandlesMock = vi.fn();

vi.mock('../drawSmartSelectionGapFillPreview/drawSmartSelectionGapFillPreview', () => ({
  drawSmartSelectionGapFillPreview: (...args: unknown[]): unknown => fillPreviewMock(...args),
}));
vi.mock('../drawSmartSelectionGapHandles', () => ({
  drawSmartSelectionGapHandles: (...args: unknown[]): unknown => gapHandlesMock(...args),
}));
vi.mock('../drawSmartSelectionSwapHandles', () => ({
  drawSmartSelectionSwapHandles: (...args: unknown[]): unknown => swapHandlesMock(...args),
}));

const context = { buffer: 'b', canvasHeight: 100, canvasWidth: 200, gl: 'gl', program: 'p', viewport: 'v' } as unknown as TDrawSceneContext;
const layout = { id: 'layout' } as unknown as TSmartSelectionLayout;
const refs = (center: { x: number; y: number } | null): TCanvasRefs =>
  ({ hover: { hoveredSmartSelectionSwapRef: { current: center ? { center } : null } } }) as unknown as TCanvasRefs;

describe('drawSmartSelectionLayoutHandles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should preview a gap drag, draw the gap handles of an active box and the swap handles around the hovered one', () => {
    // before
    drawSmartSelectionLayoutHandles(context, refs({ x: 1, y: 2 }), layout, { axis: 'x' } as TSmartSelectionGapDragState, true);

    // result
    expect(fillPreviewMock).toHaveBeenCalledWith('gl', 'p', 'b', layout, 'x', 200, 100, 'v');
    expect(gapHandlesMock).toHaveBeenCalledWith('gl', 'p', 'b', layout, 200, 100, 'v');
    expect(swapHandlesMock).toHaveBeenCalledWith('gl', 'p', 'b', layout, true, { x: 1, y: 2 }, 200, 100, 'v');
  });

  it('should draw only the swap handles when idle and nothing is hovered', () => {
    // before
    drawSmartSelectionLayoutHandles(context, refs(null), layout, null, false);

    // result
    expect(fillPreviewMock).not.toHaveBeenCalled();
    expect(gapHandlesMock).not.toHaveBeenCalled();
    expect(swapHandlesMock).toHaveBeenCalledWith('gl', 'p', 'b', layout, false, null, 200, 100, 'v');
  });
});
