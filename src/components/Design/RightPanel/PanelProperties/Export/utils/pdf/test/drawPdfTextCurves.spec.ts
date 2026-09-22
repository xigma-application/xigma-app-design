import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { drawPdfTextCurves } from '../drawPdfTextCurves';

const getTextFlattenVectorMock = vi.fn();
const getRenderedVectorNodeMock = vi.fn();
const getEffectiveOpacityMock = vi.fn();
const drawPdfVectorFillsMock = vi.fn();

vi.mock('utils/canvas/text/fontOutline/getTextFlattenVector', () => ({
  getTextFlattenVector: (...args: unknown[]): unknown => getTextFlattenVectorMock(...args),
}));
vi.mock('utils/canvas/render/getRenderedVectorNode', () => ({
  getRenderedVectorNode: (...args: unknown[]): unknown => getRenderedVectorNodeMock(...args),
}));
vi.mock('components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity', () => ({
  getEffectiveOpacity: (...args: unknown[]): unknown => getEffectiveOpacityMock(...args),
}));
vi.mock('../drawPdfVectorFills', () => ({ drawPdfVectorFills: (...args: unknown[]): void => drawPdfVectorFillsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

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

describe('drawPdfTextCurves', () => {
  beforeEach(() => {
    getTextFlattenVectorMock.mockReset();
    getRenderedVectorNodeMock.mockReset();
    getEffectiveOpacityMock.mockReset();
    drawPdfVectorFillsMock.mockClear();
  });

  it('should flatten the glyphs along the resolved path and draw the resulting fills', async () => {
    // mock
    const vector = { id: 'flattened' };
    const rendered = { id: 'rendered' };

    getTextFlattenVectorMock.mockResolvedValue(vector);
    getRenderedVectorNodeMock.mockReturnValue(rendered);
    getEffectiveOpacityMock.mockReturnValue(0.5);

    // action
    await drawPdfTextCurves(page, textNode, nodesById, bounds, states);

    // result
    expect(getTextFlattenVectorMock).toHaveBeenCalledWith(expect.any(Object), textNode, pathNode);
    expect(getRenderedVectorNodeMock).toHaveBeenCalledWith(vector);
    expect(getEffectiveOpacityMock).toHaveBeenCalledWith(textNode, nodesById);
    expect(drawPdfVectorFillsMock).toHaveBeenCalledWith(page, rendered, 0.5, bounds, states);
  });

  it('should draw nothing when the path node cannot be resolved and flattening returns null', async () => {
    // mock
    getTextFlattenVectorMock.mockResolvedValue(null);

    // action
    await drawPdfTextCurves(page, { ...textNode, pathId: 'missing' }, nodesById, bounds, states);

    // result
    expect(getTextFlattenVectorMock).toHaveBeenCalledWith(expect.any(Object), { ...textNode, pathId: 'missing' }, undefined);
    expect(drawPdfVectorFillsMock).not.toHaveBeenCalled();
  });

  it('should pass no path node when the text has no pathId at all', async () => {
    // mock
    getTextFlattenVectorMock.mockResolvedValue(null);

    // action
    await drawPdfTextCurves(page, { ...textNode, pathId: null }, nodesById, bounds, states);

    // result
    expect(getTextFlattenVectorMock).toHaveBeenCalledWith(expect.any(Object), { ...textNode, pathId: null }, undefined);
  });
});
