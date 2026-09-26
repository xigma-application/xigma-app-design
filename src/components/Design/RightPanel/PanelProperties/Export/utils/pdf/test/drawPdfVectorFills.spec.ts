import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawPdfVectorFills } from '../drawPdfVectorFills';

const groupFilledFacesForRenderingMock = vi.fn();
const drawPdfPaintPolygonsMock = vi.fn();
const getVectorNodeBoundsMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/groupFilledFacesForRendering', () => ({
  groupFilledFacesForRendering: (...args: unknown[]): unknown => groupFilledFacesForRenderingMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorNodeBounds', () => ({
  getVectorNodeBounds: (...args: unknown[]): unknown => getVectorNodeBoundsMock(...args),
}));
vi.mock('../drawPdfPaintPolygons', () => ({ drawPdfPaintPolygons: (...args: unknown[]): void => drawPdfPaintPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

const node: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'v',
  name: 'v',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeWidth: 0,
  strokes: [],
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('drawPdfVectorFills', () => {
  beforeEach(() => {
    drawPdfPaintPolygonsMock.mockClear();
    getVectorNodeBoundsMock.mockReset();
    getVectorNodeBoundsMock.mockReturnValue({ height: 20, width: 20, x: 0, y: 0 });
  });

  it('should draw one paint-polygons call per fill group, threading the rendered node bounds through as the gradient fill bounds', () => {
    // mock
    const paintA = [{ color: '#111111', opacity: 100, type: 'solid' as const }];
    const paintB = [{ color: '#222222', opacity: 100, type: 'solid' as const }];
    const polygonsA = [[{ x: 0, y: 0 }]];
    const polygonsB = [[{ x: 1, y: 1 }]];

    groupFilledFacesForRenderingMock.mockReturnValue([
      { paint: paintA, polygons: polygonsA },
      { paint: paintB, polygons: polygonsB },
    ]);

    // action
    drawPdfVectorFills(page, node, 0.5, bounds, states);

    // result
    expect(getVectorNodeBoundsMock).toHaveBeenCalledWith(node);

    const nodeBounds = { height: 20, width: 20, x: 0, y: 0 };

    expect(drawPdfPaintPolygonsMock).toHaveBeenCalledTimes(2);
    expect(drawPdfPaintPolygonsMock).toHaveBeenNthCalledWith(1, page, paintA, polygonsA, 0.5, bounds, states, nodeBounds);
    expect(drawPdfPaintPolygonsMock).toHaveBeenNthCalledWith(2, page, paintB, polygonsB, 0.5, bounds, states, nodeBounds);
  });

  it('should draw nothing when there are no fill groups', () => {
    // mock
    groupFilledFacesForRenderingMock.mockReturnValue([]);

    // action
    drawPdfVectorFills(page, node, 1, bounds, states);

    // result
    expect(drawPdfPaintPolygonsMock).not.toHaveBeenCalled();
  });
});
