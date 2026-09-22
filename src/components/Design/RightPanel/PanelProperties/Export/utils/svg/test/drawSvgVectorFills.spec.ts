// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawSvgVectorFills } from '../drawSvgVectorFills';

const groupFilledFacesForRenderingMock = vi.fn();
const drawSvgPaintPolygonsMock = vi.fn();
const getVectorNodeBoundsMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/groupFilledFacesForRendering', () => ({
  groupFilledFacesForRendering: (...args: unknown[]): unknown => groupFilledFacesForRenderingMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorNodeBounds', () => ({
  getVectorNodeBounds: (...args: unknown[]): unknown => getVectorNodeBoundsMock(...args),
}));
vi.mock('../drawSvgPaintPolygons', () => ({ drawSvgPaintPolygons: (...args: unknown[]): void => drawSvgPaintPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const node: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'v',
  name: 'v',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('drawSvgVectorFills', () => {
  beforeEach(() => {
    drawSvgPaintPolygonsMock.mockClear();
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

    const elements: string[] = [];
    const defs: string[] = [];

    // action
    drawSvgVectorFills(elements, defs, node, 0.5, bounds);

    // result
    expect(getVectorNodeBoundsMock).toHaveBeenCalledWith(node);

    const nodeBounds = { height: 20, width: 20, x: 0, y: 0 };

    expect(drawSvgPaintPolygonsMock).toHaveBeenCalledTimes(2);
    expect(drawSvgPaintPolygonsMock).toHaveBeenNthCalledWith(1, elements, defs, paintA, polygonsA, 0.5, bounds, nodeBounds);
    expect(drawSvgPaintPolygonsMock).toHaveBeenNthCalledWith(2, elements, defs, paintB, polygonsB, 0.5, bounds, nodeBounds);
  });

  it('should draw nothing when there are no fill groups', () => {
    // mock
    groupFilledFacesForRenderingMock.mockReturnValue([]);

    // action
    drawSvgVectorFills([], [], node, 1, bounds);

    // result
    expect(drawSvgPaintPolygonsMock).not.toHaveBeenCalled();
  });
});
