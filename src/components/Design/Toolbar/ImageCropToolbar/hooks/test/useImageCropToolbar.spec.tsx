import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { useImageCropToolbar } from '../useImageCropToolbar';

// store
import { addNode, setImageEditor, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

const renderUseImageCropToolbar = (): ReturnType<typeof renderHook<ReturnType<typeof useImageCropToolbar>, unknown>> =>
  renderHook(() => useImageCropToolbar(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

const addImageRectNode = (paint: TImagePaint): string => {
  store.dispatch(
    addNode({
      fills: [paint],
      height: 200,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readCrop = (id: string): unknown => (selectActivePage(store.getState()).nodes[id] as { fills: TImagePaint[] }).fills[0].crop;

describe('useImageCropToolbar', () => {
  afterEach(() => {
    store.dispatch(setImageEditor(null));
    store.dispatch(setSelection([]));
    imagePaintTextureSizeCache.clear();
  });

  it('should stay hidden when there is no active image editor', () => {
    expect(renderUseImageCropToolbar().result.current.isVisible).toBe(false);
  });

  it('should stay hidden while the editor is active but not in crop mode', () => {
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'node-1', paintIndex: 0 }));

    expect(renderUseImageCropToolbar().result.current.isVisible).toBe(false);

    store.dispatch(setImageEditor({ mode: 'tile', nodeId: 'node-1', paintIndex: 0 }));

    expect(renderUseImageCropToolbar().result.current.isVisible).toBe(false);
  });

  it('should show up once crop mode is active', () => {
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'node-1', paintIndex: 0 }));

    expect(renderUseImageCropToolbar().result.current.isVisible).toBe(true);
  });

  it('should report a zoom of 0 when the image size has not loaded yet', () => {
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0 }));

    expect(renderUseImageCropToolbar().result.current.zoom).toBe(0);
  });

  it('should derive zoom from the real crop rect once the image size is loaded', () => {
    // mock — a 400x400 source image on the 200x200 node, crop already at the native size (100%)
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    const paint: TImagePaint = {
      crop: { height: 400, rotation: 0, width: 400, x: -100, y: -100 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };
    const id = addImageRectNode(paint);

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0 }));

    expect(renderUseImageCropToolbar().result.current.zoom).toBe(100);
  });

  it('should commit a new crop rect on the targeted paint when the slider changes', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0 }));

    const { result } = renderUseImageCropToolbar();

    act(() => result.current.onZoomChange(100));

    expect(readCrop(id)).toEqual({ height: 400, rotation: 0, width: 400, x: -100, y: -100 });
  });
});
