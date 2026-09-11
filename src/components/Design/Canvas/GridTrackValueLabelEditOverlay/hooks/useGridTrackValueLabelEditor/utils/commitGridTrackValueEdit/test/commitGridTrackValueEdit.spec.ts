// store
import { addNode, deleteNode, setGridTrackSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TGridTrackValueEditTarget } from 'utils/canvas/gridSlots/getGridTrackValueEditTarget';

// utils
import { commitGridTrackValueEdit } from '../commitGridTrackValueEdit';

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

const editFor = (frameId: string, index = 0): TGridTrackValueEditTarget => ({
  axis: 'column',
  badgeHeight: 24,
  badgeWidth: 40,
  center: { x: 0, y: 0 },
  frameId,
  index,
  pillCenter: { x: 0, y: 0 },
  value: '',
});

describe('commitGridTrackValueEdit', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setGridTrackSelection(null));
  });

  it('should commit a plain number on a fixed track', () => {
    const frameId = addFrame([
      { mode: SizingMode.fixed, value: 40 },
      { mode: SizingMode.fixed, value: 60 },
    ]);

    commitGridTrackValueEdit(store.dispatch, store.getState(), editFor(frameId), '80');

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [
        { mode: SizingMode.fixed, value: 80 },
        { mode: SizingMode.fixed, value: 60 },
      ],
    });
  });

  it('should not dispatch on a fixed track when the input has no parsable number', () => {
    const frameId = addFrame([{ mode: SizingMode.fixed, value: 40 }]);

    commitGridTrackValueEdit(store.dispatch, store.getState(), editFor(frameId), 'abc');

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [{ mode: SizingMode.fixed, value: 40 }],
    });
  });

  it('should switch a hug track to fixed at the typed number', () => {
    const frameId = addFrame([{ mode: SizingMode.hug }]);

    commitGridTrackValueEdit(store.dispatch, store.getState(), editFor(frameId), '120');

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [{ mode: SizingMode.fixed, value: 120 }],
    });
  });

  it('should keep a fill track on fill when the input matches "<number>fr"', () => {
    const frameId = addFrame([{ mode: SizingMode.fill, value: 1 }]);

    commitGridTrackValueEdit(store.dispatch, store.getState(), editFor(frameId), '3fr');

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [{ mode: SizingMode.fill, value: 3 }],
    });
  });

  it('should switch a fill track to fixed when the unit is dropped', () => {
    const frameId = addFrame([{ mode: SizingMode.fill, value: 1 }]);

    commitGridTrackValueEdit(store.dispatch, store.getState(), editFor(frameId), '90');

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [{ mode: SizingMode.fixed, value: 90 }],
    });
  });

  it('should not dispatch on a fill track for an unparsable input', () => {
    const frameId = addFrame([{ mode: SizingMode.fill, value: 1 }]);

    commitGridTrackValueEdit(store.dispatch, store.getState(), editFor(frameId), 'abc');

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [{ mode: SizingMode.fill, value: 1 }],
    });
  });

  it('should apply the committed value to every track in a matching multi-selection, not just the one edited', () => {
    const frameId = addFrame([
      { mode: SizingMode.fixed, value: 40 },
      { mode: SizingMode.fixed, value: 60 },
      { mode: SizingMode.fixed, value: 80 },
    ]);
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId, indices: [0, 2] }));

    commitGridTrackValueEdit(store.dispatch, store.getState(), editFor(frameId, 0), '100');

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [
        { mode: SizingMode.fixed, value: 100 },
        { mode: SizingMode.fixed, value: 60 },
        { mode: SizingMode.fixed, value: 100 },
      ],
    });
  });

  it('should ignore a selection that belongs to a different frame or axis', () => {
    const frameId = addFrame([
      { mode: SizingMode.fixed, value: 40 },
      { mode: SizingMode.fixed, value: 60 },
    ]);
    store.dispatch(setGridTrackSelection({ axis: 'row', frameId, indices: [0, 1] }));

    commitGridTrackValueEdit(store.dispatch, store.getState(), editFor(frameId, 0), '100');

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [
        { mode: SizingMode.fixed, value: 100 },
        { mode: SizingMode.fixed, value: 60 },
      ],
    });
  });

  it('should be a no-op when the edited frame no longer exists', () => {
    expect(() => commitGridTrackValueEdit(store.dispatch, store.getState(), editFor('gone'), '100')).not.toThrow();
  });

  it('should be a no-op when the edited index is out of range', () => {
    const frameId = addFrame([{ mode: SizingMode.fixed, value: 40 }]);

    expect(() => commitGridTrackValueEdit(store.dispatch, store.getState(), editFor(frameId, 5), '100')).not.toThrow();
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [{ mode: SizingMode.fixed, value: 40 }],
    });
  });
});
