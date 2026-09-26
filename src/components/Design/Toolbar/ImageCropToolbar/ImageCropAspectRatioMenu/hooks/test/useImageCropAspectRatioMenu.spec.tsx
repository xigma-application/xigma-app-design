import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { useImageCropAspectRatioMenu } from '../useImageCropAspectRatioMenu';

// store
import { addNode, setImageEditor, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint } from 'types/design/paint/types';

const renderUseImageCropAspectRatioMenu = (): ReturnType<typeof renderHook<ReturnType<typeof useImageCropAspectRatioMenu>, unknown>> =>
  renderHook(() => useImageCropAspectRatioMenu(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

const addImageRectNode = (paint: TImagePaint): string => {
  store.dispatch(
    addNode({
      fills: [paint],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 200,
      x: 0,
      y: 50,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TImageFrameNode => selectActivePage(store.getState()).nodes[id] as TImageFrameNode;

describe('useImageCropAspectRatioMenu', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
  });

  it('should report every preset inactive when there is no crop target', () => {
    const { result } = renderUseImageCropAspectRatioMenu();

    expect(result.current.isPresetActive('original')).toBe(false);
    expect(result.current.isPresetActive({ ratioHeight: 1, ratioWidth: 1 })).toBe(false);
  });

  it('should report a preset active once the node already matches it, and commit a new preset on select', () => {
    // mock — a 200x100 node with no crop yet: a 1:1 preset fits to 100x100, not the current 200x100
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0 }));

    const { result } = renderUseImageCropAspectRatioMenu();

    expect(result.current.isPresetActive({ ratioHeight: 1, ratioWidth: 1 })).toBe(false);

    // action
    act(() => result.current.onSelectPreset({ ratioHeight: 1, ratioWidth: 1 }));

    // result — the node now matches the 1:1 preset it was just set to
    expect(readNode(id)).toMatchObject({ height: 100, width: 100, x: 50, y: 50 });

    const { result: afterResult } = renderUseImageCropAspectRatioMenu();

    expect(afterResult.current.isPresetActive({ ratioHeight: 1, ratioWidth: 1 })).toBe(true);
  });

  it('should report Custom as active only when no preset matches the current node', () => {
    // mock — a 200x100 node: none of the fixed presets match this shape
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0 }));

    const { result } = renderUseImageCropAspectRatioMenu();

    expect(result.current.isCustomActive).toBe(true);

    // action — commit the Square preset
    act(() => result.current.onSelectPreset({ ratioHeight: 1, ratioWidth: 1 }));

    // result — the node now matches a real preset, so Custom is no longer active
    const { result: afterResult } = renderUseImageCropAspectRatioMenu();

    expect(afterResult.current.isCustomActive).toBe(false);
  });

  it('should report Custom as inactive when there is no crop target at all', () => {
    const { result } = renderUseImageCropAspectRatioMenu();

    expect(result.current.isCustomActive).toBe(false);
  });
});
