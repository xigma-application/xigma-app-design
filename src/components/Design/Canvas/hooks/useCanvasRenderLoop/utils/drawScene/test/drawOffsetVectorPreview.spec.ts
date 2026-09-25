// types
import { NodeType, StrokeJoin } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TLineNode } from 'types/design/types';

// utils
import { drawOffsetVectorPreview } from '../drawOffsetVectorPreview';

const drawVectorStrokeMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): unknown => drawVectorStrokeMock(...args),
}));

const context = { canvasHeight: 100, canvasWidth: 100, viewport: { x: 0, y: 0, zoom: 2 } } as TDrawSceneContext;
const line: TLineNode = {
  height: 0,
  id: 'line',
  name: 'Line',
  parentId: null,
  rotation: 0,
  strokes: [],
  type: NodeType.line,
  width: 100,
  x: 0,
  y: 0,
};

describe('drawOffsetVectorPreview', () => {
  beforeEach(() => {
    drawVectorStrokeMock.mockClear();
  });

  it('should outline the offset shape of the line being offset', () => {
    // action
    drawOffsetVectorPreview(context, { distance: 10, join: StrokeJoin.miter, nodeId: 'line' }, { line });

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock.mock.calls[0][4]).toBe('#e234b5');
  });

  it('should draw nothing outside the offset mode or for a node that is not a line', () => {
    // action
    drawOffsetVectorPreview(context, null, { line });
    drawOffsetVectorPreview(context, { distance: 10, join: StrokeJoin.miter, nodeId: 'missing' }, { line });

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });
});
