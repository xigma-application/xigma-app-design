// types
import { NodeType } from 'types/design/enums';
import { SvgLayerType } from '../../enums';
import { TSvgDrawContext } from '../types';

// utils
import { drawSvgLayer } from '../drawSvgLayer';

const drawSvgShapeMock = vi.fn();
const drawSvgTextCurvesMock = vi.fn();
const drawSvgTextNodeMock = vi.fn();
const embedSvgRasterLayerMock = vi.fn();
const getSvgElementIdMock = vi.fn();
const getSvgLayerAncestorGroupsMock = vi.fn();
const getSvgLocalizedNodeMock = vi.fn();
const isSvgBoxModelShapeNodeMock = vi.fn();
const updateSvgAncestorGroupStackMock = vi.fn();

vi.mock('../../drawSvgShape', () => ({ drawSvgShape: (...args: unknown[]): unknown => drawSvgShapeMock(...args) }));
vi.mock('../../drawSvgTextCurves', () => ({ drawSvgTextCurves: (...args: unknown[]): unknown => drawSvgTextCurvesMock(...args) }));
vi.mock('../../drawSvgTextNode', () => ({ drawSvgTextNode: (...args: unknown[]): unknown => drawSvgTextNodeMock(...args) }));
vi.mock('../../embedSvgRasterLayer', () => ({ embedSvgRasterLayer: (...args: unknown[]): unknown => embedSvgRasterLayerMock(...args) }));
vi.mock('../../getSvgElementId', () => ({ getSvgElementId: (...args: unknown[]): unknown => getSvgElementIdMock(...args) }));
vi.mock('../../getSvgLayerAncestorGroups', () => ({
  getSvgLayerAncestorGroups: (...args: unknown[]): unknown => getSvgLayerAncestorGroupsMock(...args),
}));
vi.mock('../../getSvgLocalizedNode', () => ({ getSvgLocalizedNode: (...args: unknown[]): unknown => getSvgLocalizedNodeMock(...args) }));
vi.mock('../../isSvgBoxModelShapeNode', () => ({
  isSvgBoxModelShapeNode: (...args: unknown[]): unknown => isSvgBoxModelShapeNodeMock(...args),
}));
vi.mock('../../updateSvgAncestorGroupStack', () => ({
  updateSvgAncestorGroupStack: (...args: unknown[]): unknown => updateSvgAncestorGroupStackMock(...args),
}));

const context: TSvgDrawContext = {
  bounds: { height: 100, width: 100, x: 0, y: 0 },
  ignoreOverlappingLayers: true,
  imageResampling: 'detailed' as never,
  includeIdAttribute: false,
  isSoleRasterLayer: false,
  jpegQuality: 0.92,
  nodeId: 'root',
  nodesById: {},
  rasterScale: 2,
};

const rectNode = {
  fills: [],
  height: 10,
  id: 'r',
  name: 'Rect',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};
const lineNode = { id: 'l', name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 10 };
const textNode = {
  content: 'Hi',
  fill: '#000000',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 12,
  height: 10,
  id: 't',
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 10,
  x: 0,
  y: 0,
};

