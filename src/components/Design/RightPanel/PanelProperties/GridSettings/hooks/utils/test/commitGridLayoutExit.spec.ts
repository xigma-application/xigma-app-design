// store
import { setGridSettingsPanelOpen, updateNode } from 'store/design/slice';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { commitGridLayoutExit } from '../commitGridLayoutExit';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, setGridSettingsPanelOpen: vi.fn(actual.setGridSettingsPanelOpen), updateNode: vi.fn(actual.updateNode) };
});

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#fff',
    gridColumnCount: 1,
    height: 200,
    id: 'grid-1',
    layoutMode: LayoutMode.grid,
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 200,
    x: 0,
    y: 0,
    ...overrides,
  }) as TFrameNode;

const rect = (id: string, overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fill: '#000',
    height: 10,
    id,
    name: id,
    parentId: 'grid-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const byId = (nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

describe('commitGridLayoutExit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should clear the frame grid fields and switch it to free-form layout', () => {
    const dispatch = vi.fn();

    commitGridLayoutExit(dispatch, frame(), {});

    expect(updateNode).toHaveBeenCalledWith({
      changes: {
        gridAutoPlacement: undefined,
        gridColumnCount: undefined,
        gridColumnSizes: undefined,
        gridRowCount: undefined,
        gridRowSizes: undefined,
        layoutMode: LayoutMode.freeForm,
        layoutWrap: false,
      },
      id: 'grid-1',
    });
  });

  it('should clear grid placement fields on every child', () => {
    const dispatch = vi.fn();

    commitGridLayoutExit(dispatch, frame({ childIds: ['a', 'b'] }), {});

    expect(updateNode).toHaveBeenCalledWith({
      changes: {
        gridChildHorizontalAlign: undefined,
        gridChildVerticalAlign: undefined,
        gridColumnAnchorIndex: undefined,
        gridColumnSpan: undefined,
        gridRowAnchorIndex: undefined,
        gridRowSpan: undefined,
      },
      id: 'a',
    });
    expect(updateNode).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'b',
      }),
    );
  });

  it('should reset a fill-sized child back to fixed on both axes', () => {
    const dispatch = vi.fn();
    const nodes = byId([rect('a', { heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill })]);

    commitGridLayoutExit(dispatch, frame({ childIds: ['a'] }), nodes);

    expect(updateNode).toHaveBeenCalledWith({ changes: { widthSizingMode: SizingMode.fixed }, id: 'a' });
    expect(updateNode).toHaveBeenCalledWith({ changes: { heightSizingMode: SizingMode.fixed }, id: 'a' });
  });

  it('should not touch a child that is not fill-sized', () => {
    const dispatch = vi.fn();
    const nodes = byId([rect('a', { heightSizingMode: SizingMode.fixed, widthSizingMode: SizingMode.fixed })]);

    commitGridLayoutExit(dispatch, frame({ childIds: ['a'] }), nodes);

    expect(updateNode).not.toHaveBeenCalledWith(expect.objectContaining({ changes: { widthSizingMode: SizingMode.fixed } }));
    expect(updateNode).not.toHaveBeenCalledWith(expect.objectContaining({ changes: { heightSizingMode: SizingMode.fixed } }));
  });

  it('should close the grid settings panel', () => {
    const dispatch = vi.fn();

    commitGridLayoutExit(dispatch, frame(), {});

    expect(setGridSettingsPanelOpen).toHaveBeenCalledWith(false);
  });
});
