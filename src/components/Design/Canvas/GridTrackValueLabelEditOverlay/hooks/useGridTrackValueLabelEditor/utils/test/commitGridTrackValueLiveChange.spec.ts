// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TGridTrackValueEditTarget } from 'utils/canvas/gridSlots/getGridTrackValueEditTarget';

// utils
import { commitGridTrackValueLiveChange } from '../commitGridTrackValueLiveChange';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const getGridTrackValueEditGeometryMock = vi.fn();

vi.mock('utils/canvas/gridSlots/getGridTrackValueEditGeometry', () => ({
  getGridTrackValueEditGeometry: (...args: unknown[]): unknown => getGridTrackValueEditGeometryMock(...args),
}));

const GEOMETRY = { badgeHeight: 24, badgeWidth: 40, center: { x: 5, y: 5 } };

const addFrame = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      gridColumnCount: 2,
      height: 200,
      layoutMode: LayoutMode.grid,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 400,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const editFor = (frameId: string): TGridTrackValueEditTarget => ({
  axis: 'column',
  badgeHeight: 24,
  badgeWidth: 40,
  center: { x: 0, y: 0 },
  frameId,
  index: 0,
  pillCenter: { x: 0, y: 0 },
  value: '',
});

describe('commitGridTrackValueLiveChange', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    getGridTrackValueEditGeometryMock.mockReset().mockReturnValue(GEOMETRY);
  });

  it('should merge the resolved geometry into the edit target', () => {
    // mock
    const frameId = addFrame();
    const refs = createCanvasRefs();

    // action
    const result = commitGridTrackValueLiveChange(refs, store.getState(), editFor(frameId), '3fr');

    // result
    expect(result).toEqual({ ...editFor(frameId), ...GEOMETRY });
  });

  it('should update the hover ref with the axis, frame, index and typed text', () => {
    // mock
    const frameId = addFrame();
    const refs = createCanvasRefs();

    // action
    commitGridTrackValueLiveChange(refs, store.getState(), editFor(frameId), '3fr');

    // result
    expect(refs.hover.editingGridTrackValueRef.current).toEqual({ axis: 'column', frameId, index: 0, text: '3fr' });
  });

  it('should keep the edit target unchanged when the frame no longer exists', () => {
    // mock
    const refs = createCanvasRefs();
    const edit = editFor('gone');

    // action
    const result = commitGridTrackValueLiveChange(refs, store.getState(), edit, '3fr');

    // result
    expect(result).toBe(edit);
  });

  it('should keep the edit target unchanged when the geometry cannot be resolved', () => {
    // mock
    const frameId = addFrame();
    const refs = createCanvasRefs();
    getGridTrackValueEditGeometryMock.mockReturnValue(null);
    const edit = editFor(frameId);

    // action
    const result = commitGridTrackValueLiveChange(refs, store.getState(), edit, '3fr');

    // result
    expect(result).toBe(edit);
  });
});