describe('drawSvgLayer', () => {
  beforeEach(() => {
    drawSvgShapeMock.mockClear();
    drawSvgTextCurvesMock.mockClear();
    drawSvgTextNodeMock.mockClear();
    embedSvgRasterLayerMock.mockClear();
    getSvgElementIdMock.mockClear();
    getSvgLayerAncestorGroupsMock.mockClear();
    getSvgLocalizedNodeMock.mockClear();
    isSvgBoxModelShapeNodeMock.mockClear();
    updateSvgAncestorGroupStackMock.mockReset();
    updateSvgAncestorGroupStackMock.mockImplementation((_elements: string[], _openGroups: unknown[], groups: unknown[]) => groups);
    getSvgLocalizedNodeMock.mockImplementation((node: unknown) => node);
  });

  it('should update the ancestor group stack using the layer own required groups and return the new stack', async () => {
    const requiredGroups = [{ id: 'a', markup: '<g>' }];

    getSvgLayerAncestorGroupsMock.mockReturnValue(requiredGroups);

    const elements: string[] = [];
    const openGroups = [{ id: 'old', markup: '<g>' }];

    const result = await drawSvgLayer(elements, [], { node: rectNode, type: SvgLayerType.vector } as never, context, openGroups, new Map());

    expect(getSvgLayerAncestorGroupsMock).toHaveBeenCalledWith(
      { node: rectNode, type: SvgLayerType.vector },
      context.nodesById,
      context.bounds,
    );
    expect(updateSvgAncestorGroupStackMock).toHaveBeenCalledWith(elements, openGroups, requiredGroups);
    expect(result).toBe(requiredGroups);
  });

  it('should draw a text layer as real text using its localized geometry', async () => {
    isSvgBoxModelShapeNodeMock.mockReturnValue(true);
    getSvgLayerAncestorGroupsMock.mockReturnValue([]);

    const elements: string[] = [];

    await drawSvgLayer(elements, [], { node: textNode, type: SvgLayerType.text } as never, context, [], new Map());

    expect(drawSvgTextNodeMock).toHaveBeenCalledWith(elements, textNode, context.nodesById, context.bounds);
    expect(drawSvgShapeMock).not.toHaveBeenCalled();
  });

  it('should draw a text-curves layer via the vector curves drawer', async () => {
    getSvgLayerAncestorGroupsMock.mockReturnValue([]);

    const elements: string[] = [];
    const defs: string[] = [];

    await drawSvgLayer(elements, defs, { node: textNode, type: SvgLayerType.textCurves } as never, context, [], new Map());

    expect(drawSvgTextCurvesMock).toHaveBeenCalledWith(elements, defs, textNode, context.nodesById, context.bounds);
  });

  it('should localize a box-model vector layer node before drawing, but not a baked-geometry one', async () => {
    getSvgLayerAncestorGroupsMock.mockReturnValue([]);

    const localizedRect = { ...rectNode, x: 999 };

    isSvgBoxModelShapeNodeMock.mockReturnValueOnce(true);
    getSvgLocalizedNodeMock.mockReturnValueOnce(localizedRect);

    await drawSvgLayer([], [], { node: rectNode, type: SvgLayerType.vector } as never, context, [], new Map());

    expect(drawSvgShapeMock).toHaveBeenCalledWith([], [], localizedRect, context.nodesById, context.bounds);

    drawSvgShapeMock.mockClear();
    isSvgBoxModelShapeNodeMock.mockReturnValueOnce(false);

    await drawSvgLayer([], [], { node: lineNode, type: SvgLayerType.vector } as never, context, [], new Map());

    expect(drawSvgShapeMock).toHaveBeenCalledWith([], [], lineNode, context.nodesById, context.bounds);
  });

  it('should embed a raster layer using the raster-specific context fields', async () => {
    getSvgLayerAncestorGroupsMock.mockReturnValue([]);

    const contextIds = ['a'];
    const elements: string[] = [];

    await drawSvgLayer(elements, [], { contextIds, nodeIds: new Set(['a']), type: SvgLayerType.raster } as never, context, [], new Map());

    expect(embedSvgRasterLayerMock).toHaveBeenCalledWith(
      elements,
      context.nodeId,
      context.rasterScale,
      context.ignoreOverlappingLayers,
      context.imageResampling,
      contextIds,
      context.bounds,
      context.isSoleRasterLayer,
      context.jpegQuality,
    );
  });

  it('should wrap the layer markup in a <g id> when includeIdAttribute is on and the layer is not raster', async () => {
    getSvgLayerAncestorGroupsMock.mockReturnValue([]);
    getSvgElementIdMock.mockReturnValue('Rect');

    const elements: string[] = [];
    const usedIds = new Map<string, number>();

    await drawSvgLayer(
      elements,
      [],
      { node: rectNode, type: SvgLayerType.vector } as never,
      { ...context, includeIdAttribute: true },
      [],
      usedIds,
    );

    expect(getSvgElementIdMock).toHaveBeenCalledWith(rectNode, usedIds);
    expect(elements).toEqual(['<g id="Rect">', '</g>']);
  });

  it('should never add an id wrapper around a raster layer, even when includeIdAttribute is on', async () => {
    getSvgLayerAncestorGroupsMock.mockReturnValue([]);

    const elements: string[] = [];

    await drawSvgLayer(
      elements,
      [],
      { nodeIds: new Set(['a']), type: SvgLayerType.raster } as never,
      { ...context, includeIdAttribute: true },
      [],
      new Map(),
    );

    expect(getSvgElementIdMock).not.toHaveBeenCalled();
    expect(elements).toEqual([]);
  });
});
