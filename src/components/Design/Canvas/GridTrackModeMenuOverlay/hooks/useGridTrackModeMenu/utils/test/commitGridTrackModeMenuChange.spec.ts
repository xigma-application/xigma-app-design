// store
import { addNode, deleteNode, setGridTrackSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TGridTrackModeMenuTarget } from 'utils/canvas/gridSlots/getGridTrackModeMenuTarget';

// utils
import { commitGridTrackModeMenuChange } from '../commitGridTrackModeMenuChange';

const addFrame = (gridColumnSizes?: { mode: SizingMode; value?: number }[]): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      gridColumnCount: gridColumnSizes?.length ?? 2,
      gridColumnSizes,
      height: 200,
      layoutMode: LayoutMode.grid,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 400,
      x: 0,
      y: 0,
    } as never),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const targetFor = (frameId: string, index = 0, resolvedSize = 40): TGridTrackModeMenuTarget => ({
  anchor: { x: 0, y: 0 },
  axis: 'column',
  frameId,
  index,
  mode: SizingMode.fixed,
  resolvedSize,
  trackValue: 1,
});

describe('commitGridTrackModeMenuChange', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setGridTrackSelection(null));
  });

  it('should switch the track to the picked mode, seeding the rounded resolved size when switching to fixed', () => {
    const frameId = addFrame([
      { mode: SizingMode.fill, value: 1 },
      { mode: SizingMode.fixed, value: 60 },
    ]);

    commitGridTrackModeMenuChange(store.dispatch, store.getState(), targetFor(frameId, 0, 123.456), SizingMode.fixed);

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [
        { mode: SizingMode.fixed, value: 123.46 },
        { mode: SizingMode.fixed, value: 60 },
      ],
    });
  });

  it('should seed a fill weight of 1 when switching to fill', () => {
    const frameId = addFrame([{ mode: SizingMode.fixed, value: 40 }]);

    commitGridTrackModeMenuChange(store.dispatch, store.getState(), targetFor(frameId), SizingMode.fill);

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [{ mode: SizingMode.fill, value: 1 }],
    });
  });

  it('should switch to hug without needing a resolved size', () => {
    const frameId = addFrame([{ mode: SizingMode.fixed, value: 40 }]);

    commitGridTrackModeMenuChange(store.dispatch, store.getState(), targetFor(frameId), SizingMode.hug);

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [{ mode: SizingMode.hug, value: 40 }],
    });
  });

  it('should apply the picked mode to every track in a matching multi-selection, not just the one clicked', () => {
    const frameId = addFrame([
      { mode: SizingMode.fixed, value: 40 },
      { mode: SizingMode.fixed, value: 60 },
      { mode: SizingMode.fixed, value: 80 },
    ]);
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId, indices: [0, 2] }));

    commitGridTrackModeMenuChange(store.dispatch, store.getState(), targetFor(frameId, 0), SizingMode.hug);

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [
        { mode: SizingMode.hug, value: 40 },
        { mode: SizingMode.fixed, value: 60 },
        { mode: SizingMode.hug, value: 80 },
      ],
    });
  });

  it('should ignore a selection that belongs to a different frame or axis', () => {
    const frameId = addFrame([
      { mode: SizingMode.fixed, value: 40 },
      { mode: SizingMode.fixed, value: 60 },
    ]);
    store.dispatch(setGridTrackSelection({ axis: 'row', frameId, indices: [0, 1] }));

    commitGridTrackModeMenuChange(store.dispatch, store.getState(), targetFor(frameId, 0), SizingMode.hug);

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [
        { mode: SizingMode.hug, value: 40 },
        { mode: SizingMode.fixed, value: 60 },
      ],
    });
  });

  it('should be a no-op when the target frame no longer exists', () => {
    expect(() => commitGridTrackModeMenuChange(store.dispatch, store.getState(), targetFor('gone'), SizingMode.hug)).not.toThrow();
  });
});
