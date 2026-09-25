// types
import { NodeType, StrokeJoin } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TLineNode, TPolygonNode } from 'types/design/types';

// utils
import { drawOffsetVectorPreview } from '../drawOffsetVectorPreview';

const drawVectorNodeMock = vi.fn();
const drawVectorStrokeMock = vi.fn();

vi.mock('../drawVectorNodeOrTextPathGuide/drawSceneVectorNode/drawVectorNode', () => ({
  drawVectorNode: (...args: unknown[]): unknown => drawVectorNodeMock(...args),
}));
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
    drawVectorNodeMock.mockClear();
  });

  it('should outline the offset shape of the line being offset', () => {
    // action
    drawOffsetVectorPreview(context, { distance: 10, join: StrokeJoin.miter, nodeId: 'line' }, { line });

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock.mock.calls[0][4]).toBe('#e234b5');
    expect(drawVectorNodeMock).not.toHaveBeenCalled();
  });

  it('should draw nothing outside the offset mode or for a node that is not a line', () => {
    // action
    drawOffsetVectorPreview(context, null, { line });
    drawOffsetVectorPreview(context, { distance: 10, join: StrokeJoin.miter, nodeId: 'missing' }, { line });

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });

  it('should draw the filled offset shape of a polygon under its outline', () => {
    // mock
    const polygon: TPolygonNode = {
      fills: [{ color: '#d9d9d9', opacity: 100, type: 'solid' }],
      flipX: false,
      flipY: false,
      height: 100,
      id: 'polygon',
      name: 'Polygon',
      parentId: null,
      rotation: 0,
      sides: 3,
      type: NodeType.polygon,
      width: 100,
      x: 0,
      y: 0,
    };

    // action
    drawOffsetVectorPreview(context, { distance: 10, join: StrokeJoin.miter, nodeId: 'polygon' }, { polygon });

    // result
    expect(drawVectorNodeMock).toHaveBeenCalledWith(context, expect.objectContaining({ defaultFill: polygon.fills, id: 'polygon' }));
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
  });
});
