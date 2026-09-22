// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { drawSvgTextCurves } from '../drawSvgTextCurves';

const getTextFlattenVectorMock = vi.fn();
const getRenderedVectorNodeMock = vi.fn();
const getEffectiveOpacityMock = vi.fn();
const drawSvgVectorFillsMock = vi.fn();

vi.mock('utils/canvas/text/fontOutline/getTextFlattenVector', () => ({
  getTextFlattenVector: (...args: unknown[]): unknown => getTextFlattenVectorMock(...args),
}));
vi.mock('utils/canvas/render/getRenderedVectorNode', () => ({
  getRenderedVectorNode: (...args: unknown[]): unknown => getRenderedVectorNodeMock(...args),
}));
vi.mock('components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity', () => ({
  getEffectiveOpacity: (...args: unknown[]): unknown => getEffectiveOpacityMock(...args),
}));
vi.mock('../drawSvgVectorFills', () => ({ drawSvgVectorFills: (...args: unknown[]): void => drawSvgVectorFillsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const textNode: TTextNode = {
  content: 'abc',
  fill: '#000000',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 12,
  height: 10,
  id: 't',
  name: 't',
  parentId: null,
  pathId: 'p',
  rotation: 0,
  type: NodeType.text,
  width: 30,
  x: 0,
  y: 0,
};

const pathNode: TSceneNode = { ...textNode, id: 'p', pathId: null, type: NodeType.path } as never;
const nodesById: Record<string, TSceneNode> = { p: pathNode, t: textNode };

describe('drawSvgTextCurves', () => {
  beforeEach(() => {
    getTextFlattenVectorMock.mockReset();
    getRenderedVectorNodeMock.mockReset();
    getEffectiveOpacityMock.mockReset();
    drawSvgVectorFillsMock.mockClear();
  });

  it('should flatten the glyphs along the resolved path and draw the resulting fills', async () => {
    // mock
    const vector = { id: 'flattened' };
    const rendered = { id: 'rendered' };
    const elements: string[] = [];
    const defs: string[] = [];

    getTextFlattenVectorMock.mockResolvedValue(vector);
    getRenderedVectorNodeMock.mockReturnValue(rendered);
    getEffectiveOpacityMock.mockReturnValue(0.5);

    // action
    await drawSvgTextCurves(elements, defs, textNode, nodesById, bounds);

    // result
    expect(getTextFlattenVectorMock).toHaveBeenCalledWith(expect.any(Object), textNode, pathNode);
    expect(getRenderedVectorNodeMock).toHaveBeenCalledWith(vector);
    expect(getEffectiveOpacityMock).toHaveBeenCalledWith(textNode, nodesById);
    expect(drawSvgVectorFillsMock).toHaveBeenCalledWith(elements, defs, rendered, 0.5, bounds);
  });

  it('should draw nothing when the path node cannot be resolved and flattening returns null', async () => {
    // mock
    getTextFlattenVectorMock.mockResolvedValue(null);

    // action
    await drawSvgTextCurves([], [], { ...textNode, pathId: 'missing' }, nodesById, bounds);

    // result
    expect(getTextFlattenVectorMock).toHaveBeenCalledWith(expect.any(Object), { ...textNode, pathId: 'missing' }, undefined);
    expect(drawSvgVectorFillsMock).not.toHaveBeenCalled();
  });

  it('should pass no path node when the text has no pathId at all', async () => {
    // mock
    getTextFlattenVectorMock.mockResolvedValue(null);

    // action
    await drawSvgTextCurves([], [], { ...textNode, pathId: null }, nodesById, bounds);

    // result
    expect(getTextFlattenVectorMock).toHaveBeenCalledWith(expect.any(Object), { ...textNode, pathId: null }, undefined);
  });
});
