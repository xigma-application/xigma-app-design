// store
import { addNode, setImageEditor } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { selectSelectedImageCrop } from '../selectSelectedImageCrop';

const addImageRectNode = (paint: TImagePaint, size = 40): string => {
  store.dispatch(
    addNode({
      fills: [paint],
      height: size,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: size,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('selectSelectedImageCrop', () => {
  beforeEach(() => {
    store.dispatch(setImageEditor(null));
  });

  it('should return undefined when there is no active image editor', () => {
    expect(selectSelectedImageCrop(store.getState())).toBeUndefined();
  });

  it('should return undefined when the frame/shape, not the image, is the selected target', () => {
    // mock
    const id = addImageRectNode({ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' });

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0, selectedTarget: 'frame' }));

    // result
    expect(selectSelectedImageCrop(store.getState())).toBeUndefined();
  });

  it('should return the stored crop, node and paint index when the image is the selected target', () => {
    // mock
    const crop = { height: 30, rotation: 15, width: 40, x: 5, y: 6 };
    const id = addImageRectNode({ crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' });

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0, selectedTarget: 'image' }));

    // result
    const result = selectSelectedImageCrop(store.getState());

    expect(result?.crop).toEqual(crop);
    expect(result?.node.id).toBe(id);
    expect(result?.paint.ref).toBe('image-1');
    expect(result?.paintIndex).toBe(0);
  });

  it('should seed a crop from the node bounds when the paint has none stored yet', () => {
    // mock
    const id = addImageRectNode({ opacity: 100, ref: 'uncached-image', rotation: 0, scaleMode: 'fill', type: 'image' }, 40);

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0, selectedTarget: 'image' }));

    // result
    const result = selectSelectedImageCrop(store.getState());

    expect(result?.crop).toEqual({ height: 40, rotation: 0, width: 40, x: 0, y: 0 });
  });

  it('should return the exact same object reference for repeated calls against the same state (regression: an unmemoized object literal made react-redux warn "returned a different result when called with the same parameters" the instant the image became the selected target, since every consumer — ColumnPosition, ColumnRotation, ColumnDimensions — got its own fresh object that same render)', () => {
    // mock
    const id = addImageRectNode({ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' });

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0, selectedTarget: 'image' }));

    const state = store.getState();

    // result
    expect(selectSelectedImageCrop(state)).toBe(selectSelectedImageCrop(state));
  });

  it('should recompute (a new reference) once the underlying image editor state actually changes', () => {
    // mock
    const id = addImageRectNode({ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' });

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0, selectedTarget: 'image' }));
    const first = selectSelectedImageCrop(store.getState());

    // action
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0, selectedTarget: 'frame' }));
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0, selectedTarget: 'image' }));

    // result
    expect(selectSelectedImageCrop(store.getState())).not.toBe(first);
  });

  it('should return the crop of an ellipse video fill and nothing for a missing node or a paint without an image', () => {
    // mock
    store.dispatch(
      addNode({
        fills: [
          { opacity: 100, ref: 'video-1', rotation: 0, scaleMode: 'fill', type: 'video' },
          { color: '#000000', opacity: 100, type: 'solid' },
        ],
        height: 40,
        name: 'Ellipse',
        parentId: null,
        rotation: 0,
        type: NodeType.ellipse,
        width: 40,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const id = rootOrder[rootOrder.length - 1];
    const read = (nodeId: string, paintIndex: number): unknown => {
      store.dispatch(setImageEditor({ mode: 'crop', nodeId, paintIndex, selectedTarget: 'image' }));

      return selectSelectedImageCrop(store.getState());
    };

    // result
    expect(read(id, 0)).toMatchObject({ paintIndex: 0 });
    expect(read(id, 1)).toBeUndefined();
    expect(read('missing', 0)).toBeUndefined();
  });
});
