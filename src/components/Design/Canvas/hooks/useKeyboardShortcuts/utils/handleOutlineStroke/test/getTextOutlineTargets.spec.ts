// types
import { NodeType } from 'types/design/enums';
import { TTextNode, TVectorNode } from 'types/design/types';

const { getTextOutlineAsStrokeGlyphVectors } = vi.hoisted(() => ({ getTextOutlineAsStrokeGlyphVectors: vi.fn() }));

vi.mock('utils/canvas/text/fontOutline/getTextOutlineAsStrokeGlyphVectors', () => ({ getTextOutlineAsStrokeGlyphVectors }));

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// utils
import { getTextOutlineTargets } from '../getTextOutlineTargets';

const buildLetter = (): TVectorNode => ({
  fillColor: '#000000',
  filledFaceKeys: [],
  id: 'letter',
  name: 'Text',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
});

const addSelectedText = (overrides: Partial<TTextNode> = {}): string => {
  store.dispatch(
    addNode({
      content: 'Hi',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: 40,
      name: 'Text',
      parentId: null,
      rotation: 0,
      strokeColor: '#000000',
      strokeWidth: 4,
      type: NodeType.text,
      width: 200,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );
  const [id] = selectActivePage(store.getState()).rootOrder.slice(-1);
  store.dispatch(setSelection([id]));

  return id;
};

describe('getTextOutlineTargets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a target for each selected stroked text node with at least one resolvable letter', async () => {
    // mock
    const id = addSelectedText();
    getTextOutlineAsStrokeGlyphVectors.mockResolvedValue([buildLetter(), buildLetter()]);

    // action
    const targets = await getTextOutlineTargets();

    // result
    expect(targets).toHaveLength(1);
    expect(targets[0].node.id).toBe(id);
    expect(targets[0].letters).toHaveLength(2);
  });

  it('should drop a text node whose outline resolved to no letters at all', async () => {
    // mock
    addSelectedText();
    getTextOutlineAsStrokeGlyphVectors.mockResolvedValue([]);

    // action
    const targets = await getTextOutlineTargets();

    // result
    expect(targets).toEqual([]);
  });

  it('should still return a target for text with no stroke set at all — it just becomes per-letter flatten + group', async () => {
    // mock — there's no properties-panel UI to ever set a real stroke on text yet, so this must
    // stay available the same way Flatten always is
    const id = addSelectedText({ strokeColor: undefined, strokeWidth: undefined });

    getTextOutlineAsStrokeGlyphVectors.mockResolvedValue([buildLetter()]);

    // action
    const targets = await getTextOutlineTargets();

    // result
    expect(targets).toHaveLength(1);
    expect(targets[0].node.id).toBe(id);
  });

  it('should pass the bound path node through for a stroked text attached to a path', async () => {
    // mock — a resolvable path node the text is attached to via pathId
    store.dispatch(
      addNode({
        fillColor: null,
        filledFaceKeys: [],
        name: 'Path',
        parentId: null,
        rotation: 0,
        segments: {},
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: {},
      }),
    );
    const [pathId] = selectActivePage(store.getState()).rootOrder.slice(-1);

    addSelectedText({ pathId });
    getTextOutlineAsStrokeGlyphVectors.mockResolvedValue([buildLetter()]);

    // action
    const targets = await getTextOutlineTargets();

    // result
    expect(targets).toHaveLength(1);
    expect(getTextOutlineAsStrokeGlyphVectors).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ pathId }),
      expect.objectContaining({ id: pathId }),
    );
  });
});
