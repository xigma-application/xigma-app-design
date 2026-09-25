// store
import { addNodes, moveNodes } from 'store/design/slice';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { commitGroupDrop } from '../commitGroupDrop';

const applyGridDropMock = vi.fn();
const applyGridInsertMock = vi.fn();
const fillSizeMock = vi.fn();
const autoInsertIndexMock = vi.fn(() => 3);
const resolveIndexMock = vi.fn(() => 0);

vi.mock('../applyGridDrop', () => ({ applyGridDrop: (...args: unknown[]): unknown => applyGridDropMock(...args) }));
vi.mock('../applyGridInsert', () => ({ applyGridInsert: (...args: unknown[]): unknown => applyGridInsertMock(...args) }));
vi.mock('../fillSizeNodesForGridAutoInsert', () => ({
  fillSizeNodesForGridAutoInsert: (...args: unknown[]): unknown => fillSizeMock(...args),
}));
vi.mock('../getGridAutoInsertIndex', () => ({
  getGridAutoInsertIndex: (...args: unknown[]): unknown => autoInsertIndexMock(...(args as [])),
}));
vi.mock('../resolveDropTargetIndex', () => ({
  resolveDropTargetIndex: (...args: unknown[]): unknown => resolveIndexMock(...(args as [])),
}));
vi.mock('../../../getDropNodeOrder', () => ({ getDropNodeOrder: (ids: string[]): string[] => ids }));

const node = (id: string, type: NodeType, parentId: string | null, extra: object = {}): TSceneNode =>
  ({ childIds: [], id, name: id, parentId, type, ...extra }) as unknown as TSceneNode;

type TRefs = { dropTarget?: string | null; gridDropTarget?: unknown; indicator?: unknown; preview?: unknown };

const refs = ({ dropTarget = null, gridDropTarget = null, indicator = null, preview = null }: TRefs): TCanvasRefs =>
  ({
    transform: {
      autoLayoutDropTargetRef: { current: indicator },
      autoLayoutReorderPreviewRef: { current: preview },
      dropTargetFrameIdRef: { current: dropTarget },
      gridDropTargetRef: { current: gridDropTarget },
    },
  }) as unknown as TCanvasRefs;

const drop = (selectedIds: string[], options: TRefs): TFunc => {
  const dispatch = vi.fn();
  commitGroupDrop(dispatch, selectedIds, refs(options));
  return dispatch;
};

describe('commitGroupDrop', () => {
  beforeAll(() => {
    store.dispatch(
      addNodes({
        nodes: [
          node('cgd-frame', NodeType.frame, null, { childIds: ['cgd-child'] }),
          node('cgd-child', NodeType.rectangle, 'cgd-frame'),
          node('cgd-root', NodeType.rectangle, null),
          node('cgd-grid', NodeType.frame, null, { childIds: ['cgd-cell'], layoutMode: LayoutMode.grid }),
          node('cgd-cell', NodeType.rectangle, 'cgd-grid'),
          node('cgd-pinned', NodeType.frame, null, {
            childIds: ['cgd-pinned-cell'],
            gridAutoPlacement: false,
            layoutMode: LayoutMode.grid,
          }),
          node('cgd-pinned-cell', NodeType.rectangle, 'cgd-pinned'),
          node('cgd-section', NodeType.section, null),
          node('cgd-group', NodeType.group, null, { childIds: ['cgd-in-group'] }),
          node('cgd-in-group', NodeType.rectangle, 'cgd-group'),
        ],
        rootIds: ['cgd-frame', 'cgd-root', 'cgd-grid', 'cgd-pinned', 'cgd-section', 'cgd-group'],
      }),
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should drop a layer into a frame', () => {
    // result
    expect(drop(['cgd-root'], { dropTarget: 'cgd-frame' })).toHaveBeenCalledWith(
      moveNodes({ nodeIds: ['cgd-root'], targetIndex: 0, targetParentId: 'cgd-frame' }),
    );
    expect(applyGridDropMock).not.toHaveBeenCalled();
  });

  it('should drag a frame child out to the page, but keep a group child and a page layer where they are', () => {
    // result
    expect(drop(['cgd-child'], {})).toHaveBeenCalledWith(moveNodes({ nodeIds: ['cgd-child'], targetIndex: 0, targetParentId: null }));
    expect(drop(['cgd-in-group'], {})).not.toHaveBeenCalled();
    expect(drop(['cgd-root'], {})).not.toHaveBeenCalled();
    expect(drop(['cgd-missing'], { dropTarget: 'cgd-root' })).not.toHaveBeenCalled();
  });

  it('should reorder inside the same frame from a reorder preview or a drop indicator', () => {
    // result
    expect(drop(['cgd-child'], { dropTarget: 'cgd-frame', preview: { frameId: 'cgd-frame' } })).toHaveBeenCalled();
    expect(drop(['cgd-child'], { dropTarget: 'cgd-frame', indicator: { frameId: 'cgd-frame' } })).toHaveBeenCalled();
    expect(
      drop(['cgd-child'], { dropTarget: 'cgd-frame', indicator: { frameId: 'other' }, preview: { frameId: 'other' } }),
    ).not.toHaveBeenCalled();
  });

  it('should insert a new layer into an auto-placed grid at the auto insert index and fill-size it', () => {
    // before
    drop(['cgd-root'], { dropTarget: 'cgd-grid', gridDropTarget: { cells: [], frameId: 'cgd-grid' } });

    // result
    expect(autoInsertIndexMock).toHaveBeenCalled();
    expect(fillSizeMock).toHaveBeenCalledWith(expect.anything(), ['cgd-root']);
  });

  it('should insert into a pinned grid at the insert index, or drop onto the hovered cells', () => {
    // before
    drop(['cgd-root'], { dropTarget: 'cgd-pinned', gridDropTarget: { cells: [], frameId: 'cgd-pinned', insertIndex: 2 } });
    drop(['cgd-root'], { dropTarget: 'cgd-pinned', gridDropTarget: { cells: ['cell'], frameId: 'cgd-pinned' } });

    // result
    expect(applyGridInsertMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: 'cgd-pinned' }),
      expect.anything(),
      2,
      ['cgd-root'],
    );
    expect(applyGridDropMock).toHaveBeenCalledWith(expect.anything(), 'cgd-pinned', ['cell'], ['cgd-root']);
  });

  it('should reposition a child inside a pinned grid but not inside an auto-placed one', () => {
    // result
    expect(
      drop(['cgd-pinned-cell'], { dropTarget: 'cgd-pinned', gridDropTarget: { cells: ['cell'], frameId: 'cgd-pinned' } }),
    ).toHaveBeenCalled();
    expect(drop(['cgd-cell'], { dropTarget: 'cgd-grid', gridDropTarget: { cells: ['cell'], frameId: 'cgd-grid' } })).not.toHaveBeenCalled();
  });

  it('should drop onto the hovered cells of a non-frame container', () => {
    // before
    drop(['cgd-root'], { dropTarget: 'cgd-section', gridDropTarget: { cells: ['cell'], frameId: 'cgd-section', insertIndex: 1 } });

    // result
    expect(applyGridDropMock).toHaveBeenCalledWith(expect.anything(), 'cgd-section', ['cell'], ['cgd-root']);
  });

  it('should treat a drop target that is not a container as the page', () => {
    // result
    expect(drop(['cgd-child'], { dropTarget: 'cgd-root' })).toHaveBeenCalledWith(
      moveNodes({ nodeIds: ['cgd-child'], targetIndex: 0, targetParentId: null }),
    );
  });
});
