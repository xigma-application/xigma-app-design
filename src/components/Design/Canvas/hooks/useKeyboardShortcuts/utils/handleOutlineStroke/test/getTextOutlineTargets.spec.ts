// types
import { NodeType } from 'types/design/enums';
import { TTextNode, TVectorNode } from 'types/design/types';

const { getTextOutlineAsStrokeVector } = vi.hoisted(() => ({ getTextOutlineAsStrokeVector: vi.fn() }));

vi.mock('utils/canvas/text/fontOutline/getTextOutlineAsStrokeVector', () => ({ getTextOutlineAsStrokeVector }));

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// utils
import { getTextOutlineTargets } from '../getTextOutlineTargets';

const buildOutline = (): TVectorNode => ({
  fillColor: '#000000',
  filledFaceKeys: [],
  id: 'outline',
  name: 'Text outline',
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

  it('should return a target for each selected stroked text node with a resolvable outline', async () => {
    // mock
    const id = addSelectedText();
    getTextOutlineAsStrokeVector.mockResolvedValue(buildOutline());

    // action
    const targets = await getTextOutlineTargets();

    // result
    expect(targets).toHaveLength(1);
    expect(targets[0].node.id).toBe(id);
    expect(targets[0].outline.type).toBe(NodeType.vector);
  });

  it('should drop a text node whose outline could not be built', async () => {
    // mock
    addSelectedText();
    getTextOutlineAsStrokeVector.mockResolvedValue(null);

    // action
    const targets = await getTextOutlineTargets();

    // result
    expect(targets).toEqual([]);
  });

  it('should ignore text bound to a path', async () => {
    // mock
    addSelectedText({ pathId: 'path-1' });
    getTextOutlineAsStrokeVector.mockResolvedValue(buildOutline());

    // action
    const targets = await getTextOutlineTargets();

    // result
    expect(targets).toEqual([]);
  });

  it('should ignore text with no stroke set', async () => {
    // mock
    addSelectedText({ strokeColor: undefined, strokeWidth: undefined });
    getTextOutlineAsStrokeVector.mockResolvedValue(buildOutline());

    // action
    const targets = await getTextOutlineTargets();

    // result
    expect(targets).toEqual([]);
  });
});
