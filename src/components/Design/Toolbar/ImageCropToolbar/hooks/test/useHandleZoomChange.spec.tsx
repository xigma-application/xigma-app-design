import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { useHandleZoomChange } from '../useHandleZoomChange';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

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

const readNode = (id: string): TImageFrameNode => selectActivePage(store.getState()).nodes[id] as TImageFrameNode;

const readFills = (id: string): TImagePaint[] => readNode(id).fills as TImagePaint[];

describe('useHandleZoomChange', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    imagePaintTextureSizeCache.clear();
  });

  it('should commit a computed crop rect onto the targeted paint when called', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const node = readNode(id);

    const { result } = renderHook(() => useHandleZoomChange(node, paint, 0), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // before
    act(() => result.current(100));

    // result
    expect(readFills(id)[0].crop).toEqual({ height: 400, rotation: 0, width: 400, x: -100, y: -100 });
  });

  it('should do nothing when the node, paint, or paint index is missing', () => {
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const node = readNode(id);

    const { result } = renderHook(() => useHandleZoomChange(undefined, paint, 0), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // before
    act(() => result.current(100));

    // result
    expect(readFills(id)[0].crop).toBeUndefined();

    const { result: resultNoPaintIndex } = renderHook(() => useHandleZoomChange(node, paint, undefined), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // before
    act(() => resultNoPaintIndex.current(100));

    // result
    expect(readFills(id)[0].crop).toBeUndefined();
  });
});
