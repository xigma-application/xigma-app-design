import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useHandleCropClick } from '../useHandleCropClick';

// store
import { addNode, setImageEditor, setImageFillPickerFocus, setSelectedFillIndices, setSelection } from 'store/design/slice';
import { selectActivePage, selectImageEditor, selectSelectedFillIndices } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseHandleCropClick = (): ReturnType<typeof renderHook<ReturnType<typeof useHandleCropClick>, unknown>> =>
  renderHook(() => useHandleCropClick(), { wrapper });

const solid: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
const imageWithoutCrop: TPaint = { opacity: 100, ref: '', rotation: 0, scaleMode: 'fill', type: 'image' };
const existingCrop = { height: 40, rotation: 0, width: 40, x: 5, y: 5 };
const imageWithCrop: TPaint = { ...imageWithoutCrop, crop: existingCrop };

const addRectangle = (fills: TPaint[]): string => {
  store.dispatch(
    addNode({ fills, height: 100, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 150, x: 10, y: 20 }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([id]));

  return id;
};

const readFills = (id: string): TPaint[] => (selectActivePage(store.getState()).nodes[id] as TRectangleNode).fills;

describe('useHandleCropClick', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setSelectedFillIndices([]));
    store.dispatch(setImageEditor(null));
    store.dispatch(setImageFillPickerFocus(null));
  });

  it('(a) should target the first image fill from the top when no fill row is selected', () => {
    const id = addRectangle([solid, imageWithoutCrop]);
    const { result } = renderUseHandleCropClick();

    act(() => result.current());

    expect(selectImageEditor(store.getState())).toMatchObject({ mode: 'crop', nodeId: id, paintIndex: 1 });
  });

  it('should select the targeted fill row in the panel to match the crop target', () => {
    const id = addRectangle([solid, imageWithoutCrop]);
    const { result } = renderUseHandleCropClick();

    act(() => result.current());

    expect(selectImageEditor(store.getState())).toMatchObject({ nodeId: id, paintIndex: 1 });
    expect(selectSelectedFillIndices(store.getState())).toEqual([1]);
  });

  it('(c) should select the fallback image fill row, replacing a selection that had no image fill', () => {
    addRectangle([solid, imageWithoutCrop]);

    store.dispatch(setSelectedFillIndices([0]));

    const { result } = renderUseHandleCropClick();

    act(() => result.current());

    expect(selectSelectedFillIndices(store.getState())).toEqual([1]);
  });

  it('(a) should seed a crop rect when the target image fill had none', () => {
    const id = addRectangle([imageWithoutCrop]);
    const { result } = renderUseHandleCropClick();

    act(() => result.current());

    expect((readFills(id)[0] as typeof imageWithCrop).crop).toBeTruthy();
  });

  it('(a) should not reset an already-set crop, only enter edit mode', () => {
    const id = addRectangle([imageWithCrop]);
    const { result } = renderUseHandleCropClick();

    act(() => result.current());

    expect((readFills(id)[0] as typeof imageWithCrop).crop).toEqual(existingCrop);
    expect(selectImageEditor(store.getState())).toMatchObject({ mode: 'crop', nodeId: id, paintIndex: 0 });
  });

  it('(b) should target the selected fill when it is the image one, even with several image fills', () => {
    const id = addRectangle([imageWithoutCrop, solid, imageWithCrop]);

    store.dispatch(setSelectedFillIndices([2]));

    const { result } = renderUseHandleCropClick();

    act(() => result.current());

    expect(selectImageEditor(store.getState())).toMatchObject({ mode: 'crop', nodeId: id, paintIndex: 2 });
  });

  it('(c) should fall back to the first image fill when the selected fill is not an image', () => {
    const id = addRectangle([solid, imageWithoutCrop]);

    store.dispatch(setSelectedFillIndices([0]));

    const { result } = renderUseHandleCropClick();

    act(() => result.current());

    expect(selectImageEditor(store.getState())).toMatchObject({ mode: 'crop', nodeId: id, paintIndex: 1 });
  });

  it('(d) should target the fill row whose picker is currently open, even though it is not the "selected" fill row (regression: opening a fill row picker and its selectedFillIndices state are decoupled, so Crop fell back to fill 0 instead)', () => {
    const id = addRectangle([imageWithoutCrop, solid, imageWithCrop]);

    store.dispatch(setImageFillPickerFocus({ nodeId: id, paintIndex: 2 }));

    const { result } = renderUseHandleCropClick();

    act(() => result.current());

    expect(selectImageEditor(store.getState())).toMatchObject({ mode: 'crop', nodeId: id, paintIndex: 2 });
  });

  it('(d) should prefer the open picker fill over an explicitly selected different fill', () => {
    const id = addRectangle([imageWithoutCrop, solid, imageWithCrop]);

    store.dispatch(setSelectedFillIndices([0]));
    store.dispatch(setImageFillPickerFocus({ nodeId: id, paintIndex: 2 }));

    const { result } = renderUseHandleCropClick();

    act(() => result.current());

    expect(selectImageEditor(store.getState())).toMatchObject({ mode: 'crop', nodeId: id, paintIndex: 2 });
  });

  it('(d) should ignore an open picker focus that belongs to a different node', () => {
    const id = addRectangle([solid, imageWithoutCrop]);

    store.dispatch(setImageFillPickerFocus({ nodeId: 'some-other-node', paintIndex: 0 }));

    const { result } = renderUseHandleCropClick();

    act(() => result.current());

    expect(selectImageEditor(store.getState())).toMatchObject({ mode: 'crop', nodeId: id, paintIndex: 1 });
  });

  it('should do nothing when no appearance node is selected', () => {
    store.dispatch(setSelection([]));

    const { result } = renderUseHandleCropClick();

    act(() => result.current());

    expect(selectImageEditor(store.getState())).toBeNull();
  });

  it('should not enter crop mode when the shape has no image fill, and should enter it for an ellipse', () => {
    // mock
    addRectangle([solid]);

    const { result } = renderUseHandleCropClick();

    // action
    act(() => result.current());

    // result
    expect(selectImageEditor(store.getState())).toBeNull();

    // mock
    store.dispatch(
      addNode({
        fills: [imageWithoutCrop],
        height: 50,
        name: 'Ellipse',
        parentId: null,
        rotation: 0,
        type: NodeType.ellipse,
        width: 50,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const ellipseId = rootOrder[rootOrder.length - 1];

    store.dispatch(setSelection([ellipseId]));

    const ellipse = renderUseHandleCropClick();

    // action
    act(() => ellipse.result.current());

    // result
    expect(selectImageEditor(store.getState())).toMatchObject({ mode: 'crop', nodeId: ellipseId, paintIndex: 0 });
  });
});
