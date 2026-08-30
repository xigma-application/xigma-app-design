import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

// others
import { SECTION_NAME_LABEL_PADDING_Y_PX } from 'constant/canvas';

// hooks
import { getSectionNameLabelBadgeRect } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawSectionNameLabels/getSectionNameLabelBadgeRect';
import { getSectionNameLabelEditTarget } from '../getSectionNameLabelEditTarget';
import { TSectionNameLabelRect } from '../../../../utils/getSectionNameLabelRects';

// store
import designReducer, { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { RootState } from 'store';

// types
import { NodeType } from 'types/design/enums';

const getSectionNameLabelRectsMock = vi.fn();

vi.mock('../../../../utils/getSectionNameLabelRects', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../../utils/getSectionNameLabelRects')>()),
  getSectionNameLabelRects: (...args: unknown[]): unknown => getSectionNameLabelRectsMock(...args),
}));

const createTestStore = (): EnhancedStore<RootState> => configureStore({ reducer: { design: designReducer } });

const addSection = (store: EnhancedStore<RootState>, overrides: { hidden?: boolean } = {}): { id: string; name: string } => {
  store.dispatch(
    addNode({
      fill: '#444444',
      height: 100,
      hidden: overrides.hidden,
      name: 'Section',
      parentId: null,
      rotation: 0,
      type: NodeType.section,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { nodes, rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  return { id, name: nodes[id].name };
};

const rectFor = (nodeId: string): TSectionNameLabelRect => ({ height: 24, nodeId, width: 60, x: 0, y: -30 });

describe('getSectionNameLabelEditTarget', () => {
  beforeEach(() => {
    getSectionNameLabelRectsMock.mockReset().mockReturnValue([]);
  });

  it('should return the target seeded with the hit node’s current name, positioned off the real badge geometry', () => {
    // mock
    const store = createTestStore();
    const section = addSection(store);

    getSectionNameLabelRectsMock.mockReturnValue([rectFor(section.id)]);

    // result
    const target = getSectionNameLabelEditTarget({ x: 30, y: -20 }, store.getState());

    // left is the badge's raw left edge (x=0, matching the section's own x), and height is the
    // bare text height (badge height minus its own vertical padding) — the input's own CSS padding
    // is what visually insets both, not these values, or the padding would apply twice
    const node = selectActivePage(store.getState()).nodes[section.id];
    const badge = node.type === NodeType.section ? getSectionNameLabelBadgeRect(node, 1) : null;

    expect(target).toMatchObject({ left: 0, nodeId: section.id, value: section.name });
    expect(target?.height).toBeCloseTo((badge?.height ?? 0) - SECTION_NAME_LABEL_PADDING_Y_PX * 2, 5);
  });

  it('should exclude hidden sections from hit-testing', () => {
    // mock
    const store = createTestStore();

    addSection(store, { hidden: true });

    // before
    getSectionNameLabelEditTarget({ x: 30, y: -20 }, store.getState());

    // result — the hidden section never even reaches the rect builder
    expect(getSectionNameLabelRectsMock).toHaveBeenCalledWith([], expect.any(Number));
  });

  it('should return null when no label rect is hit', () => {
    // mock
    const store = createTestStore();

    addSection(store);

    // result
    expect(getSectionNameLabelEditTarget({ x: 500, y: 500 }, store.getState())).toBeNull();
  });

  it('should return null when the hit rect points at a node that no longer exists', () => {
    // mock
    const store = createTestStore();

    getSectionNameLabelRectsMock.mockReturnValue([rectFor('gone')]);

    // result
    expect(getSectionNameLabelEditTarget({ x: 30, y: -20 }, store.getState())).toBeNull();
  });

  it('should return null when the hit rect points at a node that is no longer a section', () => {
    // mock — a rectangle that happens to sit where a section's rect id would point
    const store = createTestStore();

    store.dispatch(
      addNode({
        fill: '#ffffff',
        height: 100,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 200,
        x: 0,
        y: 0,
      }),
    );

    const { nodes, rootOrder } = selectActivePage(store.getState());
    const id = rootOrder[rootOrder.length - 1];

    getSectionNameLabelRectsMock.mockReturnValue([rectFor(id)]);

    // result
    expect(getSectionNameLabelEditTarget({ x: 30, y: -20 }, store.getState())).toBeNull();
    expect(nodes[id].type).toBe(NodeType.rectangle);
  });
});
